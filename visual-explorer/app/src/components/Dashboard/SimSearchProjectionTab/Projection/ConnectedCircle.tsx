import { ScaleLinear } from 'd3';
import React from 'react';
import { Transition } from 'react-transition-group';
import { ColoredNode, duration, Node, opaque, rootCircleRadius, stroke } from './ProjectionSVG';

const largeRadius = 5;

/**
 * Previews the nodes appearing after a parameter change, including edges that connect to `node`.
 *
 * For some nodes, there may be no counterpart after a parameter change. Hence, for those nodes, no previews are
 * rendered.
 *
 * @param attributeToPreview The attribute to preview, i.e., whose slider the user hovers over.
 * @param node The node after a parameter change that this circle shows.
 * @param nodesToPreview The nodes that results from `node` after a change in negative and positive direction to the
 *        similarity search parameters.
 * @param xScale The scale to which a node's X-coordinate is scaled to.
 * @param yScale The scale to which a node's Y-coordinate is scaled to.
 */
const ConnectedCircle = ({
    attributeToPreview,
    nodesToPreview,
    node,
    xScale,
    yScale,
}: {
    attributeToPreview?: string,
    nodesToPreview: ColoredNode[],
    node?: Node,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleLinear<number, number>
}) => (
    <>
        {nodesToPreview.map((nodeToPreview, index) => {
            const isVisible = attributeToPreview !== undefined && attributeToPreview === nodeToPreview.attribute;
            const radius = nodeToPreview.id === 'rootSearch' ? rootCircleRadius : largeRadius;

            // The conditional delay (i.e., last time) is necessary as the animation entry and exit execute in inverse order.
            const circleTransition = `fill-opacity ${duration}ms ease-in-out ${isVisible ? 0 : duration * 2}ms`;
            const lineTransition = `stroke-dasharray ${duration * 2}ms ease-in-out ${isVisible ? duration : 0}ms`;
            const fillOpacities = {
                entering: { fillOpacity: 0 },
                entered: { fillOpacity: opaque },
                exiting: { fillOpacity: opaque },
                exited: { fillOpacity: 0 },
                unmounted: { fillOpacity: 0 },
            };
            const strokeDashArrays = {
                entering: { strokeDasharray: `0 100%` },
                entered: { strokeDasharray: `100% 100%` },
                exiting: { strokeDasharray: `100% 100%` },
                exited: { strokeDasharray: `0 100%` },
                unmounted: { strokeDasharray: `0 100%` },
            };

            return (
                <g key={index}>
                    {node ?
                        <Transition in={isVisible} timeout={duration}>
                            {state =>
                                <line
                                    stroke={stroke}
                                    style={{
                                        transition: lineTransition,
                                        ...strokeDashArrays[state],
                                    }}
                                    x1={xScale(node.x)}
                                    x2={xScale(nodeToPreview.x)}
                                    y1={yScale(node.y)}
                                    y2={yScale(nodeToPreview.y)}
                                />
                            }
                        </Transition> : null
                    }
                    <Transition in={isVisible} timeout={duration}>
                        {state =>
                            <circle
                                cx={xScale(nodeToPreview.x)}
                                cy={yScale(nodeToPreview.y)}
                                fill={nodeToPreview.color}
                                r={radius}
                                style={{
                                    transition: circleTransition,
                                    ...fillOpacities[state],
                                }}
                            />
                        }
                    </Transition>
                </g>
            );
        })}
    </>
);

export default ConnectedCircle;
