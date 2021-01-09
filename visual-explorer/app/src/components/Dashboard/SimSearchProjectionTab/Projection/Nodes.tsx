import { ScaleLinear } from 'd3';
import React, { useContext } from 'react';
import Context from '../Context';
import CircleWithTooltip from './CircleWithTooltip';
import ConnectedCircle from './ConnectedCircle';
import { ColoredNode, Node } from './ProjectionSVG';

/**
 * Renders all current nodes with their previews in other states if available.
 *
 * @param nodesWithPreview The current nodes and their previews in other states.
 * @param xScale The scale to which a node's X-coordinate is scaled to.
 * @param yScale The scale to which a node's Y-coordinate is scaled to.
 */
const Nodes = ({
    nodesWithPreview,
    xScale,
    yScale,
}: {
    nodesWithPreview: [Node | undefined, ColoredNode[]][];
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}) => {
    const { attributeToPreview } = useContext(Context);

    return (
        <g>
            {nodesWithPreview.map(([currentNode, nodesToPreview], index) =>
                nodesToPreview.length > 0 ? (
                    <ConnectedCircle
                        attributeToPreview={attributeToPreview}
                        nodesToPreview={nodesToPreview}
                        node={currentNode}
                        key={index}
                        xScale={xScale}
                        yScale={yScale}
                    />
                ) : null
            )}
            {nodesWithPreview.map(([currentNode, nodesToPreview], index) =>
                currentNode ? (
                    <CircleWithTooltip
                        attributeToPreview={attributeToPreview}
                        node={currentNode}
                        key={index}
                        xScale={xScale}
                        yScale={yScale}
                    />
                ) : null
            )}
        </g>
    );
};

export default Nodes;
