import React from 'react';
import './Dashboard.scss';
import SimSearchProjectionTab from 'App/Dashboard/SimSearchProjectionTab/SimilaritySearchTab';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProfilingTab from 'App/Dashboard/ProfilingTab';
import VPlotsTab from 'App/Dashboard/vPlotsTab';
import { Route } from 'react-router-dom';

interface IDashboardProps {}

const Dashboard = (props: IDashboardProps) => {
    return (
        <div className={'dashboard'}>
            <Route exact path={'/data-profiling'}>
                <ProfilingTab />
            </Route>
            <Route exact path={'/v-plots'}>
                <VPlotsTab />
            </Route>
            <Route exact path={'/simsearch'}>
                <SimSearchProjectionTab />
            </Route>
            {/*<Route exact path={'/hierarchical-graph'}>*/}
            {/*    <HierarchicalGraphTab />*/}
            {/*</Route>*/}
            {/*<Route exact path={'/time-series-graph'}>*/}
            {/*    <TimeSeriesGraphTab />*/}
            {/*</Route>*/}
        </div>
    );
};

export default Dashboard;
