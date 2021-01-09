import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './Dashboard.scss';
import { Tab, Tabs } from 'react-bootstrap';
import SimSearchProjectionTab from 'components/Dashboard/SimSearchProjectionTab/SimilaritySearchTab';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProfilingTab from 'components/Dashboard/ProfilingTab';
import VPlotsTab from 'components/Dashboard/vPlotsTab';
import TimeSeriesTab from 'components/Dashboard/TimeSeriesTab';

interface IDashboardProps {
    store: Store<IApplicationState>;
}

const Dashboard = (props: IDashboardProps) => {
    return (
        <div className={'dashboard'}>
            <Tabs
                defaultActiveKey="simsearch-projection"
                id="uncontrolled-tab-example"
                style={{ flexGrow: 0 }}
            >
                <Tab eventKey="jupyter-profiling" title="Data Profiling">
                    <ProfilingTab store={props.store} />
                </Tab>
                <Tab
                    eventKey="v-plots"
                    title="Descriptive Statistics (V-Plots)"
                >
                    <VPlotsTab store={props.store} />
                </Tab>
                <Tab eventKey="simsearch-projection" title="Similarity Search">
                    <SimSearchProjectionTab />
                </Tab>
                {/*<Tab eventKey="hierarchical-graph" title="Entity Resolution">*/}
                {/*    <HierarchicalGraphTab store={props.store} />*/}
                {/*</Tab>*/}
                <Tab eventKey="time-series" title="Time Series">
                    <TimeSeriesTab store={props.store} />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Dashboard;
