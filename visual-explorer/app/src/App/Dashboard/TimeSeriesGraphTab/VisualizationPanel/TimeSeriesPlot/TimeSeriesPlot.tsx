import React, { useContext } from 'react';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleTime } from '@visx/scale';
import { Margin } from 'types/Margin';
import { getNumberFormatter } from 'tools/helpers';
import 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/TimeSeriesPlot.scss';
import { tsArrayReducer } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/ts-reducer';
import { CorrelationResponse, TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';
import PlotLine from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/StockLine';
import { Text } from '@visx/text';
import styled from 'styled-components';
import { ColorScaleContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/ColorScaleContext';
import CorrelationAreas from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/CorrelationAreas';

const DEFAULT_MARGIN: Margin = { top: 10, right: 25, bottom: 35, left: 45 };

const StockLabelText = styled(Text)`
    dominant-baseline: middle;
    font-size: 12px;
`;

interface Props {
    correlations: CorrelationResponse;
    width: number;
    height: number;
    margin?: Margin;
}

const TimeSeriesPlot: React.FunctionComponent<Props> = ({
    correlations,
    width,
    height,
    margin = DEFAULT_MARGIN,
}: Props) => {
    const { nodeColorScale } = useContext(ColorScaleContext);

    const timeAccessor = (tp: TimePoint) => tp?.date.valueOf() ?? 0;
    const valueAccessor = (tp: TimePoint) => tp?.value ?? 0;

    const xMax = width - margin.left - margin.right;
    const yMax = height - margin.top - margin.bottom;

    const timeScale = scaleTime<number>({
        domain: [
            tsArrayReducer(correlations.timeseries, timeAccessor, Math.min),
            tsArrayReducer(correlations.timeseries, timeAccessor, Math.max),
        ],
        range: [0, xMax],
    });
    const valueScale = scaleTime<number>({
        domain: [
            tsArrayReducer(correlations.timeseries, valueAccessor, Math.min),
            tsArrayReducer(correlations.timeseries, valueAccessor, Math.max),
        ],
        range: [yMax, 0],
    });

    return (
        <>
            <Group left={margin.left} top={margin.top}>
                <AxisLeft
                    tickClassName={'ts-tick'}
                    axisClassName={'ts-axis'}
                    tickFormat={getNumberFormatter(3)}
                    scale={valueScale}
                    numTicks={5}
                />
                <Text x="-70" y="15" transform="rotate(-90)" fill={'white'} fontSize={12}>
                    Price (USD)
                </Text>
                <AxisBottom
                    tickClassName={'ts-tick'}
                    axisClassName={'ts-axis'}
                    top={yMax}
                    scale={timeScale}
                    numTicks={5}
                />
                <Text x={xMax} y={yMax - 8} fill={'white'} fontSize={12} style={{ textAnchor: 'end' }}>
                    Date
                </Text>
                <CorrelationAreas
                    correlations={correlations}
                    xAcc={(tp: TimePoint) => timeScale(timeAccessor(tp)) ?? 0}
                    yAcc={(tp: TimePoint) => valueScale(valueAccessor(tp)) ?? 0}
                />
                {correlations.timeseries.map((ts) => {
                    const lastTp = ts.rawDatapoints.slice(-1)[0];

                    return (
                        <React.Fragment key={ts.tsName}>
                            <PlotLine
                                key={ts.tsName}
                                ts={ts}
                                xAcc={(tp: TimePoint) => timeScale(timeAccessor(tp)) ?? 0}
                                yAcc={(tp: TimePoint) => valueScale(valueAccessor(tp)) ?? 0}
                            />
                            <StockLabelText
                                style={{ fill: nodeColorScale(ts.tsName) }}
                                x={timeScale(timeAccessor(lastTp)) + 8}
                                y={valueScale(valueAccessor(lastTp))}
                            >
                                {ts.tsName}
                            </StockLabelText>
                        </React.Fragment>
                    );
                })}
            </Group>
        </>
    );
};

export default TimeSeriesPlot;
