import { CorrelationResponse } from 'types/TimeSeriesGraph/CorrelationResponse';
import { interpolateCustombow, ordinalColorscale } from 'tools/color';
import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

export interface TimeSeriesCorrelationGraphLink extends SimulationLinkDatum<TimeSeriesCorrelationGraphNode> {
    sourceId: number;
    targetId: number;
    source: TimeSeriesCorrelationGraphNode;
    target: TimeSeriesCorrelationGraphNode;
    weight: number;
}

export interface TimeSeriesCorrelationGraphNode extends SimulationNodeDatum {
    id: number;
    name: string;
}

export interface TimeSeriesCorrelationGraph {
    nodes: TimeSeriesCorrelationGraphNode[];
    links: TimeSeriesCorrelationGraphLink[];
}

export function constructTSCorrelationGraph(
    correlationResponse: CorrelationResponse,
    useAbsCorrelation: boolean
): TimeSeriesCorrelationGraph {
    const timeseries = correlationResponse.timeseries;
    const correlations = useAbsCorrelation
        ? correlationResponse.meanAbsCorrelation
        : correlationResponse.meanCorrelation;

    const g: TimeSeriesCorrelationGraph = {
        nodes: [],
        links: [],
    };

    const tsNames = timeseries.map((ts) => ts.tsName);
    const tsColorScale = ordinalColorscale(
        timeseries.map((ts) => ts.tsName),
        interpolateCustombow
    );

    g.nodes = tsNames.map((tsName, idx) => ({ id: idx, name: tsName, color: tsColorScale(tsName) }));

    for (let srcIdx = 0; srcIdx < correlations.size()[0]; srcIdx++) {
        for (let targetIdx = srcIdx + 1; targetIdx < correlations.size()[1]; targetIdx++) {
            const link: TimeSeriesCorrelationGraphLink = {
                sourceId: srcIdx,
                targetId: targetIdx,
                source: g.nodes[srcIdx],
                target: g.nodes[targetIdx],
                weight: correlations.get([srcIdx, targetIdx]),
            };

            g.links.push(link);
        }
    }

    return g;
}
