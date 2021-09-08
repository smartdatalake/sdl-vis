import React from 'react';

export interface ISelectionContext {
    selectedTimeseries: string[];
    toggleTimeseriesSelection: (ts: string) => void;
    isTimeseriesSelected: (ts: string) => boolean;
}

const defaultContext: ISelectionContext = {
    selectedTimeseries: [],
    toggleTimeseriesSelection: () => {
        // Initial value. Replaced by context provider.
    },
    isTimeseriesSelected: () => {
        // Initial value. Replaced by context provider.
        return false;
    },
};

export const SelectionContext = React.createContext(defaultContext);
