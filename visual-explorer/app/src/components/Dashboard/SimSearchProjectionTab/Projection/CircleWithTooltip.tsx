import { ScaleLinear } from 'd3';
import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Transition } from 'react-transition-group';
import styled from 'styled-components';
import { duration, Node, opaque, rootCircleRadius } from './ProjectionSVG';

const smallRadius = 3;
const transparent = 0.3;

/**
 * Renders the circle and tooltip for a node.
 *
 * @param attributeToPreview The attribute to preview, i.e., whose slider the user hovers over.
 * @param node The node that this circle represents.
 * @param xScale The scale to which this node's X-coordinate is scaled to.
 * @param yScale The scale to which this node's Y-coordinate is scaled to.
 */
const CircleWithTooltip = (
    {
        attributeToPreview,
        node,
        xScale,
        yScale,
    }: {
        attributeToPreview: string | undefined,
        node: Node,
        xScale: ScaleLinear<number, number>,
        yScale: ScaleLinear<number, number>
    }) => {
    const isVisible = attributeToPreview === undefined;
    const radius = node.id === 'rootSearch' ? rootCircleRadius : smallRadius;

    // The conditional delay (i.e., last time) is necessary as the animation entry and exit execute in inverse order.
    const circleTransition = `fill-opacity ${duration}ms ease-in-out ${isVisible ? duration * 2 : 0}ms`;
    const fillOpacities = {
        entering: { fillOpacity: transparent },
        entered: { fillOpacity: opaque },
        exiting: { fillOpacity: opaque },
        exited: { fillOpacity: transparent },
        unmounted: { fillOpacity: 0 },
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
                        </tr>
                        <tr>
                            <td>Keywords</td>
                            <td>{node.keywords}</td>
                            <td>{node.keywordsScore}</td>
                        </tr>
                        <tr>
                            <td>#Employees</td>
                            <td>{node.numEmployees}</td>
                            <td>{node.employeesScore}</td>
                        </tr>
                        <tr>
                            <td>Revenue</td>
                            <td>{node.revenue}</td>
                            <td>{node.revenueScore}</td>
                        </tr>
                        </tbody>
                    </FormattedTable>
                </WideTooltip>
            }
        >
            {/* The wrapping group is necessary for the tooltip to work. */}
            <g>
                <Transition in={isVisible} timeout={duration}>
                    {state =>
                        <circle
                            cx={xScale(node.x)}
                            cy={yScale(node.y)}
                            fillOpacity={isVisible ? opaque : transparent}
                            r={radius}
                            style={{
                                transition: circleTransition,
                                ...fillOpacities[state],
                            }}
                        />
                    }
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
