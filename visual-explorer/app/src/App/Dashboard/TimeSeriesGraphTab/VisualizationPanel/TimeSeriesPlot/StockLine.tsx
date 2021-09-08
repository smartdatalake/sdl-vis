import React, { useCallback, useMemo, useState } from 'react';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { CorrelationTimeSeriesEntry } from 'types/TimeSeriesGraph/CorrelationResponse';
import { LinkingAndBrushingContext } from 'App/hooks/LinkingAndBrushingContext';
import { useHovered } from 'App/hooks/useHovered';
import { ColorScaleContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/ColorScaleContext';
import { SelectionContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/SelectionContext';
import { ValueAccessor } from 'types/TimeSeriesGraph/ValueAccessor';

interface Props {
    ts: CorrelationTimeSeriesEntry;
    xAcc: ValueAccessor;
    yAcc: ValueAccessor;
}

const PlotLine: React.FunctionComponent<Props> = ({ ts, xAcc, yAcc }: Props) => {
    const { useLink, useBrush } = React.useContext(LinkingAndBrushingContext);
    const { nodeColorScale } = React.useContext(ColorScaleContext);
    const { toggleTimeseriesSelection, isTimeseriesSelected } = React.useContext(SelectionContext);

    const [hovered, onHoverHandler, onUnhoverHandler] = useHovered();

    const [linked, setLinked] = useState<boolean>(false);

    useBrush<string | undefined>('ts-hovered', () => (hovered ? ts.tsName : undefined), [hovered]);
    useLink<string>('ts-hovered', (tsName) => setLinked(tsName === ts.tsName));

    const timeSeriesOnClickHandler = useCallback(
        (e: React.MouseEvent<SVGElement>) => {
            toggleTimeseriesSelection(ts.tsName);
        },
        [ts, toggleTimeseriesSelection]
    );

    const isSelected = useMemo(() => isTimeseriesSelected(ts.tsName), [ts, isTimeseriesSelected]);

    return (
        <>
            <LinePath
                data={ts.rawDatapoints}
                x={xAcc}
                y={yAcc}
                stroke={nodeColorScale(ts.tsName) ?? '#000'}
                strokeWidth={isSelected ? 4 : 2}
            />
            <g>
                {ts.rawDatapoints.map((dp, idx) => (
                    <circle
                        key={`dp-marker/${idx}`}
                        style={{
                            fill: linked ? nodeColorScale(ts.tsName) : 'none',
                            stroke: nodeColorScale(ts.tsName),
                        }}
                        r={5}
                        cx={xAcc(dp)}
                        cy={yAcc(dp)}
                    />
                ))}
            </g>
            <LinePath
                onMouseOver={onHoverHandler}
                onMouseOut={onUnhoverHandler}
                onClick={timeSeriesOnClickHandler}
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
