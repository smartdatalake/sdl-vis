import * as React from 'react';
import styled from 'styled-components';
import SetGraphs from '../graph/set-graphs';
import GGDResultTable from '../graph/er-result-panel';
import ConstructQueryPanelWrapper from '../graph/construct-query-panel';
import GGDsPanelWrapper from '../graph/set-ggds-panel-wrapper';
import SetGGDsFilePanel from '../graph/set-ggds-files';
import { Card } from 'react-bootstrap';

interface Props {}

const ScrollContainer = styled.div`
    flex-grow: 1;

    display: block;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;

    background: #e5e7ea;
`;

const InspectionPanelContainer = styled.div`
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

const VisualizationPanel = (props: Props) => {
    return (
        <ScrollContainer>
            <InspectionPanelContainer>
                <SettingsCard>
                    <SettingsCardHeader>Generate Target Graph</SettingsCardHeader>
                    <SettingsCardBody>
                        <SetGraphs />
                    </SettingsCardBody>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>Set GGDs</SettingsCardHeader>
                    <SettingsCardBody>
                        <GGDsPanelWrapper />
                    </SettingsCardBody>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>Set GGDs Using a JSON File</SettingsCardHeader>
                    <SettingsCardBody>
                        <SetGGDsFilePanel />
                    </SettingsCardBody>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>sHINNER Result</SettingsCardHeader>
                    <SettingsCardBody>
                        <GGDResultTable />
                    </SettingsCardBody>
                </SettingsCard>
                <SettingsCard>
                    <SettingsCardHeader>Construct Query Panel</SettingsCardHeader>
                    <SettingsCardBody>
                        <ConstructQueryPanelWrapper />
                    </SettingsCardBody>
                </SettingsCard>
                {/*<VisualizationSVG />*/}
            </InspectionPanelContainer>
        </ScrollContainer>
    );
};

export default VisualizationPanel;
