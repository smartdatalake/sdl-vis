export enum SearchColumnDataType {
    NUMBER = 'NUMBER',
    GEOLOCATION = 'GEOLOCATION',
    DATE_TIME = 'DATE_TIME',
    KEYWORD_SET = 'KEYWORD_SET',
}

export type SearchColumnValue = string | number | Array<string | number>;

export interface SearchColumn {
    operation: string;
    datatype: SearchColumnDataType;
    sampleValue: SearchColumnValue;
    column: string;
}
