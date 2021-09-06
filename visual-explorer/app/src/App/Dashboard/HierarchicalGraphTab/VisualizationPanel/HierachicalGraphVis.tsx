import React, { useState } from 'react';
import { Margin } from 'types/Margin';
import { scaleLinear } from '@visx/scale';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { bounds, getNumberFormatter } from 'tools/helpers';
import Cluster from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/Cluster/Cluster';
import { interpolateRainbow } from 'd3-scale-chromatic';
import produce from 'immer';
import _ from 'lodash';
import { HierarchicalGraphLevel, HierarchicalGraphNode } from 'types/HierarchicalGraphLevel';
import { createToLocal } from 'tools/createToLocal';

const DEFAULT_MARGIN: Margin = { top: 10, right: 25, bottom: 35, left: 45 };

interface Props {
    graphData: HierarchicalGraphLevel;
    width: number;
    height: number;
    margin?: Margin;
}

const HierachicalGraphVis: React.FunctionComponent<Props> = ({
    graphData,
    width,
    height,
    margin = DEFAULT_MARGIN,
}: Props) => {
    // Holds the descendant points per cluster.
    const [descendantPoints, setDescendantPoints] = useState<Record<number | string, HierarchicalGraphNode[]>>({});

    const dataPoints = graphData.nodes;

    // Get value ranges of x- and y-Axis (over all points in the graph).
    const allPoints = [...dataPoints, ..._.flatten(Object.values(descendantPoints))];
    const xBounds = bounds(allPoints.map((d) => d.x));
    const yBounds = bounds(allPoints.map((d) => d.y));

    const distinctClusterLabels = [...new Set(dataPoints.map((d) => d.cluster))].sort();
    const colorScale = interpolateRainbow;

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

    const toLocal = createToLocal(scaleX, scaleY);

    return (
        <Group left={margin.left} top={margin.top}>
            <AxisLeft tickFormat={getNumberFormatter(3)} scale={scaleY} numTicks={5} />
            <AxisBottom tickFormat={getNumberFormatter(3)} top={yMax} scale={scaleX} numTicks={5} />

            {/* TODO: Fix the z-index problem (Cluster Hull below Cluster Points). E.g., by using portals? */}
            {distinctClusterLabels.map((l, idx) => {
                const onBoundariesUpdateHandler = (points: HierarchicalGraphNode[]) => {
                    setDescendantPoints((prevState) =>
                        produce(prevState, (draftState) => {
                            draftState[l] = points;
                        })
                    );
                };

                const clusterDataPoints = dataPoints.filter((p) => p.cluster == l);

                return (
                    <Cluster
                        transactionId={graphData.transactionId}
                        key={`cluster_l0_c${l}`}
                        clusterId={l}
                        level={0}
                        toLocal={toLocal}
                        dataPoints={clusterDataPoints}
                        colorScale={(t: number) =>
                            colorScale(t / distinctClusterLabels.length + idx / distinctClusterLabels.length)
                        }
                        onBoundariesUpdate={onBoundariesUpdateHandler}
                    />
                );
            })}
        </Group>
    );
};
export default React.memo(HierachicalGraphVis);
