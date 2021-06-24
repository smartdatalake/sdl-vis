import React from 'react';
import { DataArray, DataRow, isNumber, isString } from 'types/DataArray';
import { Margin } from 'types/Margin';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { bounds, getNumberFormatter } from 'tools/helpers';
import { ordinalColorscale } from 'tools/color';
import DataPoint from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/DataPoint';
import ClusterHull from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/ClusterHull';

const DEFAULT_MARGIN: Margin = { top: 10, right: 25, bottom: 35, left: 45 };

export interface FormattedGraphDataRow extends DataRow {
    x: number;
    y: number;
    cluster: number | string;
}

interface Props {
    graphData: DataArray;
    width: number;
    height: number;
    margin?: Margin;
}

const HierachicalGraphVis: React.FunctionComponent<Props> = ({
    graphData: rawGraphData,
    width,
    height,
    margin = DEFAULT_MARGIN,
}: Props) => {
    const dataPoints: Array<FormattedGraphDataRow> = rawGraphData
        .map((row) => ({
            x: isNumber(row.x) ? row.x : 0,
            y: isNumber(row.y) ? row.y : 0,
            cluster: isNumber(row.cluster) || isString(row.cluster) ? row.cluster : 'undefined',
            ...row,
        }))
        .sort((a, b) => (a.cluster + '').localeCompare(b.cluster + ''));

    const xBounds = bounds(dataPoints.map((d) => d.x));
    const yBounds = bounds(dataPoints.map((d) => d.y));

    const distinctLabels = [...new Set(dataPoints.map((d) => d.cluster))].sort();
    const scaleLabel = ordinalColorscale(distinctLabels);

    // Create scales
    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const scaleX = scaleLinear({
        domain: [xBounds.min, xBounds.max],
        range: [0, xMax],
    });

    const scaleY = scaleLinear({
        domain: [yBounds.min, yBounds.max],
        range: [yMax, 0],
    });

    const toLocal = (dataPoint: FormattedGraphDataRow) => ({
        ...dataPoint,
        x: scaleX(dataPoint.x),
        y: scaleY(dataPoint.y),
    });

    return (
        <Group left={margin.left} top={margin.top}>
            <AxisLeft tickFormat={getNumberFormatter(3)} scale={scaleY} numTicks={5} />
            <AxisBottom tickFormat={getNumberFormatter(3)} top={yMax} scale={scaleX} numTicks={5} />

            {distinctLabels.map((l) => {
                const localClusterDataPoints: FormattedGraphDataRow[] = dataPoints
                    .filter((p) => p.cluster == l)
                    .map(toLocal);

                return <ClusterHull key={'cluster_' + l} dataPoints={localClusterDataPoints} color={scaleLabel(l)} />;
            })}

            {dataPoints.map(toLocal).map((p, idx) => (
                <DataPoint key={idx} x={p.x} y={p.y} color={scaleLabel(p.cluster)} dataPoint={p} />
            ))}
        </Group>
    );
};
export default React.memo(HierachicalGraphVis);
