import React, { useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis, curveNatural } from '@visx/curve';
import { CorrelationTimeSeriesEntry, TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';
import { LinkingAndBrushingContext } from 'App/hooks/LinkingAndBrushingContext';
import { useHovered } from 'App/hooks/useHovered';
import { TimeSeriesContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesContext';

type ValueAccessor = (v: TimePoint) => number;

interface Props {
    ts: CorrelationTimeSeriesEntry;
    xAcc: ValueAccessor;
    yAcc: ValueAccessor;
}

const PlotLine: React.FunctionComponent<Props> = ({ ts, xAcc, yAcc }: Props) => {
    const { useLink, useBrush } = React.useContext(LinkingAndBrushingContext);
    const { nodeColorScale } = React.useContext(TimeSeriesContext);

    const [hovered, onHoverHandler, onUnhoverHandler] = useHovered();

    const [linked, setLinked] = useState<boolean>(false);

    useBrush<string | undefined>('ts-hovered', () => (hovered ? ts.tsName : undefined), [hovered]);
    useLink<string>('ts-hovered', (tsName) => setLinked(tsName === ts.tsName));

    return (
        <>
            <LinePath
                data={ts.rawDatapoints}
                curve={curveNatural}
                x={xAcc}
                y={yAcc}
                stroke={nodeColorScale(ts.tsName) ?? '#000'}
                strokeWidth={linked ? 4 : 2}
            />
            <g>
                {ts.rawDatapoints.map((dp, idx) => (
                    <circle
                        key={`dp-marker/${idx}`}
                        style={{ fill: 'none', stroke: nodeColorScale(ts.tsName) ?? '#000' }}
                        r={5}
                        cx={xAcc(dp)}
                        cy={yAcc(dp)}
                    />
                ))}
            </g>
            <LinePath
                onMouseOver={onHoverHandler}
                onMouseOut={onUnhoverHandler}
                data={ts.rawDatapoints}
                curve={curveBasis}
                x={xAcc}
                y={yAcc}
                stroke={'rgba(0,0,0,0)'}
                strokeWidth={10}
            />
        </>
    );
};

export default PlotLine;
