import React from 'react';
import './Dashboard.scss';
import SimSearchProjectionTab from 'App/Dashboard/SimSearchProjectionTab/SimilaritySearchTab';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProfilingTab from 'App/Dashboard/ProfilingTab';
import VPlotsTab from 'App/Dashboard/vPlotsTab';
import { Route } from 'react-router-dom';
import HierarchicalGraphTab from 'App/Dashboard/HierarchicalGraphTab';
import TimeSeriesGraphTab from './TimeSeriesGraphTab';
import EntityResolutionTab from './EntityResolutionTab';

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
            <Route exact path={'/hierarchical-graph'}>
                <HierarchicalGraphTab />
            </Route>
            <Route exact path={'/time-series-graph'}>
                <TimeSeriesGraphTab />
            </Route>
            <Route exact path={'/entity-resolution'}>
                <EntityResolutionTab />
            </Route>
        </div>
    );
};

export default Dashboard;
