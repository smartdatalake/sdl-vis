import * as React from 'react';
import styled from 'styled-components';
import HierachicalGraphVisSVG from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVisSVG';
import { GraphSettings } from 'types/GCoreHierachicalGraph/GraphSettings';

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

interface Props {
    graphSettings: GraphSettings;
}

const VisualizationPanel = (props: Props) => {
    return (
        <ScrollContainer>
            <InspectionPanelContainer>
                <HierachicalGraphVisSVG {...props} />
            </InspectionPanelContainer>
        </ScrollContainer>
    );
};

export default VisualizationPanel;
