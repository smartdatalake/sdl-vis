import { Matrix } from 'mathjs';
import { TimeSeriesInformation } from 'types/TimeSeriesGraph/TimeSeriesCatalog';

export interface TimePoint {
    date: Date;
    value: number;
}

export interface CorrelationTimeSeriesEntry extends TimeSeriesInformation {
    tsName: string;
    rawDatapoints: TimePoint[];
}

export interface CorrelationResponse {
    timeseries: CorrelationTimeSeriesEntry[];
    correlations: Matrix[];
    meanCorrelation: Matrix;
    meanAbsCorrelation: Matrix;
}
