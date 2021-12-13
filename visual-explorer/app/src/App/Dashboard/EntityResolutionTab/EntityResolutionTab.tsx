import * as React from 'react';
import styled from 'styled-components';
import LeftPanel from 'App/Dashboard/EntityResolutionTab/LeftPanel/LeftPanel';
import VisualizationPanel from 'App/Dashboard/EntityResolutionTab/VisualizationPanel/VisualizationPanel';

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

const EntityResolutionTab: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <MainViewContainer>
            <HorizontalContainer>
                <LeftPanel />
                <VisualizationPanel />
            </HorizontalContainer>
        </MainViewContainer>
    );
};

export default EntityResolutionTab;
