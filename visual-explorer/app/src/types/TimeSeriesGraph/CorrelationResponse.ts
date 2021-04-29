import { Matrix } from 'mathjs';
import { TimeSeriesEntry } from 'types/TimeSeriesGraph/TimeSeriesCatalog';

export interface CorrelationResponse {
    timeseries: TimeSeriesEntry[];
    correlations: Matrix[];
    meanCorrelation: Matrix;
    meanAbsCorrelation: Matrix;
}

export const EMPTY_CORRELATION_RESPONSE = {
    timeseries: [],
    correlations: [],
};
