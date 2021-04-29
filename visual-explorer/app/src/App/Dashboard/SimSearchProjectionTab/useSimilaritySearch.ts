import { cloneDeep } from 'lodash';
import { useContext, useState } from 'react';
import { HttpCodes } from 'typed-rest-client/HttpClient';
import { IRestResponse, RestClient } from 'typed-rest-client/RestClient';
import SimilaritySearchContext from './Context';
import { Node, WeightedEdge } from './Projection/ProjectionSVG';
import { ProjectionAlgorithm } from './ProjectionParameters';
import { defaultProjectionParameters } from './Provider';
import {
    permuteSearchParameterWeight,
    SearchParameters,
    VaryingSearchParameters,
    PossibleSearchParameter,
} from './SearchParameters';
import { VISUAL_ANALYTICS_ENGINE } from 'backend-urls';
import { useAsync } from 'react-use';

export type SimilaritySearchStates = {
    [key: string]: VaryingSimilarityGraphs;
} & {
    current: SimilarityGraph;
};

export interface SimilarityGraph {
    adjMat: WeightedEdge[];
    points: Node[];
}

interface VaryingResponses {
    decreased?: Promise<IRestResponse<[SimilarityGraph]>>;
    increased?: Promise<IRestResponse<[SimilarityGraph]>>;
}

export interface VaryingSimilarityGraphs {
    decreased?: SimilarityGraph;
    increased?: SimilarityGraph;
}

// TODO: Make this local
const resultCount: { [key: string]: number } = {};
let callsMade = 0;

const endpoint = 'simsearch';
const host = VISUAL_ANALYTICS_ENGINE;
const userAgent = 'frontend';
const client = new RestClient(userAgent, host);

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

    useAsync(async () => {
        const res = await client.get<PossibleSearchParameter[]>(endpoint + '/columns', {});
        setPossibleParameter(res.result);
        setSearchParameters(
            res.result?.reduce((acc: SearchParameters, curr: PossibleSearchParameter) => {
                acc[curr.column] = {
                    active: false,
                    value: '',
                    weights: [0.5],
                    datatype: curr.datatype,
                    sampleValue: curr.sampleValue,
                };
                return acc;
            }, {}) as SearchParameters
        );
    });

    useAsync(async () => {
        if (!projectionParameters || !searchParameters) return;

        if (!newQueryResults) return;
        else setNewQueryResults(false);

        setIsLoading(true);

        const requestParameters: {
            attributes: SearchParameters | VaryingSearchParameters;
            projection: {
                type: ProjectionAlgorithm;
                k?: number;
                epsilon?: number;
                maxIter?: number;
            };
        } = {
            attributes: searchParameters,
            projection: {
                type: projectionParameters.algorithm,
                k: projectionParameters.k,
            },
        };

        if (projectionParameters.algorithm === ProjectionAlgorithm.MDS) {
            requestParameters.projection.epsilon =
                projectionParameters.epsilon === undefined
                    ? defaultProjectionParameters.epsilon
                    : projectionParameters.epsilon;
            requestParameters.projection.maxIter =
                projectionParameters.maximumIterations === undefined
                    ? defaultProjectionParameters.maximumIterations
                    : projectionParameters.maximumIterations;
        }

        const newSimilaritySearchStates = ({} as unknown) as SimilaritySearchStates;
        const responses: (Promise<IRestResponse<[SimilarityGraph]>> | Promise<undefined>)[] = [];
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

                responses.push(client.create<[SimilarityGraph]>(endpoint, requestParameters));
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
                    requests.decreased = client.create<[SimilarityGraph]>(endpoint, decreasedRequestParameters);
                }

                if (varyingSearchParameters.increased) {
                    const increasedRequestParameters = cloneDeep(requestParameters);

                    increasedRequestParameters.attributes = varyingSearchParameters.increased;
                    requests.increased = client.create<[SimilarityGraph]>(endpoint, increasedRequestParameters);
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

        (await Promise.all(responses)).forEach((response, index) => {
            if (response && response.statusCode === HttpCodes.OK && response.result) {
                if (index === 0) {
                    response.result[0].points.forEach((point, idx) => {
                        if (Object.keys(resultCount).includes(point.id)) {
                            resultCount[point.id] += 1;
                        } else {
                            resultCount[point.id] = 1;
                        }
                        point.size = resultCount[point.id] / callsMade;
                        point.rank = idx === 0 ? 'q' : idx;
                    });
                    //console.log(response.result[0])
                    newSimilaritySearchStates.current = response.result[0];
                } else {
                    const permutedParameter = permutedParameters[index] as string;

                    if (index % 2 === 1) {
                        newSimilaritySearchStates[permutedParameter].decreased = response.result[0];
                    } else {
                        newSimilaritySearchStates[permutedParameter].increased = response.result[0];
                    }
                }
            } else {
                setIsLoading(false);
                newSimilaritySearchStates.current = { points: [], adjMat: [] };
            }
        });

        setSimilaritySearchStates(newSimilaritySearchStates);
        setIsLoading(false);
    }, [projectionParameters, searchParameters]);

    return similaritySearchStates;
};

export default useSimilaritySearch;