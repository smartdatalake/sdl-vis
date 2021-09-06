import * as React from 'react';
import TimeSeriesPlotSVG from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesPlot/TimeSeriesPlotSVG';
import TimeSeriesGraphVisSVG from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesGraphVis/TimeSeriesGraphVisSVG';
import styled from 'styled-components';
import { constructTSCorrelationGraph } from 'types/TimeSeriesGraph/TimeSeriesCorrelationGraph';
import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { LinkingAndBrushingContextProvider } from 'App/hooks/LinkingAndBrushingContextProvider';
import { scaleLinear, scaleOrdinal } from '@visx/scale';
import { schemeTableau10 } from 'd3-scale-chromatic';
import { useMemo, useState } from 'react';
import { TimeSeriesContextProvider } from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/TimeSeriesContextProvider';
import { bounds } from 'tools/helpers';
import ToggleAbsoluteWeightsSwitch from 'App/Dashboard/TimeSeriesGraphTab/VisualizationPanel/ToggleAbsoluteWeightsSwitch';
import { interpolateRdBkBl } from 'tools/color';

const VerticalContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
`;

const StyledHr = styled.hr`
    border-top: 2px solid white;
    margin: 0;
`;

const useAbsoluteCorrelationsSwitch = (): [boolean, (toggle: boolean) => void] => {
    const [useAbsoluteCorrelations, setUseAbsoluteCorrelations] = useState(false);

    const switchHandler = useMemo(
        () => (toggled: boolean) => {
            setUseAbsoluteCorrelations(toggled);
        },
        []
    );

    return [useAbsoluteCorrelations, switchHandler];
};

interface Props {
    correlations: CorrelationResponse;
}

const VisualizationPanel = ({ correlations }: Props) => {
    const [useAbsoluteCorrelations, switchHandler] = useAbsoluteCorrelationsSwitch();

    const correlationGraph = constructTSCorrelationGraph(correlations, useAbsoluteCorrelations);
    const tsArray = correlations.timeseries;

    const nodeColorScale = useMemo(
        () =>
            scaleOrdinal({
                domain: tsArray.map((ts) => ts.tsName),
                range: [...schemeTableau10],
            }),
        [tsArray]
    );

    const linkColorScale = useMemo(() => {
        const domain = bounds(correlationGraph.links.map((l) => l.weight));
        const normalize = scaleLinear<number>().domain([domain.min, domain.max]).range([0, 1]);
        return (t: number) => interpolateRdBkBl(normalize(t));
    }, [correlationGraph]);

    return (
        <VerticalContainer>
            <LinkingAndBrushingContextProvider>
                <TimeSeriesContextProvider nodeColorScale={nodeColorScale} linkColorScale={linkColorScale}>
                    <TimeSeriesPlotSVG tsArray={tsArray} />
                    <StyledHr />
                    <div style={{ position: 'relative', height: '100%' }}>
                        <div style={{ position: 'absolute', top: 20, left: 20 }}>
                            <ToggleAbsoluteWeightsSwitch onToggleHandler={switchHandler} />
                        </div>
                        <TimeSeriesGraphVisSVG correlationGraph={correlationGraph} />
                    </div>
                </TimeSeriesContextProvider>
            </LinkingAndBrushingContextProvider>
        </VerticalContainer>
    );
};

export default VisualizationPanel;
