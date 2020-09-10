import { ScaleLinear } from 'd3';
import React from 'react';
import { SearchParameterName } from '../SearchParameters';
import { SimilaritySearchStates } from '../useSimilaritySearch';
import Edges from './Edges';
import Nodes from './Nodes';
import { ColoredNode, Node } from './ProjectionSVG';

const SimilaritySearch = ({
    similaritySearchStates,
    xScale,
    yScale,
}: {
    similaritySearchStates: SimilaritySearchStates,
    xScale: ScaleLinear<number, number>,
    yScale: ScaleLinear<number, number>
}) => {
    const nodes = similaritySearchStates.current.points;
    const previewedNodes = getPreviewedNodes(similaritySearchStates);
    const weightedEdges = similaritySearchStates.current.adjMat;

    let nodesWithPreview: [Node | undefined, ColoredNode[]][] = [];
    // Current nodes and their counterparts in other states.
    nodesWithPreview = nodesWithPreview.concat(nodes.map(node =>
        [node, previewedNodes.filter(previewedNode => previewedNode.id === node.id)],
    ));
    // Nodes in other states that do not have a current counterpart.
    nodesWithPreview = nodesWithPreview.concat(
        previewedNodes
            .filter(previewedNode => nodes.find(node =>
                node.id === previewedNode.id) === undefined)
            .map(previewedNode => [undefined, [previewedNode]]),
    );

    return (
        <>
            <Edges nodes={nodes} weightedEdges={weightedEdges} xScale={xScale} yScale={yScale} />
            <Nodes nodesWithPreview={nodesWithPreview} xScale={xScale} yScale={yScale} />
        </>
    );
};

const getPreviewedNodes = (similaritySearchStates: SimilaritySearchStates): ColoredNode[] =>
    Object.values(SearchParameterName)
        .map((searchAttribute: SearchParameterName) => {
            const similarityGraphs = similaritySearchStates[searchAttribute];

            if (similarityGraphs !== undefined) {
                return [
                    ...(similarityGraphs.decreased ? similarityGraphs.decreased.points : []).map(point => {
                        return {
                            color: 'red',
                            attribute: searchAttribute, ...point,
                        };
                    }),
                    ...(similarityGraphs.increased ? similarityGraphs.increased.points : []).map(point => {
                        return {
                            color: 'green',
                            attribute: searchAttribute, ...point,
                        };
                    }),
                ];
            } else {
                return undefined;
            }
        })
        .filter(points => points !== undefined)
        .flat();

export default SimilaritySearch;
