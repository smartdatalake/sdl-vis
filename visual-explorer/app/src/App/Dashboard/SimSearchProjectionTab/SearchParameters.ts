import { cloneDeep } from 'lodash';
import { SearchParameters, VaryingSearchParameters } from 'types/SimSearch/SearchParameters';

const parameterWeightDelta = 0.2;

export function* permuteSearchParameterWeight(
    searchParameters: SearchParameters
): IterableIterator<[undefined, SearchParameters] | [string, VaryingSearchParameters]> {
    yield [undefined, searchParameters];

    for (const searchAttribute in searchParameters) {
        const decreasedSearchParameters = cloneDeep(searchParameters);
        const increasedSearchParameters = cloneDeep(searchParameters);

        const parameter = searchParameters[searchAttribute];
        const decreasedSearchParameter = decreasedSearchParameters[searchAttribute];
        const increasedSearchParameter = increasedSearchParameters[searchAttribute];

        if (parameter === undefined || decreasedSearchParameter === undefined || increasedSearchParameter === undefined)
            continue;

        const weight = parameter.weights[0];
        const delta = weight === 0.1 || weight === 0.9 ? parameterWeightDelta / 2 : parameterWeightDelta;

        decreasedSearchParameter.weights = [Number((weight - delta).toFixed(1))];
        increasedSearchParameter.weights = [Number((weight + delta).toFixed(1))];

        if (weight === 0) {
            yield [
                searchAttribute,
                {
                    increased: increasedSearchParameters,
                },
            ];
        } else if (weight === 1) {
            yield [
                searchAttribute,
                {
                    decreased: decreasedSearchParameters,
                },
            ];
        } else {
            yield [
                searchAttribute,
                {
                    decreased: decreasedSearchParameters,
                    increased: increasedSearchParameters,
                },
            ];
        }
    }
}
