import { TimePoint } from 'types/TimePoint';
import { SimulationNodeDatum } from 'd3';

export interface TimeSeries {
    id: string;
    name: string;
    timePoints: TimePoint[];
}

export type TimeSeriesSimulationNode = TimeSeries & SimulationNodeDatum;
