import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import TimeSeriesPanel from './panels/timeseries-parameters';

import './TimeSeriesTab.scss';
import TimeSeriesWrapper from './timeseries/timeseries-wrapper';

interface Props {
    store: Store<IApplicationState>;
}

const TimeSeriesTab = (props: Props) => {
    return (
        <div className={'timeseries-tab'}>
            <div style={{ position: 'relative' }}>
                <TimeSeriesPanel store={props.store} />
            </div>

            <TimeSeriesWrapper store={props.store} />
        </div>
    );
};

export default TimeSeriesTab;
