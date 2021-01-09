import memoize from 'memoize-one';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import TimeSeriesSVG from './timeseries-svg';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './timeseries-svg.scss';
import {
    setAllCompanies,
    TSeriesParametersState,
} from 'redux-types/tseries-parameters';
import { VISUAL_ANALYTICS_ENGINE } from 'backend-urls';

interface ITSeriesWrapperProps {
    store: Store<IApplicationState>;
}

interface ITSeriesWrapperReduxProps {
    setAllCompanies: typeof setAllCompanies;
    allCompanies: TSeriesParametersState['allCompanies'];
    activeCompanies: TSeriesParametersState['activeCompanies'];
}

interface ITSeriesWrapperState {
    data?: [];
}

class TimeSeriesWrapper extends Component<
    ITSeriesWrapperProps & ITSeriesWrapperReduxProps,
    ITSeriesWrapperState
> {
    constructor(props: ITSeriesWrapperProps & ITSeriesWrapperReduxProps) {
        super(props);
        this.state = {
            data: undefined,
        };

        fetch(VISUAL_ANALYTICS_ENGINE + '/timeseries/allcompanies', {
            method: 'GET',
        })
            .then(jsonResponse => {
                return jsonResponse.json();
            })
            .then((json: []) => {
                console.log('allcomps', json);
                this.props.setAllCompanies(json);
            });
    }

    private constructTimeSeries = memoize(
        (activeCompanies: TSeriesParametersState['activeCompanies']) => {
            fetch(VISUAL_ANALYTICS_ENGINE + '/timeseries', {
                body: JSON.stringify({
                    activeCompanies,
                }),
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            })
                .then(jsonResponse => {
                    return jsonResponse.json();
                })
                .then((json: []) => {
                    console.log('received timeseries data', json);
                    const data = json;
                    this.setState({ data });
                });
        }
    );

    public componentDidMount() {
        const { activeCompanies } = this.props;
        this.constructTimeSeries(activeCompanies);
    }

    public componentDidUpdate() {
        const { activeCompanies, allCompanies } = this.props;
        console.log('wrapper update', allCompanies);
        this.constructTimeSeries(activeCompanies);
    }

    render() {
        return <TimeSeriesSVG data={this.state.data} />;
    }
}

const mapDispatchToProps = {
    setAllCompanies,
};

const mapStateToProps = ({ tSeriesParametersState }: IApplicationState) => ({
    allCompanies: tSeriesParametersState.allCompanies,
    activeCompanies: tSeriesParametersState.activeCompanies,
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeSeriesWrapper);
