import React from 'react';
import { ScaleOrdinal } from 'd3-scale';
import { scaleOrdinal } from '@visx/scale';
import { interpolateSpectral } from 'd3-scale-chromatic';

export interface ITimeSeriesContext {
    nodeColorScale: ScaleOrdinal<string, string>;
    linkColorScale: (t: number) => string;
}

const defaultContext: ITimeSeriesContext = {
    nodeColorScale: scaleOrdinal(),
    linkColorScale: interpolateSpectral,
};

export const TimeSeriesContext = React.createContext(defaultContext);
