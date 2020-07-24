import 'bootstrap/scss/bootstrap.scss';
import Slider from 'rc-slider';
import 'rc-slider/dist/rc-slider.css';
import React from 'react';
import { Card, Container, ListGroup, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Dispatch, Store } from 'redux';
import { IApplicationState } from 'redux-types';
import mdsParametersActions from 'redux-types/proj-parameters/mds-parameters/actions';
import './panels.scss';

interface IMDSTuningPanelProps {
    store: Store<IApplicationState>;
    epsilon: number;
    maxIter: number;
    setEpsilon: typeof mdsParametersActions.setEpsilon;
    setMaxIter: typeof mdsParametersActions.setMaxIter;
}

interface IMDSTuningPanelState {
    localEpsilon: number;
    localMaxIter: number;
}

class MDSTuningPanel extends React.Component<
    IMDSTuningPanelProps,
    IMDSTuningPanelState
> {
    constructor(props: IMDSTuningPanelProps) {
        super(props);

        this.state = {
            localEpsilon: props.epsilon,
            localMaxIter: props.maxIter,
        };
    }

    public localEpsilonChanged(value: number) {
        this.setState({
            localEpsilon: value,
        });
    }

    public localMaxIterChanged(value: number) {
        this.setState({
            localMaxIter: value,
        });
    }

    public render() {
        const onEpsilonChangeFn = (v: number) => {
            this.localEpsilonChanged(v);
        };

        const onAfterEpsilonChangeFn = (v: number) => {
            this.props.setEpsilon(v);
        };

        const onMaxIterChangeFn = (v: number) => {
            this.localMaxIterChanged(v);
        };

        const onAfterMaxIterChangeFn = (v: number) => {
            this.props.setMaxIter(v);
        };

        return (
            <div className={'panel right'}>
                <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>MDS Parameters</Card.Title>
                        <Card.Text>
                            Some quick example text to build on the card title
                            and make up the bulk of the card's content.
                        </Card.Text>
                        <ListGroup>
                            <ListGroup.Item>
                                <Container>
                                    <Row className="mb-2">
                                        Epsilon:&nbsp;
                                        <b>
                                            {this.state.localEpsilon.toFixed(4)}
                                        </b>
                                    </Row>
                                    <Row>
                                        <Slider
                                            onChange={onEpsilonChangeFn}
                                            onAfterChange={
                                                onAfterEpsilonChangeFn
                                            }
                                            min={0}
                                            max={1}
                                            step={0.0001}
                                            defaultValue={
                                                this.state.localEpsilon
                                            }
                                        />
                                    </Row>
                                    <Row className="mb-2">
                                        max iterations:&nbsp;
                                        <b>
                                            {this.state.localMaxIter.toFixed(0)}
                                        </b>
                                    </Row>
                                    <Row>
                                        <Slider
                                            onChange={onMaxIterChangeFn}
                                            onAfterChange={
                                                onAfterMaxIterChangeFn
                                            }
                                            min={1}
                                            max={1000}
                                            step={1}
                                            defaultValue={
                                                this.state.localMaxIter
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

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setEpsilon: (epsilon: number) =>
        dispatch(mdsParametersActions.setEpsilon(epsilon)),
    setMaxIter: (maxIter: number) =>
        dispatch(mdsParametersActions.setMaxIter(maxIter)),
});

const mapStateToProps = ({ mdsParametersState }: IApplicationState) => ({
    epsilon: mdsParametersState.epsilon,
    maxIter: mdsParametersState.maxIter,
});

export default connect(mapStateToProps, mapDispatchToProps)(MDSTuningPanel);
