import React, { useEffect, useMemo, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import styled from 'styled-components';

interface Props {
    onToggleHandler?: (toggled: boolean) => void;
}

const StyledCol = styled(Col)`
    padding: 0 !important;

    &:first-child {
        margin-right: 12px;
    }

    &:last-child {
        margin-left: 4px;
    }
`;

const StyledFormLabel = styled(Form.Label)`
    padding: 0 !important;
    margin: 0 !important;
`;

const ToggleAbsoluteWeightsSwitch: React.FunctionComponent<Props> = ({ onToggleHandler }: Props) => {
    const [isChecked, setIsChecked] = useState(true);

    const onChangeHandler = useMemo(
        () => (e: React.ChangeEvent<HTMLInputElement>) => {
            setIsChecked(e.target.checked);
        },
        []
    );

    useEffect(() => {
        onToggleHandler && onToggleHandler(isChecked);
    }, [isChecked, onToggleHandler]);

    return (
        <>
            <Form>
                <Container>
                    <Row className={'align-items-center  align-self-center'}>
                        <StyledCol xs="auto">
                            <StyledFormLabel>Original Correlations</StyledFormLabel>
                        </StyledCol>
                        <StyledCol xs="auto">
                            <Form.Switch id="switch-absolute-weights" onChange={onChangeHandler} checked={isChecked} />
                        </StyledCol>
                        <StyledCol xs="auto">
                            <StyledFormLabel>Absolute Correlations</StyledFormLabel>
                        </StyledCol>
                    </Row>
                </Container>
            </Form>
        </>
    );
};

export default ToggleAbsoluteWeightsSwitch;
