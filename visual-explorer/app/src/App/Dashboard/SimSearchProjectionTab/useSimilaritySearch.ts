import { cloneDeep } from 'lodash';
import { useContext, useEffect, useState } from 'react';
import SimilaritySearchContext from './Context';
import { ProjectionAlgorithm, ProjectionParameters } from 'types/SimSearch/ProjectionParameters';
import { defaultProjectionParameters } from './Provider';
import { permuteSearchParameterWeight } from './SearchParameters';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import { SearchColumn } from 'types/SimSearch/SearchColumn';
import { SearchParameters, VaryingSearchParameters } from 'types/SimSearch/SearchParameters';
import { SimilarityGraph } from 'types/SimSearch/SimilarityGraph';
import { Promise } from 'bluebird';

export type SimilaritySearchStates = {
    [key: string]: VaryingSimilarityGraphs;
} & {
    current: SimilarityGraph;
};

interface VaryingResponses {
    decreased?: Promise<SimilarityGraph[]>;
    increased?: Promise<SimilarityGraph[]>;
}

export interface VaryingSimilarityGraphs {
    decreased?: SimilarityGraph;
    increased?: SimilarityGraph;
}

// TODO: Make this local
const resultCount: { [key: string]: number } = {};
let callsMade = 0;

// const endpoint = 'simsearch';
// const host = VISUAL_ANALYTICS_ENGINE;
// const userAgent = 'frontend';
// const client = new RestClient(userAgent, host);

const useSimilaritySearch = () => {
    const [similaritySearchStates, setSimilaritySearchStates] = useState<SimilaritySearchStates>();
    const {
        projectionParameters,
        searchParameters,
        setIsLoading,
        setSearchParameters,
        setPossibleParameter,
        newQueryResults,
        setNewQueryResults,
    } = useContext(SimilaritySearchContext);

    useEffect(() => {
        const columnsPromise = new Promise<SearchColumn[]>((resolve, reject) =>
            BackendQueryEngine.simsearchColumns().then(resolve).catch(reject)
        );

        columnsPromise.then((columns) => {
            setPossibleParameter(columns);
            setSearchParameters(
                columns.reduce((acc: SearchParameters, curr: SearchColumn) => {
                    acc[curr.column] = {
                        active: false,
                        value: '',
                        weights: [0.5],
                        ...curr,
                    };
                    return acc;
                }, {}) as SearchParameters
            );
        });

        return () => columnsPromise.cancel();
    }, []);

    useEffect(() => {
        if (!projectionParameters || !searchParameters) return;

        if (!newQueryResults) return;
        else setNewQueryResults(false);

        setIsLoading(true);

        const requestParameters: {
            attributes: SearchParameters | VaryingSearchParameters;
            projection: ProjectionParameters;
        } = {
            attributes: searchParameters,
            projection: {
                type: projectionParameters.type,
                k: projectionParameters.k,
            },
        };

        if (projectionParameters.type === ProjectionAlgorithm.MDS) {
            requestParameters.projection.epsilon =
                projectionParameters.epsilon === undefined
                    ? defaultProjectionParameters.epsilon
                    : projectionParameters.epsilon;
            requestParameters.projection.maxIter =
                projectionParameters.maxIter === undefined
                    ? defaultProjectionParameters.maxIter
                    : projectionParameters.maxIter;
        }

        const newSimilaritySearchStates = {} as unknown as SimilaritySearchStates;
        const responses: Promise<SimilarityGraph[] | undefined>[] = [];
        const permutedParameters: (string | undefined)[] = [];

        Array.from(
            permuteSearchParameterWeight(
                Object.keys(searchParameters).reduce((acc, curr) => {
                    if (searchParameters[curr].active) (acc as SearchParameters)[curr] = searchParameters[curr];
                    return acc;
                }, {})
            )
        ).forEach(([permutedParameter, searchParametersPermutation]) => {
            if (permutedParameter === undefined) {
                requestParameters.attributes = searchParametersPermutation;

                responses.push(BackendQueryEngine.simsearchSearch(searchParameters, projectionParameters));
                // responses.push(client.create<[SimilarityGraph]>(endpoint, requestParameters));
                permutedParameters.push(permutedParameter);
            } else {
                const requests: VaryingResponses = {
                    decreased: undefined,
                    increased: undefined,
                };
                const varyingSearchParameters = searchParametersPermutation as VaryingSearchParameters;

                newSimilaritySearchStates[permutedParameter] = {
                    decreased: undefined,
                    increased: undefined,
                };

                if (varyingSearchParameters.decreased) {
                    const decreasedRequestParameters = cloneDeep(requestParameters);

                    decreasedRequestParameters.attributes = varyingSearchParameters.decreased;
                    requests.decreased = BackendQueryEngine.simsearchSearch(
                        decreasedRequestParameters.attributes,
                        decreasedRequestParameters.projection
                    );
                    // requests.decreased = client.create<[SimilarityGraph]>(endpoint, decreasedRequestParameters);
                }

                if (varyingSearchParameters.increased) {
                    const increasedRequestParameters = cloneDeep(requestParameters);

                    increasedRequestParameters.attributes = varyingSearchParameters.increased;
                    requests.increased = BackendQueryEngine.simsearchSearch(
                        increasedRequestParameters.attributes,
                        increasedRequestParameters.projection
                    );
                    // requests.increased = client.create<[SimilarityGraph]>(endpoint, increasedRequestParameters);
                }

                const immediatelyResolvedPromise: Promise<undefined> = new Promise((resolve) => resolve(undefined));

                responses.push(requests.decreased ? requests.decreased : immediatelyResolvedPromise);
                permutedParameters.push(permutedParameter);
                responses.push(requests.increased ? requests.increased : immediatelyResolvedPromise);
                permutedParameters.push(permutedParameter);
            }
        });

        /*
         * I abuse the circumstance that `Promise.all` preserves the order of the iterable `responses`. With that, I
         * know that the first response (i.e., `index === 0`) corresponds to the original parameters, while all
         * subsequent pairs of two responses belong to the parameter listed in `permutedParameters` with the same index.
         * For each pair, the request with decreased parameters appears before the one with increased parameters.
         */
        callsMade++;

        const allResponsePromise = Promise.all(responses);
        allResponsePromise.then((pairsOfGraphs) => {
            pairsOfGraphs.forEach((graphs: SimilarityGraph[] | undefined, index) => {
                if (graphs !== undefined) {
                    if (index === 0) {
                        graphs[0].points.forEach((point, idx) => {
                            if (Object.keys(resultCount).includes(point.id)) {
                                resultCount[point.id] += 1;
                            } else {
                                resultCount[point.id] = 1;
                            }
                            point.size = resultCount[point.id] / callsMade;
                            point.rank = idx === 0 ? 'q' : idx;
                        });
                        //console.log(response.result[0])
                        newSimilaritySearchStates.current = graphs[0];
                    } else {
                        const permutedParameter = permutedParameters[index] as string;

                        if (index % 2 === 1) {
                            newSimilaritySearchStates[permutedParameter].decreased = graphs[0];
                        } else {
                            newSimilaritySearchStates[permutedParameter].increased = graphs[0];
                        }
                    }
                } else {
                    setIsLoading(false);
                    newSimilaritySearchStates.current = { points: [], adjMat: [] };
                }
            });

            setSimilaritySearchStates(newSimilaritySearchStates);
            setIsLoading(false);
        });

        return () => allResponsePromise.cancel();
    }, [projectionParameters, searchParameters]);

    return similaritySearchStates;
};

export default useSimilaritySearch;
