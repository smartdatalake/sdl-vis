import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './ProfilingTab.scss';
import { JUPYTER_LAB } from 'backend-urls';

interface Props {
    store: Store<IApplicationState>;
}

const ProfilingTab = (props: Props) => {
    return (
        <div className="profiling-wrapper">
            <iframe
                title="jupyterlab"
                className="jupyter-iframe"
                src={JUPYTER_LAB}
            />
        </div>
    );
};

export default ProfilingTab;
