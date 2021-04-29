import * as React from 'react';
import TimeSeriesPlotSVG from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlotSVG';
import TimeSeriesGraphVisSVG from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesGraphVisSVG';
import styled from 'styled-components';
import { appleStock } from '@visx/mock-data';
import { TimeSeriesCorrelationGraph } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';

const VerticalContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const StyledHr = styled.hr`
    border-top: 2px solid white;
    margin: 0;
`;

interface Props {
    correlationGraph: TimeSeriesCorrelationGraph;
}

const VisualizationPanel = ({ correlationGraph }: Props) => {
    const tsArray = [
        {
            id: 'd790c085-8293-4579-81dc-fc9c0323b803',
            name: 'Apple Stock',
            timePoints: appleStock.map((v) => ({
                time: new Date(v.date),
                payload: {
                    value: v.close,
                    unit: 'USD',
                },
            })),
        },
        {
            id: '267c1867-939b-4ff5-b310-9dcc3f94e11a',
            name: 'Test Stock (Inverse Apple)',
            timePoints: appleStock.map((v) => ({
                time: new Date(v.date),
                payload: {
                    value: v.close * -0.8,
                    unit: 'USD',
                },
            })),
        },
        {
            id: '67dfe646-d13d-41ca-a409-565ddf333a01',
            name: 'Random Stock',
            timePoints: appleStock.map((v) => ({
                time: new Date(v.date),
                payload: {
                    value: Math.random() * 300,
                    unit: 'USD',
                },
            })),
        },
    ];

    return (
        <VerticalContainer>
            <TimeSeriesPlotSVG tsArray={tsArray} />
            <StyledHr />
            <TimeSeriesGraphVisSVG correlationGraph={correlationGraph} />
        </VerticalContainer>
    );
};

export default VisualizationPanel;
