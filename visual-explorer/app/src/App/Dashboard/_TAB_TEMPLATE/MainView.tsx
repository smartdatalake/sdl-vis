import * as React from 'react';
import styled from 'styled-components';
import LeftPanel from 'App/Dashboard/_TAB_TEMPLATE/LeftPanel/LeftPanel';
import VisualizationPanel from 'App/Dashboard/_TAB_TEMPLATE/VisualizationPanel/VisualizationPanel';
import RightPanel from 'App/Dashboard/_TAB_TEMPLATE/RightPanel/RightPanel';

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
    return (
        <MainViewContainer>
            <HorizontalContainer>
                <LeftPanel />
                <VisualizationPanel />
                <RightPanel />
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default MainView;
