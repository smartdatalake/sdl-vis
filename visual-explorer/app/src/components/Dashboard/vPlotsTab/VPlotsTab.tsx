import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './VPlotsTab.scss';
import { V_PLOTS } from 'backend-urls';

interface Props {
    store: Store<IApplicationState>;
}

const VPlotsTab = (props: Props) => {
    return (
        <div className="v-plots-wrapper">
            <iframe title="vplots" className="v-plots-iframe" src={V_PLOTS} />
        </div>
    );
};

export default VPlotsTab;
