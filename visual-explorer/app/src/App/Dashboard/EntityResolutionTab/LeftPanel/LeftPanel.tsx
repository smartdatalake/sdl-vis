import React from 'react';
import styled from 'styled-components';
import { Card } from 'react-bootstrap';
import GraphdbPanelWrapper from '../graph/graphdb-panel-wrapper';

const ScrollContainer = styled.div`
    flex: 0 0 300px;

    display: block;
    position: relative;
    overflow-y: auto;

    box-shadow: 0 0 10px var(--dark);
    z-index: 1000;

    background: var(--light);
`;

const PanelContainer = styled.div`
    padding: 10px;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`;

const SettingsCard = styled(Card)`
    margin-bottom: 20px !important;

    &:last-child {
        margin-bottom: 0;
    }
`;

const SettingsCardHeader = styled(Card.Header)`
    justify-content: center;
`;

const SettingsCardBody = styled(Card.Body)``;

interface Props {}

const LeftPanel = (props: Props) => {
    return (
        <ScrollContainer>
            <PanelContainer className={'no-select'}>
                <SettingsCard>
                    <SettingsCardHeader>Available Graphs</SettingsCardHeader>
                    <SettingsCardBody>
                        <GraphdbPanelWrapper />
                    </SettingsCardBody>
                </SettingsCard>
            </PanelContainer>
        </ScrollContainer>
    );
};

export default LeftPanel;
