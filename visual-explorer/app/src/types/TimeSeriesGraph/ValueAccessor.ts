import { TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';

export type ValueAccessor = (v: TimePoint) => number;
