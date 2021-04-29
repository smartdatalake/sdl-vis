export interface TimeSeriesInformation {
    startDate: Date;
    endDate: Date;
    numDatapoints: number;
}

export interface TimeSeriesEntry extends TimeSeriesInformation {
    tsName: string;
}

export type TimeSeriesCatalog = Record<string, TimeSeriesInformation>;
