import React from 'react';
import { ScaleOrdinal } from 'd3-scale';
import { scaleOrdinal } from '@visx/scale';
import { interpolateSpectral } from 'd3-scale-chromatic';

export interface IColorScaleContext {
    nodeColorScale: ScaleOrdinal<string, string>;
    linkColorScale: (t: number) => string;
}

const defaultContext: IColorScaleContext = {
    nodeColorScale: scaleOrdinal(),
    linkColorScale: interpolateSpectral,
};

export const ColorScaleContext = React.createContext(defaultContext);
