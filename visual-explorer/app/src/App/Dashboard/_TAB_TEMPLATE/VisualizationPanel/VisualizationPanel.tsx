import * as React from 'react';
import styled from 'styled-components';
import VisualizationSVG from 'App/Dashboard/_TAB_TEMPLATE/VisualizationPanel/VisualizationSVG';

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

const VisualizationPanel = (props: Props) => {
    return (
        <ScrollContainer>
            <InspectionPanelContainer>
                <VisualizationSVG />
            </InspectionPanelContainer>
        </ScrollContainer>
    );
};

export default VisualizationPanel;
