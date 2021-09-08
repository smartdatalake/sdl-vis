import React from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Zoom } from '@visx/zoom';
import styled from 'styled-components';
import TimeSeriesPlot from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/TimeSeriesPlot';
import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';

const StyledSVG = styled.svg`
    flex-grow: 1;
    background: var(--gray-dark);
`;

const INITIAL_TRANSFORM = {
    scaleX: 1,
    scaleY: 1,
    translateX: 100,
    translateY: 100,
    skewX: 0,
    skewY: 0,
};

const SCALE_PARAMS = {
    scaleXMin: 1 / 16,
    scaleXMax: 8,
    scaleYMin: 1 / 16,
    scaleYMax: 8,
};

interface Props {
    correlations: CorrelationResponse;
}

const TimeSeriesPlotSVG = (props: Props) => {
    // const vis = <rect x={100} y={100} width={100} height={100} style={{ fill: 'gray' }} />;

    const vis = <TimeSeriesPlot width={800} height={500} {...props} />;

    return (
        <ParentSize debounceTime={10}>
            {(parentSize) => (
                <Zoom
                    width={parentSize.width}
                    height={parentSize.height}
                    {...SCALE_PARAMS}
                    transformMatrix={INITIAL_TRANSFORM}
                >
                    {(zoom) => {
                        return (
                            <StyledSVG
                                width={parentSize.width}
                                height={parentSize.height}
                                onTouchStart={zoom.dragStart}
                                onTouchMove={zoom.dragMove}
                                onTouchEnd={zoom.dragEnd}
                                onMouseDown={zoom.dragStart}
                                onMouseUp={zoom.dragEnd}
                                onMouseMove={zoom.dragMove}
                            >
                                <g transform={zoom.toString()}>{vis}</g>
                            </StyledSVG>
                        );
                    }}
                </Zoom>
            )}
        </ParentSize>
    );
};

export default TimeSeriesPlotSVG;
