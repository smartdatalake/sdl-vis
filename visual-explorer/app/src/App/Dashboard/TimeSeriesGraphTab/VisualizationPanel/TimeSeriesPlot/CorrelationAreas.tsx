import React from 'react';
import { CorrelationResponse, CorrelationTimeSeriesEntry, TimePoint } from 'types/TimeSeriesGraph/CorrelationResponse';
import { ValueAccessor } from 'types/TimeSeriesGraph/ValueAccessor';
import { SelectionContext } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/SelectionContext';
import { Threshold } from '@visx/threshold';
import styled from 'styled-components';
import { interpolateRdBu } from 'd3-scale-chromatic';
import { lightest } from 'tools/color';
import _ from 'lodash';
import { advanceDateByDays } from 'tools/helpers';
import { Text } from '@visx/text';
import { interpolateNumber } from 'd3-interpolate';

interface Props {
    correlations: CorrelationResponse;
    xAcc: ValueAccessor;
    yAcc: ValueAccessor;
}

const StyledText = styled(Text)`
    dominant-baseline: middle;
    text-anchor: middle;
`;

const colorInterpolator = (t: number) => interpolateRdBu((-t + 1) / 2);
const findTpIndexWithDate = (ts: CorrelationTimeSeriesEntry, date: Date): number | null => {
    const index = ts.rawDatapoints.findIndex((tp) => tp.date.valueOf() === date.valueOf());
    return index >= 0 ? index : null;
};

const CorrelationAreas: React.FunctionComponent<Props> = ({ correlations, xAcc, yAcc }: Props) => {
    const { selectedTimeseries } = React.useContext(SelectionContext);

    const elements: JSX.Element[] = [];

    if (selectedTimeseries.length === 2) {
        const ts1Name = selectedTimeseries[0];
        const ts2Name = selectedTimeseries[1];

        const ts1Index = correlations.timeseries.findIndex((ts) => ts.tsName === ts1Name);
        const ts2Index = correlations.timeseries.findIndex((ts) => ts.tsName === ts2Name);

        if (ts1Index >= 0 && ts2Index >= 0) {
            const ts1 = correlations.timeseries[ts1Index];
            const ts2 = correlations.timeseries[ts2Index];

            // Okay, here we're at the point where we have found the two time-series of interest, their name,
            // and their index. The problem is that the raw values are only available for certain days
            // (e.g., weekdays), while the correlations are available for each equally spaced interval. Therefore,
            // there are most likely more correlation points than time points. The solution here is to fill the array
            // of time points with "dummy" time points, where no value is available.
            // The current method assumes the interval between two time-points is exactly one day.
            const ts1TpsComplete: TimePoint[] = [];
            const ts2TpsComplete: TimePoint[] = [];

            const dateStart = ts1.rawDatapoints[0].date;
            _.range(correlations.correlations.length + 1).map((corrIndex) => {
                // Calculate the date at our current index.
                const dateCurr = advanceDateByDays(dateStart, corrIndex);

                // Get the index of the datapoint with the specified date.
                const tpIndex = findTpIndexWithDate(ts1, dateCurr);

                if (tpIndex !== null) {
                    // ts1 and ts2 should share an identical structure. This is assumed when
                    // adding the time points here.
                    ts1TpsComplete.push(ts1.rawDatapoints[tpIndex]);
                    ts2TpsComplete.push(ts2.rawDatapoints[tpIndex]);
                } else {
                    // There is no datapoint with the hypothetical date of the correlation point.
                    // Interpolate between the closest time points.

                    // Start with a backward search to find the last valid time point, starting from the current date.
                    let lastExistingDate: Date = dateCurr;
                    let lastExistingIndex: number | null = null;
                    for (let i = 0; i < 1000; i++) {
                        lastExistingDate = advanceDateByDays(dateCurr, -i);
                        lastExistingIndex = findTpIndexWithDate(ts1, lastExistingDate);
                        if (lastExistingIndex !== null) break;
                    }

                    // Next, do a forward search to find the next valid time point, starting from the current date.
                    let nextExistingDate: Date = dateCurr;
                    let nextExistingIndex: number | null = -1;
                    for (let i = 0; i < 1000; i++) {
                        nextExistingDate = advanceDateByDays(dateCurr, i);
                        nextExistingIndex = findTpIndexWithDate(ts1, nextExistingDate);
                        if (nextExistingIndex !== null) break;
                    }

                    // If indices for both the last and the next timepoints were found, compute the hypothetical
                    // time point at the current date by interpolating x- and y values.
                    if (lastExistingIndex !== null && nextExistingIndex !== null) {
                        // This is the position of the imaginary point on the x-Axis.
                        // Needed to interpolate y-Values.
                        const xFraction =
                            (dateCurr.valueOf() - lastExistingDate.valueOf()) /
                            (nextExistingDate.valueOf() - lastExistingDate.valueOf());

                        const interpolatedTp1 = {
                            value: interpolateNumber(
                                ts1.rawDatapoints[lastExistingIndex].value,
                                ts1.rawDatapoints[nextExistingIndex].value
                            )(xFraction),
                            date: dateCurr,
                        };

                        const interpolatedTp2 = {
                            value: interpolateNumber(
                                ts2.rawDatapoints[lastExistingIndex].value,
                                ts2.rawDatapoints[nextExistingIndex].value
                            )(xFraction),
                            date: dateCurr,
                        };

                        ts1TpsComplete.push(interpolatedTp1);
                        ts2TpsComplete.push(interpolatedTp2);
                    }
                }
            });

            correlations.correlations.forEach((corrMatrix, corrIdx) => {
                const ts1Tp1 = ts1TpsComplete[corrIdx];
                const ts1Tp2 = ts1TpsComplete[corrIdx + 1];
                const ts2Tp1 = ts2TpsComplete[corrIdx];
                const ts2Tp2 = ts2TpsComplete[corrIdx + 1];

                const data = [
                    {
                        x: xAcc(ts1Tp1),
                        y0: yAcc(ts1Tp1),
                        y1: yAcc(ts2Tp1),
                    },
                    {
                        x: xAcc(ts1Tp2),
                        y0: yAcc(ts1Tp2),
                        y1: yAcc(ts2Tp2),
                    },
                ];

                // Up to this point, corrMatrix is a square matrix containing all correlations
                // at the current time step. Extract the value at [ts1Index, ts2Index].
                const corr = corrMatrix.get([ts1Index, ts2Index]);
                const corrColor = colorInterpolator(corr);

                elements.push(
                    <g key={`${ts1Name}_${ts2Name}_corr-${corrIdx}`}>
                        <Threshold<{ x: number; y0: number; y1: number }>
                            id={`${ts1Name}_${ts2Name}_corr-${corrIdx}`}
                            data={data}
                            x={(d) => d.x}
                            y0={(d) => d.y0}
                            y1={(d) => d.y1}
                            belowAreaProps={{
                                fill: corrColor,
                                fillOpacity: 0.2,
                            }}
                            aboveAreaProps={{
                                fill: corrColor,
                                fillOpacity: 0.2,
                            }}
                            clipAboveTo={0}
                            clipBelowTo={0}
                        />
                        <StyledText
                            x={(data[0].x + data[1].x) / 2}
                            y={(data[0].y0 + data[1].y0 + data[0].y1 + data[1].y1) / 4}
                            style={{ fill: lightest(corrColor) }}
                            angle={90}
                        >
                            {Math.round(corr * 100) / 100}
                        </StyledText>
                    </g>
                );
            });
        }
    }

    return <g id={'correlation-areas'}>{elements}</g>;
};

export default CorrelationAreas;
