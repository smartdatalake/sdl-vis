import React from 'react';
import ParentSize from '@visx/responsive/lib/components/ParentSize';
import { Zoom } from '@visx/zoom';
import styled from 'styled-components';
import HierachicalGraphVis from 'App/Dashboard/HierarchicalGraphTab/VisualizationPanel/HierachicalGraphVis';
import { DataArray } from 'types/DataArray';

const ScrollContainer = styled.div`
    flex-grow: 1;

    display: block;
    position: relative;
    overflow-y: auto;
    overflow-x: hidden;

    background: #e5e7ea;
`;

const InspectionPanelContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
`;

const StyledSVG = styled.svg`
    flex-grow: 1;
    background: white;
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
    graphData: DataArray;
}

const HierachicalGraphVisSVG = ({ graphData }: Props) => {
    return (
        <ScrollContainer>
            <InspectionPanelContainer>
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
                                        <g transform={zoom.toString()}>
                                            <HierachicalGraphVis
                                                width={parentSize.width}
                                                height={parentSize.height}
                                                graphData={graphData}
                                            />
                                        </g>
                                    </StyledSVG>
                                );
                            }}
                        </Zoom>
                    )}
                </ParentSize>
            </InspectionPanelContainer>
        </ScrollContainer>
    );
};

export default HierachicalGraphVisSVG;
