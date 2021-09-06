import SVGPanZoom from 'App/SVGPanZoom';
import React, { useContext } from 'react';
import { Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import useSimilaritySearch, { SimilaritySearchStates, VaryingSimilarityGraphs } from '../useSimilaritySearch';
import SimilaritySearchContext from '../Context';
import SimilaritySearch from './SimilaritySearch';
import ProjectionTable from './ProjectionTable';
import { computeColor } from 'App/Dashboard/SimSearchProjectionTab/Projection/computeColor';
import { scaleLinear } from 'd3-scale';
import { SimilarityGraph, SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';

export interface ColoredNode extends SimilarityGraphNode {
    attribute: string;
    strokeColor: string;
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
    const { isLoading } = useContext(SimilaritySearchContext);
    const similaritySearch = useSimilaritySearch();

    if (isLoading) return <CenteredSpinner animation="grow" />;
    if (!similaritySearch) return null;

    const [xScale, yScale] = computeScalesForSimilaritySearches([similaritySearch]);

    similaritySearch.current.points.forEach((pt) => {
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
                <SimilaritySearch similaritySearchStates={similaritySearch} xScale={xScale} yScale={yScale} />
            </SVGPanZoom>
            <ProjectionTable similaritySearchStates={similaritySearch} />
        </>
    );
};

const computeScalesForSimilaritySearches = (similaritySearches: SimilaritySearchStates[]) => {
    const dataPoints = similaritySearches
        .map((similaritySearch) =>
            Object.entries(similaritySearch).map(([key, value]) => {
                if (key === 'current') {
                    return (value as SimilarityGraph).points;
                } else {
                    return [
                        ...((value as VaryingSimilarityGraphs).decreased?.points ?? []),
                        ...((value as VaryingSimilarityGraphs).increased?.points ?? []),
                    ];
                }
            })
        )
        .flat(2);

    let minimumX = Infinity;
    let minimumY = Infinity;
    let maximumX = -Infinity;
    let maximumY = -Infinity;

    dataPoints.forEach((dataPoint) => {
        if (dataPoint.x < minimumX) minimumX = dataPoint.x;
        if (dataPoint.x > maximumX) maximumX = dataPoint.x;
        if (dataPoint.y < minimumY) minimumY = dataPoint.y;
        if (dataPoint.y > maximumY) maximumY = dataPoint.y;
    });

    const xScale = scaleLinear().domain([minimumX, maximumX]).range([0, plotSideLength]);
    const yScale = scaleLinear().domain([minimumY, maximumY]).range([plotSideLength, 0]);

    return [xScale, yScale];
};

export default ProjectionSVG;
