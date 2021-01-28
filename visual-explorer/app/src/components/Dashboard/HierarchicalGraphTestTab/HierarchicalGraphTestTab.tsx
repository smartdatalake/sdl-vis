import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './HierarchicalGraphTestTab.scss';
import SetParamsPanel from "./panels/setparams-panel";
import {Card, Col, Container, Row} from "react-bootstrap";
import {Network} from "vis-network";

interface Props {
    store: Store<IApplicationState>;
}

const HierarchicalGraphTestTab = (props: Props) => {
    console.log('Hierarchical Graph Tab Test Param');

    return (
        <div className={'htest-graph'}>
            <div  style={{ position: 'relative' }}>
                <Container >
                    <Row>
    <Col md={10}>
                            <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Set Initial Params</Card.Title>
                        <SetParamsPanel store={props.store}/>
                    </Card.Body>
                </Card>
    </Col>
  </Row>
</Container>
            </div>
        </div>
    );
};

export default HierarchicalGraphTestTab;
