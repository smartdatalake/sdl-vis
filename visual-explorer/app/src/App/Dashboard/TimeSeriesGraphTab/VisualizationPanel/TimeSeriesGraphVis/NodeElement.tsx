import React, { useState } from 'react';
import { TimeSeriesCorrelationGraphNode } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';
import { lightest } from 'tools/color';
import { Text } from '@visx/text';
import { useTooltipInPortal } from '@visx/tooltip';
import { LinkingAndBrushingContext } from 'App/hooks/LinkingAndBrushingContext';
import { TimeSeriesContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesContext';

const TEXT_BOX_PADDING = 5;

interface Props {
    node: TimeSeriesCorrelationGraphNode;
}

const NodeElement: React.FunctionComponent<Props> = ({ node }: Props) => {
    const { useLink, useBrush } = React.useContext(LinkingAndBrushingContext);
    const { nodeColorScale } = React.useContext(TimeSeriesContext);

    const [textRef, setTextRef] = useState<SVGSVGElement | null>(null);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

    const [linked, setLinked] = useState<boolean>(false);

    const textBBox = textRef?.getBBox() ?? new DOMRect();

    const { TooltipInPortal } = useTooltipInPortal({
        // use TooltipWithBounds
        detectBounds: true,
        // when tooltip containers are scrolled, this will correctly update the Tooltip position
        scroll: true,
    });

    useBrush<string | undefined>('ts-hovered', () => (hoverPos ? node.name : undefined), [hoverPos]);
    useLink<string>('ts-hovered', (tsName) => setLinked(tsName === node.name));

    const hovered = hoverPos || linked;

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
                style={{
                    stroke: nodeColorScale(node.name),
                    fill: lightest(nodeColorScale(node.name)),
                    strokeWidth: hovered ? 4 : 2,
                }}
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
