import React from 'react';
import './ProfilingTab.scss';
import { JUPYTER_LAB } from 'backend-urls';
import { StyledIFrame } from '../StyledIFrame';

interface Props {}

const ProfilingTab = (props: Props) => {
    return (
        <div className="profiling-wrapper">
            <StyledIFrame title="jupyterlab" className="jupyter-iframe" src={JUPYTER_LAB} />
        </div>
    );
};

export default ProfilingTab;
