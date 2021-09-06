import { SearchColumn, SearchColumnValue } from 'types/SimSearch/SearchColumn';

export type SearchParameters = {
    [key: string]: SearchParameterValue;
};

export interface SearchParameterValue extends SearchColumn {
    active: boolean;
    value: SearchColumnValue;
    weights: number[];
}

export type VaryingSearchParameters = {
    decreased?: SearchParameters;
    increased?: SearchParameters;
};
