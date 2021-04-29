import React from 'react';
import DataPofilingPanel from 'App/Dashboard/HierarchicalGraphTabOld/panels/data-pofiling-panel';
import ParameterTuningPanel from 'App/Dashboard/HierarchicalGraphTabOld/panels/parameter-tuning-panel';
import GraphQueryWrapper from 'App/Dashboard/HierarchicalGraphTabOld/graph/graph-query-wrapper';
import 'App/Dashboard/HierarchicalGraphTabOld/HierarchicalGraphTabOld.scss';

interface Props {}

const HierarchicalGraphTabOld = (props: Props) => {
    console.log('HierarchicalGraphTabOld.render()');

    return (
        <div className={'hierarchical-graph-tab'}>
            <div style={{ position: 'relative' }}>
                <DataPofilingPanel />
                <ParameterTuningPanel />
            </div>

            <GraphQueryWrapper />
        </div>
    );
};

export default HierarchicalGraphTabOld;
