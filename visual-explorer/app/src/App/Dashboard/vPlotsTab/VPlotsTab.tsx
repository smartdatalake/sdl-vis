import React from 'react';
import './VPlotsTab.scss';
import { V_PLOTS } from 'backend-urls';
import { StyledIFrame } from '../StyledIFrame';

interface Props {}

const VPlotsTab = (props: Props) => {
    return (
        <div className="v-plots-wrapper">
            <StyledIFrame title="vplots" className="v-plots-iframe" src={V_PLOTS} style={{ height: '100%' }} />
        </div>
    );
};

export default VPlotsTab;
