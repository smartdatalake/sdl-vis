import SVGPanZoom from 'components/SVGPanZoom';
import { scaleLinear } from 'd3';
import React from 'react';
import { Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import { SearchParameterName } from '../SearchParameters';
import useSimilaritySearch, {
    SimilarityGraph,
    SimilaritySearchStates,
    VaryingSimilarityGraphs,
} from '../useSimilaritySearch';
import SimilaritySearch from './SimilaritySearch';
import ProjectionTable from './ProjectionTable';
import { computeColor } from 'components/Dashboard/SimSearchProjectionTab/Projection/computeColor';

export interface Node {
    x: number;
    y: number;
    id: string;
    keywords: string;
    keywordsScore: number;
    numEmployees: string;
    employeesScore: number;
    location: number;
    locationScore: number;
    revenue: string;
    revenueScore: number;
    totalScore: number;
    cluster: number;
    size: number;
    fillColor: string;
    rank: string | number;
}

export interface ColoredNode extends Node {
    attribute: SearchParameterName;
    strokeColor: string;
}

export interface WeightedEdge {
    left: string;
    right: string;
    score: number;
}

export const duration = 300;
export const opaque = 1;
const plotSideLength = 400;
export const rootCircleRadius = 7;
export const stroke = 'gray';

const CenteredSpinner = styled(Spinner)`
    margin: auto;
`;

/**
 * Renders the data points that are most similar to a given query. Connects the rendered data points with edges that
 * represent the similarity between two data points. Overlays the graph with predicted data points after a parameter
 * change of the similarity search.
 *
 * By default, `predictedDataPoints` is a matrix with six rows that provide the predicted data points for the three
 * default query attributes (i.e., `keywords`, `revenue`, and `employees`). The first row of each pair gives the
 * predicted data points for a negative delta (i.e., -0.2), while the second row represents the positive counterpart.
 */
const ProjectionSVG = () => {
    const similaritySearch = useSimilaritySearch();

    if (!similaritySearch) return <CenteredSpinner animation="grow" />;

    const [xScale, yScale] = computeScalesForSimilaritySearches([
        similaritySearch,
    ]);

    similaritySearch.current.points.forEach(pt => {
        pt.fillColor = computeColor(pt, xScale, yScale);
    });

    return (
        <>
            <SVGPanZoom
                centeredAtStart={true}
                contentHeight={plotSideLength}
                contentWidth={plotSideLength}
                height="100%"
                width="100%"
            >
                <SimilaritySearch
                    similaritySearchStates={similaritySearch}
                    xScale={xScale}
                    yScale={yScale}
                />
            </SVGPanZoom>
            <ProjectionTable similaritySearchStates={similaritySearch} />
        </>
    );
};

const computeScalesForSimilaritySearches = (
    similaritySearches: SimilaritySearchStates[]
) => {
    const dataPoints = similaritySearches
        .map(similaritySearch =>
            Object.entries(similaritySearch).map(([key, value]) => {
                if (key === 'current') {
                    return (value as SimilarityGraph).points;
                } else {
                    return [
                        ...((value as VaryingSimilarityGraphs).decreased
                            ? (value as VaryingSimilarityGraphs).decreased!
                                  .points
                            : []),
                        ...((value as VaryingSimilarityGraphs).increased
                            ? (value as VaryingSimilarityGraphs).increased!
                                  .points
                            : []),
                    ];
                }
            })
        )
        .flat(2);

    let minimumX = Infinity;
    let minimumY = Infinity;
    let maximumX = -Infinity;
    let maximumY = -Infinity;

    dataPoints.forEach(dataPoint => {
        if (dataPoint.x < minimumX) minimumX = dataPoint.x;
        if (dataPoint.x > maximumX) maximumX = dataPoint.x;
        if (dataPoint.y < minimumY) minimumY = dataPoint.y;
        if (dataPoint.y > maximumY) maximumY = dataPoint.y;
    });

    const xScale = scaleLinear()
        .domain([minimumX, maximumX])
        .range([0, plotSideLength]);
    const yScale = scaleLinear()
        .domain([minimumY, maximumY])
        .range([plotSideLength, 0]);

    return [xScale, yScale];
};

export default ProjectionSVG;
