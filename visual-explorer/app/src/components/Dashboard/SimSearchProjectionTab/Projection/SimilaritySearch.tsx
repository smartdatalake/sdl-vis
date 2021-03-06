import { ScaleLinear } from 'd3';
import React, { useContext } from 'react';
import { SearchParameterName } from '../SearchParameters';
import { SimilaritySearchStates } from '../useSimilaritySearch';
import SimilaritySearchContext from '../Context';

import { ProjectionAlgorithm } from '../ProjectionParameters';
import Edges from './Edges';
import Nodes from './Nodes';
import { ColoredNode, Node } from './ProjectionSVG';
import ConvexHull from './ConvexHull';

import { ForceGraph2D } from 'react-force-graph';
import { computeColor } from 'components/Dashboard/SimSearchProjectionTab/Projection/computeColor';

const SimilaritySearch = ({
    similaritySearchStates,
    xScale,
    yScale,
}: {
    similaritySearchStates: SimilaritySearchStates;
    xScale: ScaleLinear<number, number>;
    yScale: ScaleLinear<number, number>;
}) => {
    const nodes = similaritySearchStates.current.points;
    const previewedNodes = getPreviewedNodes(similaritySearchStates); // .map(pt=> ({ ...pt, fillColor: computeColor(pt, xScale, yScale) }));
    const weightedEdges = similaritySearchStates.current.adjMat;
    const { projectionParameters } = useContext(SimilaritySearchContext);

    let nodesWithPreview: [Node | undefined, ColoredNode[]][] = [];
    // Current nodes and their counterparts in other states.
    // color of counterpart = color of node
    nodesWithPreview = nodesWithPreview.concat(
        nodes.map(node => [
            node,
            previewedNodes
                .filter(previewedNode => previewedNode.id === node.id) // if id only found once
                .map(coloredNode => {
                    coloredNode.fillColor = node.fillColor;
                    return coloredNode;
                }),
        ])
    );
    // Nodes in other states that do not have a current counterpart.
    nodesWithPreview = nodesWithPreview.concat(
        previewedNodes
            .filter(
                previewedNode =>
                    nodes.find(node => node.id === previewedNode.id) ===
                    undefined
            )
            .map(previewedNode => [
                undefined,
                [
                    {
                        ...previewedNode,
                        strokeColor: 'none',
                        fillColor: computeColor(previewedNode, xScale, yScale),
                    },
                ],
            ])
    );

    const algorithm = projectionParameters?.algorithm || '';
    const forceObj = {
        nodes: nodes.map(n => {
            return { ...n, id: n.id.split(';')[0] };
        }),
        links: weightedEdges.map(e => {
            return {
                source: e.left.split(';')[0],
                target: e.right.split(';')[0],
                value: e.score,
            };
        }),
    };
    return algorithm === ProjectionAlgorithm.FORCE ? (
        <foreignObject
            x={-window.innerWidth / 2}
            y={-window.innerHeight / 2}
            width={window.screen.availWidth}
            height={window.screen.availHeight}
        >
            <ForceGraph2D graphData={forceObj} />
        </foreignObject>
    ) : (
        <>
            <Edges
                nodes={nodes}
                weightedEdges={weightedEdges}
                xScale={xScale}
                yScale={yScale}
            />
            <Nodes
                nodesWithPreview={nodesWithPreview}
                xScale={xScale}
                yScale={yScale}
            />
            <ConvexHull points={nodes} xScale={xScale} yScale={yScale} />
        </>
    );
};

const getPreviewedNodes = (
    similaritySearchStates: SimilaritySearchStates
): ColoredNode[] =>
    Object.values(SearchParameterName)
        .map((searchAttribute: SearchParameterName) => {
            const similarityGraphs = similaritySearchStates[searchAttribute];

            if (similarityGraphs !== undefined) {
                return [
                    ...(similarityGraphs.decreased
                        ? similarityGraphs.decreased.points
                        : []
                    ).map(point => {
                        return {
                            strokeColor: 'red',
                            attribute: searchAttribute,
                            ...point,
                        };
                    }),
                    ...(similarityGraphs.increased
                        ? similarityGraphs.increased.points
                        : []
                    ).map(point => {
                        return {
                            strokeColor: 'green',
                            attribute: searchAttribute,
                            ...point,
                        };
                    }),
                ];
            } else {
                return [];
            }
        })
        .filter(points => points !== undefined)
        .flat();

export default SimilaritySearch;
