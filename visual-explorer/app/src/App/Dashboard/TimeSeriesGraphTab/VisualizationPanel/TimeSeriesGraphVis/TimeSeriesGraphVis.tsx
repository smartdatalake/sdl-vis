import React, { useRef } from 'react';
import { useUpdate } from 'react-use';
import _ from 'lodash';
import {
    TimeSeriesCorrelationGraph,
    TimeSeriesCorrelationGraphLink,
    TimeSeriesCorrelationGraphNode,
} from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';
import LinkElement from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesGraphVis/LinkElement';
import NodeElement from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesGraphVis/NodeElement';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, Simulation } from 'd3-force';

interface Props {
    correlationGraph: TimeSeriesCorrelationGraph;
}

const TimeSeriesGraphVis: React.FunctionComponent<Props> = ({ correlationGraph }: Props) => {
    const simGraphRef = useRef<TimeSeriesCorrelationGraph>();

    // //This block can be used to normalize link force. Seems not to be needed at the moment...
    // const weights = correlationGraph.links.map((l) => l.weight);
    // const maxWeight = Math.max(...weights);
    // const maxWeightDiff = Math.max(...weights.map((w1) => Math.max(...weights.map((w2) => Math.abs(w1 - w2)))));

    const updateCb = useUpdate();

    React.useEffect(() => {
        const simGraph = _.cloneDeep(correlationGraph);

        // Create force simulation
        const forceSim: Simulation<TimeSeriesCorrelationGraphNode, TimeSeriesCorrelationGraphLink> = forceSimulation(
            simGraph.nodes
        )
            .force('charge', forceManyBody<TimeSeriesCorrelationGraphNode>().strength(-10))
            .force('center', forceCenter<TimeSeriesCorrelationGraphNode>(0, 0))
            .force(
                'collide',
                forceCollide<TimeSeriesCorrelationGraphNode>((d) => 30)
            )
            .force(
                'link',
                forceLink(simGraph.links).distance((d) => 200 / d.weight)
            )
            .on('tick', function () {
                updateCb();
            });

        // const simGraphRef = React.createRef<TimeSeriesCorrelationGraph>();
        // simGraphRef.current = simGraph;
        simGraphRef.current = simGraph;

        return function cleanup() {
            forceSim?.stop();
        };
    }, [correlationGraph]);

    return (
        <g>
            {simGraphRef.current?.links.map((l) => (
                <LinkElement key={`${l.source.id}_${l.target.id}`} link={l} />
            ))}
            {simGraphRef.current?.nodes.map((n) => (
                <NodeElement key={n.id} node={n} />
            ))}
        </g>
    );
};

export default TimeSeriesGraphVis;
