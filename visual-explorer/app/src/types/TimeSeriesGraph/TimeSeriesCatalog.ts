export interface TimeSeriesInformation {
    startDate: Date;
    endDate: Date;
    numDatapoints: number;
}

export type TimeSeriesCatalog = Record<string, TimeSeriesInformation>;
