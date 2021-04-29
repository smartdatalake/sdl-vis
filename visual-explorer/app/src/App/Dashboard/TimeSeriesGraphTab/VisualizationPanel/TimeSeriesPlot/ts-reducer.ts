import { TimeSeries } from 'types/TimeSeries';
import { TimePoint } from 'types/TimePoint';

type TsReducerFn = (
    ts: TimeSeries,
    accessor: (_tp: TimePoint) => number,
    reducer: (..._v: number[]) => number
) => number;

type TsArrayReducerFn = (
    tsa: TimeSeries[],
    accessor: (_tp: TimePoint) => number,
    reducer: (..._v: number[]) => number
) => number;

export const tsReducer: TsReducerFn = (ts, accessor, reducer) => reducer(...ts.timePoints.map(accessor));

export const tsArrayReducer: TsArrayReducerFn = (tsa, accessor, reducer) =>
    reducer(...tsa.map((ts) => tsReducer(ts, accessor, reducer)));
