import React from 'react';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import ProjectionPanel from './panels/projection-parameters';
import MDSTuningPanel from './panels/mds-tuning-panel';
import ProjWrapper from './projection/projection-wrapper';
import './SimSearchProjectionTab.scss';

interface Props {
    store: Store<IApplicationState>;
    type: string;
}

const SimSearchProjectionTab = (props: Props) => {
    const whichPanel = (type: string) => {
        switch (type) {
            case 'mds':
                return <MDSTuningPanel store={props.store} />;
            default:
                return null;
        }
    };
    const panel = whichPanel(props.type);

    return (
        <div className={'projection-tab'}>
            <div style={{ position: 'relative' }}>
                <ProjectionPanel store={props.store} />
                {panel}
            </div>

            <ProjWrapper store={props.store} />
        </div>
    );
};

const mapStateToProps = ({ projParametersState }: IApplicationState) => ({
    type: projParametersState.type,
});

export default connect(mapStateToProps)(SimSearchProjectionTab);
