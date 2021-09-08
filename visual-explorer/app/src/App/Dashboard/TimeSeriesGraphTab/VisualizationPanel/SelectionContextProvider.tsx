import React, { ReactNode, useState } from 'react';

import { SelectionContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/SelectionContext';
import produce from 'immer';

export const SelectionContextProvider = ({ children }: { children: ReactNode }) => {
    const [selectedTimeseries, setSelectedTimeseries] = useState<string[]>([]);

    const toggleTimeseriesSelection = (ts: string) => {
        if (selectedTimeseries.includes(ts)) {
            setSelectedTimeseries((prevState) =>
                produce(prevState, (draftState) => draftState.filter((v) => v !== ts))
            );
        } else {
            setSelectedTimeseries((prevState) =>
                produce(prevState, (draftState) => {
                    if (draftState.length >= 2) {
                        draftState[1] = ts;
                    } else {
                        draftState.push(ts);
                    }
                })
            );
        }
    };

    const isTimeseriesSelected = (ts: string) => selectedTimeseries.includes(ts);

    return (
        <SelectionContext.Provider
            value={{
                selectedTimeseries,
                toggleTimeseriesSelection,
                isTimeseriesSelected,
            }}
        >
            {children}
        </SelectionContext.Provider>
    );
};
