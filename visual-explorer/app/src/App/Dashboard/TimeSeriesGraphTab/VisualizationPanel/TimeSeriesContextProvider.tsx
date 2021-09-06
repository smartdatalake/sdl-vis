import React, { PropsWithChildren } from 'react';
import {
    ITimeSeriesContext,
    TimeSeriesContext,
} from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesContext';

interface Props {
    nodeColorScale: ITimeSeriesContext['nodeColorScale'];
    linkColorScale: ITimeSeriesContext['linkColorScale'];
}

export const TimeSeriesContextProvider = ({ nodeColorScale, linkColorScale, children }: PropsWithChildren<Props>) => {
    return (
        <TimeSeriesContext.Provider
            value={{
                nodeColorScale,
                linkColorScale,
            }}
        >
            {children}
        </TimeSeriesContext.Provider>
    );
};
