import React from 'react';
import styled from 'styled-components';
import { Spinner } from 'react-bootstrap';

const CenterDiv = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledTable = styled.table`
    border: none;

    td {
        text-align: center;
        vertical-align: middle;
    }
`;

interface Props {}

const LoadingMessage: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <CenterDiv>
            <StyledTable>
                <tr>
                    <td>
                        <Spinner animation="border" variant="primary" />
                    </td>
                </tr>
                <tr>
                    <td>Loading data from backend.</td>
                </tr>
            </StyledTable>
        </CenterDiv>
    );
};

export default LoadingMessage;
