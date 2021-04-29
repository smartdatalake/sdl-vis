import React from 'react';
import styled from 'styled-components';
import ProjectionSVG from './Projection/ProjectionSVG';
import ProjectionPanel from './ProjectionPanel/ProjectionPanel';
import Provider from './Provider';

const Tab = styled.div`
    display: flex;
    flex-grow: 1;
    height: inherit;
    position: relative;
`;

const SimilaritySearchTab = () => (
    <Provider>
        <Tab>
            <ProjectionPanel />
            <ProjectionSVG />
        </Tab>
    </Provider>
);

export default SimilaritySearchTab;
