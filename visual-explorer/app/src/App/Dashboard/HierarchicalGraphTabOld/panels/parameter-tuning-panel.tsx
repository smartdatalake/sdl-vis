import 'bootstrap/scss/bootstrap.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import React from 'react';
import { Card, Container, ListGroup, Row } from 'react-bootstrap';
import './panels.scss';
import { ENTITY_RESOLUTION_THRESHOLD } from 'App/Dashboard/HierarchicalGraphTabOld/graph/graph-query-wrapper';

interface IParameterTuningPanelProps {}

interface IParameterTuningPanelState {
    localERT: number;
}

class ParameterTuningPanel extends React.Component<IParameterTuningPanelProps, IParameterTuningPanelState> {
    public static readonly FLOATING_SLIDER_STEPS = 100;

    constructor(props: IParameterTuningPanelProps) {
        super(props);

        this.state = {
            // localERT: props.entityResolutionThreshold,
            localERT: ENTITY_RESOLUTION_THRESHOLD,
        };
    }

    public localERTChanged(value: number) {
        this.setState({
            localERT: value,
        });
    }

    public render() {
        const onChangeFn = (v: number) => {
            this.localERTChanged(v / ParameterTuningPanel.FLOATING_SLIDER_STEPS);
        };

        const onAfterChangeFn = (v: number) => {
            // this.props.setEntityResolutionThreshold(v / ParameterTuningPanel.FLOATING_SLIDER_STEPS);
        };

        return (
            <div className={'panel right'}>
                <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Parameter Tuning</Card.Title>
                        <Card.Text>
                            Some quick example text to build on the card title and make up the bulk of the card&apos;s
                            content.
                        </Card.Text>
                        <ListGroup>
                            <ListGroup.Item>
                                <Container>
                                    <Row className="mb-2">
                                        Entity resolution Threshold:&nbsp;
                                        <b>{this.state.localERT.toFixed(2)}</b>
                                    </Row>
                                    <Row>
                                        <Slider
                                            onChange={onChangeFn}
                                            onAfterChange={onAfterChangeFn}
                                            min={0}
                                            max={ParameterTuningPanel.FLOATING_SLIDER_STEPS}
                                            step={1}
                                            defaultValue={
                                                this.state.localERT * ParameterTuningPanel.FLOATING_SLIDER_STEPS
                                            }
                                        />
                                    </Row>
                                </Container>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

export default ParameterTuningPanel;
