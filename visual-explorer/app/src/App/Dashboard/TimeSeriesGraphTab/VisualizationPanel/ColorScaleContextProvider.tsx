import React, { PropsWithChildren } from 'react';
import {
    IColorScaleContext,
    ColorScaleContext,
} from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/ColorScaleContext';

interface Props {
    nodeColorScale: IColorScaleContext['nodeColorScale'];
    linkColorScale: IColorScaleContext['linkColorScale'];
}

export const ColorScaleContextProvider = ({ nodeColorScale, linkColorScale, children }: PropsWithChildren<Props>) => {
    return (
        <ColorScaleContext.Provider
            value={{
                nodeColorScale,
                linkColorScale,
            }}
        >
            {children}
        </ColorScaleContext.Provider>
    );
};
