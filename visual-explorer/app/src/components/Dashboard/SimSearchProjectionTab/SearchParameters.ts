import { cloneDeep } from 'lodash';

export enum SearchParameterName {
    EMPLOYEES = 'employees',
    KEYWORDS = 'keywords',
    LOCATION = 'location',
    REVENUE = 'revenue',
}

export type SearchParameters = {
    [parameter in SearchParameterName]: SearchParameterValue;
};

export interface SearchParameterValue {
    active: boolean;
    value: number | string | string[];
    weights: number[];
}

export type VaryingSearchParameters = {
    decreased?: SearchParameters;
    increased?: SearchParameters;
};

const parameterWeightDelta = 0.2;

export function* permuteSearchParameterWeight(
    searchParameters: SearchParameters
): IterableIterator<
    | [undefined, SearchParameters]
    | [SearchParameterName, VaryingSearchParameters]
> {
    yield [undefined, searchParameters];

    for (const searchAttribute of Object.values(SearchParameterName)) {
        const decreasedSearchParameters = cloneDeep(searchParameters);
        const increasedSearchParameters = cloneDeep(searchParameters);

        const parameter =
            searchParameters[searchAttribute as SearchParameterName];
        const decreasedSearchParameter =
            decreasedSearchParameters[searchAttribute as SearchParameterName];
        const increasedSearchParameter =
            increasedSearchParameters[searchAttribute as SearchParameterName];

        if (
            parameter === undefined ||
            decreasedSearchParameter === undefined ||
            increasedSearchParameter === undefined
        )
            continue;

        const weight = parameter.weights[0];
        const delta =
            weight === 0.1 || weight === 0.9
                ? parameterWeightDelta / 2
                : parameterWeightDelta;

        decreasedSearchParameter.weights = [
            Number((weight - delta).toFixed(1)),
        ];
        increasedSearchParameter.weights = [
            Number((weight + delta).toFixed(1)),
        ];

        if (weight === 0) {
            yield [
                searchAttribute as SearchParameterName,
                {
                    increased: increasedSearchParameters,
                },
            ];
        } else if (weight === 1) {
            yield [
                searchAttribute as SearchParameterName,
                {
                    decreased: decreasedSearchParameters,
                },
            ];
        } else {
            yield [
                searchAttribute as SearchParameterName,
                {
                    decreased: decreasedSearchParameters,
                    increased: increasedSearchParameters,
                },
            ];
        }
    }
}
