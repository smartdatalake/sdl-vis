import * as React from 'react';
import styled from 'styled-components';
import SettingsPanel from 'App/Dashboard/TimeSeriesGraphTab/SettingsPanel/SettingsPanel';
import VisualizationPanel from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/VisualizationPanel';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import { TimeSeriesGraphSettings } from 'types/TimeSeriesGraph/TimeSeriesGraphSettings';
import { useState } from 'react';
import {
    constructTSCorrelationGraph,
    TimeSeriesCorrelationGraph,
} from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';

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
    const [tsCorrelationGraph, setTsCorrelationGraph] = useState<TimeSeriesCorrelationGraph>();

    const onSettingsApply = (s: TimeSeriesGraphSettings) => {
        BackendQueryEngine.timeseriesCorrelation(s).then((correlationResponse) => {
            console.log(correlationResponse);
            correlationResponse.correlations[0].set([0, 0], NaN);
            setTsCorrelationGraph(constructTSCorrelationGraph(correlationResponse));
        });
    };

    return (
        <MainViewContainer>
            <HorizontalContainer>
                <SettingsPanel onSettingsApply={onSettingsApply} />
                {tsCorrelationGraph && <VisualizationPanel correlationGraph={tsCorrelationGraph} />}
                {/*<RightPanel />*/}
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default MainView;
