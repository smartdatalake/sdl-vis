import * as React from 'react';
import styled from 'styled-components';
import SettingsPanel from 'App/Dashboard/HierarchicalGraphTab/SettingsPanel/SettingsPanel';
import { GraphSettings } from 'types/GCoreHierachicalGraph/GraphSettings';
import { DataArray } from 'types/DataArray';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import HierachicalGraphVisSVG from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVisSVG';

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
    const [graphData, setGraphData] = React.useState<DataArray>();

    React.useEffect(() => {
        if (graphSettings !== undefined) {
            BackendQueryEngine.gcoreGraphvisInit(graphSettings).then((graphDataResponse) => {
                setGraphData(graphDataResponse);
            });
        }
    }, [graphSettings]);

    return (
        <MainViewContainer>
            <HorizontalContainer>
                <SettingsPanel applySettings={setGraphSettings} />
                {graphData && <HierachicalGraphVisSVG graphData={graphData} />}
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default MainView;
