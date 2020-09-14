import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './ShinerTab.scss';
import GraphdbPanelWrapper from "./panels/graphdb-panel-wrapper";
import SetGGDsPanel from "./panels/setggds-panel";
import GetGGDsPanel from "./panels/getggds-panel";
import RunERPanel from "./panels/runer-panel";
import SelectQueryPanelWrapper from "./gcore/select-panel";
import ConstructQueryPanelWrapper from "./gcore/construct-panel";
import GetNeighborPanelWrapper from "./gcore/getneighbors-panel";
import GetNeighborGraphPanelWrapper from "./gcore/graphneighbor-panel";
import DataPofilingPanel from "../HierarchicalGraphTab/panels/data-pofiling-panel";
import {Card, Col, Container, Row} from "react-bootstrap";
import VisNetwork from "./graph/visNetwork";
import {Network} from "vis-network";

interface Props {
    store: Store<IApplicationState>;
}

const ShinerTab = (props: Props) => {
    console.log('sHINERTab.render()');

    return (
        <div className={'er-graph-tab'}>
            <div  style={{ position: 'relative' }}>
                <Container fluid>
  <Row>
    <Col>
        <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Available graphs</Card.Title>
                        <GraphdbPanelWrapper  store={props.store}/>
                    </Card.Body>
                </Card>
    </Col>
  </Row>
                    <Row>
    <Col md={10}>
                            <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>GGDs: Graph Generating Dependencies</Card.Title>
                        <SetGGDsPanel store={props.store}/>
                         <GetGGDsPanel store={props.store}/>
                    </Card.Body>
                </Card>
    </Col>
                        <Col md={2}>
                            <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Entity Resolution</Card.Title>
          <RunERPanel store={props.store}/>
                    </Card.Body>
                </Card>

                        </Col>
  </Row>
                    <Row>
                        <Col md={12}>
                        <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>G-Core Tabular Queries</Card.Title>
                        <SelectQueryPanelWrapper store={props.store}/>
                    </Card.Body>
                </Card>
                    </Col>
                    </Row><Row>
                    <Col md={12}>
                        <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>G-Core Graph Queries</Card.Title>
                        <ConstructQueryPanelWrapper store={props.store}/>
                    </Card.Body>
                </Card>
                    </Col>
                    </Row>
</Container>
            </div>
        </div>
    );
};

export default ShinerTab;
