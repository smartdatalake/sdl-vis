import * as React from 'react';
import styled from 'styled-components';
import SettingsPanel from 'App/Dashboard/TimeSeriesGraphTab/SettingsPanel/SettingsPanel';
import VisualizationPanel from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/VisualizationPanel';
import BackendQueryEngine from 'backend/BackendQueryEngine';
import { TimeSeriesGraphSettings } from 'types/TimeSeriesGraph/TimeSeriesGraphSettings';
import { useState } from 'react';
import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { DEFAULT_CORRELATION_RESPONSE } from 'App/Dashboard/TimeSeriesGraphTab/DEBUG_DefaultCorrelationResponse';

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
    const [correlations, setCorrelations] = useState<CorrelationResponse>(DEFAULT_CORRELATION_RESPONSE);

    const onSettingsApply = (s: TimeSeriesGraphSettings) => {
        BackendQueryEngine.timeseriesCorrelation(s).then(
            (correlationResponse) => {
                console.log(correlationResponse);
                setCorrelations(correlationResponse);
            },
            (reason) => {
                console.error(reason);
            }
        );
    };

    return (
        <MainViewContainer>
            <HorizontalContainer>
                <SettingsPanel onSettingsApply={onSettingsApply} />
                {correlations && <VisualizationPanel key={Math.random()} correlations={correlations} />}
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default MainView;
