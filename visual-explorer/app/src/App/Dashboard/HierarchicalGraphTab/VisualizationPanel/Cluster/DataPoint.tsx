import React from 'react';
import { useTooltipInPortal } from '@visx/tooltip';
import { Circle } from '@visx/shape';
import { Point } from '@visx/zoom/lib/types';
import { HierarchicalGraphNode } from 'types/HierarchicalGraphLevel';

interface Props {
    x: number;
    y: number;
    color: string;
    dataPoint: HierarchicalGraphNode;
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
                            {Object.entries(dataPoint)
                                .filter(([k, v]) => k !== 'attributes')
                                .map(([k, v]) => (
                                    <tr key={k}>
                                        <td>{k}</td>
                                        <td>{v}</td>
                                    </tr>
                                ))}
                            <tr style={{ borderBottom: '1px solid var(--gray)', padding: 10 }}>
                                <td style={{ paddingTop: 10 }} />
                            </tr>
                            <tr>
                                <td style={{ paddingBottom: 10 }} />
                            </tr>
                            {Object.entries(dataPoint.attributes).map(([k, v]) => (
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
