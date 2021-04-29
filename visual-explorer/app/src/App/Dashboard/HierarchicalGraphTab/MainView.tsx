import * as React from 'react';
import styled from 'styled-components';
import SettingsPanel from 'App/Dashboard/HierarchicalGraphTab/SettingsPanel/SettingsPanel';
import VisualizationPanel from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/VisualizationPanel';
import { GraphSettings } from 'types/GCoreHierachicalGraph/GraphSettings';

const MainViewContainer = styled.div`
    background-color: #eee;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    //justify-content: flex-start;
    align-items: stretch;
    align-content: stretch;
`;

const HorizontalContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-grow: 1;
`;

interface Props {}

const MainView: React.FunctionComponent<Props> = (props: Props) => {
    const [graphSettings, setGraphSettings] = React.useState<GraphSettings>();

    return (
        <MainViewContainer>
            <HorizontalContainer>
                <SettingsPanel applySettings={setGraphSettings} />
                {graphSettings && <VisualizationPanel graphSettings={graphSettings} />}
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default MainView;
