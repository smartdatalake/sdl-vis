import React from 'react';
import { useTooltipInPortal } from '@visx/tooltip';
import { Circle } from '@visx/shape';
import { Point } from '@visx/zoom/lib/types';
import { FormattedGraphDataRow } from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVis';

interface Props {
    x: number;
    y: number;
    color: string;
    dataPoint: FormattedGraphDataRow;
}

const DataPoint: React.FunctionComponent<Props> = ({ x, y, color, dataPoint }: Props) => {
    const [hoverPos, setHoverPos] = React.useState<Point | undefined>();

    const { TooltipInPortal } = useTooltipInPortal();

    const fillOpacity = 1;

    return (
        <>
            <Circle
                onMouseOver={(e: React.MouseEvent<SVGCircleElement>) => setHoverPos({ x: e.pageX, y: e.pageY })}
                onMouseLeave={() => setHoverPos(undefined)}
                cx={x}
                cy={y}
                r={5}
                fill={color}
                fillOpacity={fillOpacity}
            />
            {hoverPos && (
                <TooltipInPortal
                    // set this to random so it correctly updates with parent bounds
                    key={Math.random()}
                    top={hoverPos?.y}
                    left={hoverPos?.x}
                >
                    <table>
                        <tbody>
                            {Object.entries(dataPoint).map(([k, v]) => (
                                <tr key={k}>
                                    <td>{k}</td>
                                    <td>{v}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TooltipInPortal>
            )}
        </>
    );
};
export default React.memo(DataPoint);
