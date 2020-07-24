import memoize from 'memoize-one';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ProjSVG from './projection-svg';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './proj-svg.scss';
import { IProjParametersState } from 'redux-types/proj-parameters';

interface IProjWrapperProps {
    store: Store<IApplicationState>;
}

interface IProjWrapperReduxProps {
    type: string;
    queryAttributes: IProjParametersState['queryAttributes'];

    epsilon: number;
    maxIter: number;
}

interface IProjWrapperState {
    data?: {
        x: number;
        y: number;
        oldX: number;
        oldY: number;
        color: string;
        id: string;
        keywords: string;
        numEmployees: string;
        revenue: string;
        keywordsScore: number;
        employeesScore: number;
        revenueScore: number;
    }[];

    hoverData?: {
        x: number;
        y: number;
        id: string;
        color: string;
        attribute: string;
    }[][];

    adjMat?: { left: string; right: string; score: number }[];
}

class ProjWrapper extends Component<
    IProjWrapperProps & IProjWrapperReduxProps,
    IProjWrapperState
> {
    constructor(props: IProjWrapperProps & IProjWrapperReduxProps) {
        super(props);
        this.state = {
            data: undefined,
            hoverData: undefined,
            adjMat: undefined,
        };
    }

    private constructProjection = memoize(
        (
            type: string,
            attributes: IProjParametersState['queryAttributes'],
            epsilon: number,
            maxIter: number
        ) => {
            fetch('http://127.0.0.1:8080/simsearch', {
                body: JSON.stringify({
                    attributes,
                    type,
                    epsilon,
                    maxIter,
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
                .then(jsonResponse => {
                    fetch('http://127.0.0.1:8080/simsearch/prefetch', {
                        body: JSON.stringify({
                            attributes,
                            type,
                            epsilon,
                            maxIter,
                        }),
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                    })
                        .then(jsonResponseLocal => {
                            return jsonResponseLocal.json();
                        })
                        .then((json: []) => {
                            console.log('received hoverData', json);
                            const hoverData = json;
                            this.setState({
                                hoverData,
                            });
                        });
                    return jsonResponse.json();
                })
                .then(
                    (
                        json: [
                            {
                                x: number;
                                y: number;
                                oldX: number;
                                oldY: number;
                                color: string;
                                id: string;
                                keywords: string;
                                numEmployees: string;
                                revenue: string;
                                keywordsScore: number;
                                employeesScore: number;
                                revenueScore: number;
                            }[],
                            { left: string; right: string; score: number }[]
                        ]
                    ) => {
                        console.log('received data', json);
                        const data = json[0];
                        const adjMat = json[1];

                        this.setState({
                            data,
                            adjMat,
                        });
                    }
                );
        }
    );

    public componentDidMount() {
        const { type, queryAttributes, epsilon, maxIter } = this.props;
        this.constructProjection(type, queryAttributes, epsilon, maxIter);
    }

    public componentDidUpdate(newProps: IProjWrapperReduxProps) {
        const { type, queryAttributes, epsilon, maxIter } = this.props;

        console.log('construct projection');
        this.constructProjection(type, queryAttributes, epsilon, maxIter);
    }

    render() {
        return (
            <ProjSVG
                data={this.state.data}
                adjMat={this.state.adjMat}
                hoverData={this.state.hoverData}
            />
        );
    }
}

const mapStateToProps = ({
    projParametersState,
    mdsParametersState,
}: IApplicationState) => ({
    type: projParametersState.type,
    queryAttributes: projParametersState.queryAttributes,

    epsilon: mdsParametersState.epsilon,
    maxIter: mdsParametersState.maxIter,
});

export default connect(mapStateToProps, null)(ProjWrapper);
