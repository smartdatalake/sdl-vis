import 'bootstrap/scss/bootstrap.scss';
import React from 'react';
import { connect } from 'react-redux';
import { Card, Col, Container, Form, Row } from 'react-bootstrap';
import './panels.scss';
import { IApplicationState } from 'redux-types';
import { Store } from 'redux';
import {
    addActiveCompany,
    removeActiveCompany,
    TSeriesParametersState,
} from 'redux-types/tseries-parameters';
import * as d3 from 'd3';

interface ITSeriesProps {
    store: Store<IApplicationState>;
}

interface ITSeriesPanelReduxProps {
    addActiveCompany: typeof addActiveCompany;
    removeActiveCompany: typeof removeActiveCompany;
    activeCompanies: TSeriesParametersState['activeCompanies'];
    allCompanies: TSeriesParametersState['allCompanies'];
}

interface ITSeriesPanelStore {
    newCompany: string;
    possibleCompanies: string[];
}

class TimeSeriesPanel extends React.Component<
    ITSeriesProps & ITSeriesPanelReduxProps,
    ITSeriesPanelStore
> {
    constructor(props: ITSeriesProps & ITSeriesPanelReduxProps) {
        super(props);
        this.state = {
            newCompany: 'add Series',
            possibleCompanies: [],
        };
    }

    private handleInputChange = (event: any) => {
        if (event.target.value.length > 3) {
            const matches = this.props.allCompanies.filter(cstring =>
                cstring.includes(event.target.value)
            );
            this.setState({ possibleCompanies: matches });
        }
        this.setState({ newCompany: event.target.value });
    };

    private addCompanyFn = (event: any, company: string) => {
        this.props.addActiveCompany(company);
        this.setState({ possibleCompanies: [] });
    };

    private removeCompanyFn = (event: any, idx: number) => {
        this.props.removeActiveCompany(idx);
        console.log(this.props.activeCompanies[idx]);
    };

    public render() {
        const color = d3
            .scaleOrdinal()
            // @ts-ignore
            .domain([0, this.props.activeCompanies.length])
            .range(d3.schemeCategory10);

        return (
            <div className={'panel left'}>
                <Card className={'panel-card'}>
                    <Card.Body>
                        <Card.Title>Time Series</Card.Title>
                        <Container>
                            {Object.entries(this.props.activeCompanies).map(
                                ([idx, cobj]) => {
                                    const onClick = (e: React.MouseEvent) =>
                                        this.removeCompanyFn(
                                            e,
                                            parseInt(idx, 10)
                                        ); // TODO: Why is idx a string, when this operation should always succeed?

                                    return (
                                        <Row
                                            className="mb-2"
                                            key={'timeseries-obj-' + idx}
                                        >
                                            <Col
                                                style={{
                                                    color: color(idx) as string,
                                                }}
                                            >
                                                {cobj}
                                            </Col>
                                            <div
                                                id={'r-cmp-' + idx}
                                                className={
                                                    'remove-attribute-button'
                                                }
                                                onClick={onClick}
                                            >
                                                x
                                            </div>
                                        </Row>
                                    );
                                }
                            )}

                            <Form>
                                <Form.Row>
                                    <Form.Control
                                        type="text"
                                        value={this.state.newCompany}
                                        onChange={this.handleInputChange}
                                    />
                                </Form.Row>
                                <div className={'candidate-container'}>
                                    {Object.entries(
                                        this.state.possibleCompanies
                                    ).map(([idx, cname]) => {
                                        const onClick = (e: React.MouseEvent) =>
                                            this.addCompanyFn(e, cname);

                                        return (
                                            <span
                                                key={
                                                    'timeseries-candidate-' +
                                                    idx
                                                }
                                                className={
                                                    'timeseries-candidate'
                                                }
                                                onClick={onClick}
                                            >
                                                {cname}
                                            </span>
                                        );
                                    })}
                                </div>
                            </Form>
                        </Container>
                    </Card.Body>
                </Card>
            </div>
        );
    }
}

const mapDispatchToProps = {
    addActiveCompany,
    removeActiveCompany,
};

const mapStateToProps = ({ tSeriesParametersState }: IApplicationState) => ({
    activeCompanies: tSeriesParametersState.activeCompanies,
    allCompanies: tSeriesParametersState.allCompanies,
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeSeriesPanel);
