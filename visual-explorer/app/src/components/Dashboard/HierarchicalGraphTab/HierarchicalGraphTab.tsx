import React from 'react';
import DataPofilingPanel from 'components/Dashboard/HierarchicalGraphTab/panels/data-pofiling-panel';
import ParameterTuningPanel from 'components/Dashboard/HierarchicalGraphTab/panels/parameter-tuning-panel';
import GraphQueryWrapper from 'components/Dashboard/HierarchicalGraphTab/graph/graph-query-wrapper';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './HierarchicalGraphTab.scss';

interface Props {
    store: Store<IApplicationState>;
}

const HierarchicalGraphTab = (props: Props) => {
    console.log('HierarchicalGraphTab.render()');

    return (
        <div className={'hierarchical-graph-tab'}>
            <div style={{ position: 'relative' }}>
                <DataPofilingPanel />
                <ParameterTuningPanel store={props.store} />
            </div>

            <GraphQueryWrapper store={props.store} />
        </div>
    );
};

export default HierarchicalGraphTab;
