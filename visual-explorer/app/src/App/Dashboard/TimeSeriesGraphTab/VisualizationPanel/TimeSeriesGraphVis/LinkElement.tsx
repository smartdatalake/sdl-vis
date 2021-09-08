import React, { useState } from 'react';
import { Text } from '@visx/text';
import { TimeSeriesCorrelationGraphLink } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';
import { ColorScaleContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/ColorScaleContext';

const TEXT_BOX_PADDING = 5;

interface Props {
    link: TimeSeriesCorrelationGraphLink;
}

const LinkElement: React.FunctionComponent<Props> = ({ link }: Props) => {
    const { linkColorScale } = React.useContext(ColorScaleContext);
    const [textRef, setTextRef] = useState<SVGSVGElement | null>(null);

    const textBBox = textRef?.getBBox();

    return (
        <>
            <line
                x1={link.source.x}
                y1={link.source.y}
                x2={link.target.x}
                y2={link.target.y}
                style={{
                    // stroke: `rgba(52, 58, 64, ${link.weight * link.weight})`,
                    stroke: linkColorScale(link.weight),
                    strokeWidth: link.weight * link.weight * 5,
                }}
            />
            {textBBox && (
                <rect
                    rx={5}
                    x={textBBox.x - TEXT_BOX_PADDING}
                    y={textBBox.y - TEXT_BOX_PADDING}
                    width={textBBox.width + 2 * TEXT_BOX_PADDING}
                    height={textBBox.height + 2 * TEXT_BOX_PADDING}
                    style={{ fill: 'rgba(255,255,255,0.8)' }}
                />
            )}
            <Text
                innerRef={(ref) => setTextRef(ref)}
                verticalAnchor="middle"
                textAnchor="middle"
                pointerEvents={'none'}
                fill={'black'}
                x={((link.source.x ?? 0) + (link.target.x ?? 0)) / 2}
                y={((link.source.y ?? 0) + (link.target.y ?? 0)) / 2}
            >
                {link.weight.toFixed(2)}
            </Text>
        </>
    );
};
export default LinkElement;
