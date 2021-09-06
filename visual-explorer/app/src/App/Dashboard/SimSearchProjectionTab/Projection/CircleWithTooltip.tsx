import { ScaleLinear } from 'd3-scale';

import React, { useContext, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { duration, opaque, rootCircleRadius } from './ProjectionSVG';
import SimilaritySearchContext from '../Context';
import { SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';

const smallRadius = 2;
const transparent = 0.3;

/**
 * Renders the circle and tooltip for a node.
 *
 * @param attributeToPreview The attribute to preview, i.e., whose slider the user hovers over.
 * @param node The node that this circle represents.
 * @param xScale The scale to which this node's X-coordinate is scaled to.
 * @param yScale The scale to which this node's Y-coordinate is scaled to.
 */
const CircleWithTooltip = ({
    attributeToPreview,
    node,
    xScale,
    yScale,
}: {
    attributeToPreview: string | undefined;
    node: SimilarityGraphNode;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}) => {
    const isVisible = attributeToPreview === undefined;
    const [radius, setRadius] = useState<number>(
        node.id === 'rootSearch' ? rootCircleRadius : Math.min(smallRadius + node.size, rootCircleRadius)
    );
    const [isHover, setHover] = useState<boolean>(false);
    const { highlightedNode, setHighlightedNode, searchParameters } = useContext(SimilaritySearchContext);

    if (!isHover && node.id !== 'rootSearch' && radius !== Math.min(smallRadius + node.size, rootCircleRadius))
        setRadius(Math.min(smallRadius + node.size, rootCircleRadius));

    // The conditional delay (i.e., last time) is necessary as the animation entry and exit execute in inverse order.
    const circleTransition = `fill-opacity ${duration}ms ease-in-out ${isVisible ? duration * 2 : 0}ms`;
    const fillOpacities = {
        entering: { fillOpacity: transparent },
        entered: { fillOpacity: opaque },
        exiting: { fillOpacity: opaque },
        exited: { fillOpacity: transparent },
        unmounted: { fillOpacity: 0 },
    };

    const onMouseOverCircle = () => {
        setHighlightedNode(node);
        setHover(true);
        setRadius(
            (node.id === 'rootSearch' ? rootCircleRadius : Math.min(smallRadius + node.size, rootCircleRadius)) * 2
        );
    };

    const onMouseOutCircle = () => {
        setHighlightedNode(null);
        setHover(false);
        setRadius(node.id === 'rootSearch' ? rootCircleRadius : Math.min(smallRadius + node.size, rootCircleRadius));
    };

    return (
        <OverlayTrigger
            flip={true}
            placement={'auto'}
            overlay={
                <WideTooltip id={`tooltip-${node.id}`}>
                    <FormattedTable>
                        <tbody>
                            <tr>
                                <td>ID</td>
                                <td>{node.id}</td>
                                <td>{node.totalScore}</td>
                            </tr>
                            {searchParameters
                                ? Object.entries(searchParameters)
                                      .filter(([name, value]) => value.active)
                                      .map(([name, value], idx) => {
                                          return (
                                              <tr key={idx}>
                                                  <td>{name}</td>
                                                  <td>{node[name]}</td>
                                                  <td>{node[name + 'Score']}</td>
                                              </tr>
                                          );
                                      })
                                : null}
                        </tbody>
                    </FormattedTable>
                </WideTooltip>
            }
        >
            <g>
                <Transition in={isVisible} timeout={duration}>
                    {(state) => (
                        <>
                            <circle
                                cx={xScale(node.x)}
                                cy={yScale(node.y)}
                                fillOpacity={isVisible ? opaque : transparent}
                                fill={node.id === 'rootSearch' ? 'white' : node.fillColor}
                                stroke={node.id === 'rootSearch' ? node.fillColor : 'none'}
                                r={radius}
                                onMouseEnter={onMouseOverCircle}
                                onMouseLeave={onMouseOutCircle}
                                style={{
                                    opacity: !highlightedNode || highlightedNode.id === node.id ? 1 : 0.3,
                                    transition: circleTransition,
                                    ...fillOpacities[state],
                                }}
                            />
                            <text
                                x={(xScale(node.x) ?? 0) + 5}
                                y={(yScale(node.y) ?? 0) - 5}
                                style={{ fill: node.fillColor, userSelect: 'none' }}
                            >
                                {node.rank}
                            </text>
                        </>
                    )}
                </Transition>
            </g>
        </OverlayTrigger>
    );
};

const FormattedTable = styled.table`
    font-size: x-small;

    // Align text of header column to the right with italic font.
    tr > td:first-of-type {
        font-style: italic;
        text-align: right;
    }

    // Align text of non-header columns to the left.
    tr > td:not(:first-of-type) {
        text-align: left;
    }

    // Increase space between columns but not after the last one.
    tr > td:not(:last-of-type) {
        padding-right: 10px;
    }
`;

const WideTooltip = styled(Tooltip)`
    // Adjust the tooltip width to its contents.
    .tooltip-inner {
        max-width: unset;
    }
`;

export default CircleWithTooltip;
