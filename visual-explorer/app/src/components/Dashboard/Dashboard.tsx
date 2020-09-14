import React from 'react';
import { Store } from 'redux';
import { IApplicationState } from 'redux-types';
import './Dashboard.scss';
import { Tab, Tabs } from 'react-bootstrap';
import HierarchicalGraphTab from 'components/Dashboard/HierarchicalGraphTab';
import SimSearchProjectionTab from 'components/Dashboard/SimSearchProjectionTab/SimilaritySearchTab';
import ProfilingTab from 'components/Dashboard/ProfilingTab';
import VPlotsTab from 'components/Dashboard/vPlotsTab';
import TimeSeriesTab from 'components/Dashboard/TimeSeriesTab';
import ShinerTab from "components/Dashboard/ShinerTab";
import 'bootstrap/dist/css/bootstrap.min.css';

interface IDashboardProps {
    store: Store<IApplicationState>;
}

const Dashboard = (props: IDashboardProps) => {
    return <div className={'dashboard'}>
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
            <Tab eventKey="hierarchical-graph" title="Graph">
                <HierarchicalGraphTab store={props.store} />
            </Tab>
            <Tab eventKey="er-graph" title="sHINER">
                <ShinerTab store={props.store} />
            </Tab>
            <Tab eventKey="time-series" title="Time Series">
                <TimeSeriesTab store={props.store} />
            </Tab>
        </Tabs>
    </div>;
};

export default Dashboard;
