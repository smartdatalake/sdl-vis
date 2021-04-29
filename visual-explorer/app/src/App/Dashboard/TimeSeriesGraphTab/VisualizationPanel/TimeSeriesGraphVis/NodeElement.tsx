import React, { useState } from 'react';
import { TimeSeriesCorrelationGraphNode } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';
import { darker, lightest } from 'tools/color';
import { Text } from '@visx/text';
import { useTooltipInPortal } from '@visx/tooltip';

const TEXT_BOX_PADDING = 5;

interface Props {
    node: TimeSeriesCorrelationGraphNode;
    size: number;
}

const NodeElement: React.FunctionComponent<Props> = ({ node, size }: Props) => {
    const [textRef, setTextRef] = useState<SVGSVGElement | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

    const textBBox = textRef?.getBBox() ?? new DOMRect();

    const { TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    });

    return (
        <g
            onMouseOver={(e) => setHoverPos({ x: e.pageX, y: e.clientY })}
            onMouseMove={(e) => setHoverPos({ x: e.pageX, y: e.clientY })}
            onMouseOut={() => setHoverPos(null)}
        >
            <rect
                rx={5}
                x={textBBox.x - TEXT_BOX_PADDING}
                y={textBBox.y - TEXT_BOX_PADDING}
                width={textBBox.width + 2 * TEXT_BOX_PADDING}
                height={textBBox.height + 2 * TEXT_BOX_PADDING}
                style={{ stroke: darker(node.color), fill: lightest(node.color), strokeWidth: 2 }}
            />
            <Text
                innerRef={(ref) => setTextRef(ref)}
                verticalAnchor="middle"
                textAnchor="middle"
                pointerEvents={'none'}
                // fill={darkest(node.color)}
                fill={'var(--gray-dark)'}
                x={node.x}
                y={node.y}
            >
                {`${node.id}: ${node.name.substr(0, 5)}`}
            </Text>
            {hoverPos && (
                <TooltipInPortal key={Math.random()} top={hoverPos.y} left={hoverPos.x}>
                    {node.id}: <strong>{node.name}</strong>
                </TooltipInPortal>
            )}
        </g>
    );
};

export default NodeElement;
