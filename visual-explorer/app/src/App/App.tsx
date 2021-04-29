import React from 'react';
import Dashboard from 'App/Dashboard';
import Header from 'App/Header';
import styled from 'styled-components';

const StyledDiv = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    align-content: stretch;
    height: 100vh;
`;

interface Props {}

const App: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <StyledDiv>
            <Header />
            <Dashboard />
        </StyledDiv>
    );
};

export default App;
