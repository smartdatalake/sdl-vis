import React, { useContext } from 'react';
import { Transition } from 'react-transition-group';
import Context from '../Context';
import { duration, stroke } from './ProjectionSVG';
import { ScaleLinear, scaleLog } from 'd3-scale';
import { extent } from 'd3-array';
import { SimilarityGraphEdge, SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';

const strokeOpacityScalingFactor = 1 / 4;
const thinEdge = 0.5;
const thickEdge = 3;

/**
 * Renders the edges between the data points to represent their similarity.
 *
 * @param nodes The nodes to render.
 * @param weightedEdges The weighted edges between pairs of two nodes.
 * @param xScale The scale to which an edge's X-coordinates are scaled to.
 * @param yScale The scale to which an edge's Y-coordinates are scaled to.
 */
const Edges = ({
    nodes,
    weightedEdges,
    xScale,
    yScale,
}: {
    nodes: SimilarityGraphNode[];
    weightedEdges: SimilarityGraphEdge[];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}) => {
    const adjacencyDomain = extent(weightedEdges.map((adjacency) => adjacency.score)) as [number, number];
    const { attributeToPreview } = useContext(Context);
    const strokeScale = scaleLog().domain(adjacencyDomain).range([thinEdge, thickEdge]);
    const { highlightedNode } = useContext(Context);

    return (
        <g>
            {weightedEdges.map((adjacency, index) => {
                if (adjacency.left.length === 0 && adjacency.right.length === 0) return null;

                const leftNode = nodes.find((dataPoint) => getShortID(dataPoint.id) === getShortID(adjacency.left));
                const rightNode = nodes.find((dataPoint) => getShortID(dataPoint.id) === getShortID(adjacency.right));

                // One of the IDs is invalid, do not render.
                if (!leftNode || !rightNode) return null;

                const isVisible = attributeToPreview === undefined;
                const strokeWidth = strokeScale(adjacency.score);
                const strokeOpacity =
                    !highlightedNode || highlightedNode.id === leftNode.id || highlightedNode.id === rightNode.id
                        ? (strokeWidth || 0) * strokeOpacityScalingFactor
                        : 0;

                // The conditional delay (i.e., last time) is necessary as the animation entry and exit execute in inverse order.
                const lineTransition = `stroke-opacity ${duration}ms ease-in-out ${duration / 3}ms`;
                const strokeOpacities = {
                    entering: { strokeOpacity: 0 },
                    entered: { strokeOpacity },
                    exiting: { strokeOpacity },
                    exited: { strokeOpacity: 0 },
                    unmounted: { strokeOpacity: 0 },
                };

                return (
                    <Transition in={isVisible} key={index} timeout={duration}>
                        {(state) => (
                            <line
                                stroke={stroke}
                                strokeOpacity={strokeOpacity}
                                strokeWidth={strokeWidth}
                                style={{
                                    transition: lineTransition,
                                    ...strokeOpacities[state],
                                }}
                                x1={xScale(leftNode.x)}
                                x2={xScale(rightNode.x)}
                                y1={yScale(leftNode.y)}
                                y2={yScale(rightNode.y)}
                            />
                        )}
                    </Transition>
                );
            })}
        </g>
    );
};

/**
 * Converts a long ID into a short ID.
 *
 * Long IDs take the form of "https://atoka.io/en/companies/-/<HEX>;<NAME>", while short IDs leave out `;<NAME>`.
 *
 * @param longID The Long ID to convert to a short ID.
 * @returns the short form of a long ID.
 */
const getShortID = (longID: string) => longID.split(';')[0] || longID;

export default Edges;
