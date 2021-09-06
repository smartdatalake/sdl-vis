import { CorrelationTimeSeriesEntry, TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';

type TsReducerFn = (
    ts: CorrelationTimeSeriesEntry,
    accessor: (_tp: TimePoint) => number,
    reducer: (..._v: number[]) => number
) => number;

type TsArrayReducerFn = (
    tsa: CorrelationTimeSeriesEntry[],
    accessor: (_tp: TimePoint) => number,
    reducer: (..._v: number[]) => number
) => number;

export const tsReducer: TsReducerFn = (ts, accessor, reducer) => reducer(...ts.rawDatapoints.map(accessor));

export const tsArrayReducer: TsArrayReducerFn = (tsa, accessor, reducer) =>
    reducer(...tsa.map((ts) => tsReducer(ts, accessor, reducer)));
