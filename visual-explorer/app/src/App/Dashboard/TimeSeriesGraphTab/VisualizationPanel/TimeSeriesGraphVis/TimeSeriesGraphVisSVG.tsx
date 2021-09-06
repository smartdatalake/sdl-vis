import React from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Zoom } from '@visx/zoom';
import styled from 'styled-components';
import TimeSeriesGraphVis from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesGraphVis/TimeSeriesGraphVis';
import { TimeSeriesCorrelationGraph } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';

const StyledSVG = styled.svg`
    flex-grow: 1;
    background: var(--light);
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
    correlationGraph: TimeSeriesCorrelationGraph;
}

const TimeSeriesGraphVisSVG = (props: Props) => {
    const vis = <TimeSeriesGraphVis {...props} />;

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

export default TimeSeriesGraphVisSVG;