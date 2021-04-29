import memoize from 'memoize-one';
import React from 'react';
import GraphSVG from './graph-svg';
import { hierarchy, interpolateCool } from 'd3';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import { assignRadius, colorHierarchy } from 'tools/hierarchy-preprocessing';
import { VISUAL_ANALYTICS_ENGINE } from 'backend-urls';

interface IGraphQueryWrapperProps {}

interface IGraphQueryWrapperState {
    rootNode?: CustomHierarchyNode;
}

// The following constants are only to resolve compile-time errors after removing redux from project.
// Since this is a legacy component anyways, this shouldn't matter.
export const ENTITY_RESOLUTION_THRESHOLD = 0.5;
export const MAX_HIERARCHY_DEPTH = 0.5;

class GraphQueryWrapper extends React.Component<IGraphQueryWrapperProps, IGraphQueryWrapperState> {
    // Set the output activations when new entityResolutionThreshold is received as props
    private constructGraph = memoize((entityResolutionThreshold: number, maxHierarchyDepth: number) => {
        fetch(VISUAL_ANALYTICS_ENGINE + '/graph', {
            body: JSON.stringify({
                entity_resolution_threshold: entityResolutionThreshold,
                max_hierarchy_depth: maxHierarchyDepth,
            }),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            method: 'POST',
        })
            .then((jsonResponse) => {
                return jsonResponse.json();
            })
            .then((json) => {
                const rootNode = hierarchy(json).sum((d) => d.count) as CustomHierarchyNode;

                colorHierarchy(rootNode, interpolateCool);
                assignRadius(rootNode);

                console.log('Received hierarchical graph:', rootNode);

                this.setState({
                    rootNode,
                });
            });
    });

    constructor(props: IGraphQueryWrapperProps) {
        super(props);

        this.state = {
            rootNode: undefined,
        };
    }

    public componentDidMount(): void {
        this.constructGraph(ENTITY_RESOLUTION_THRESHOLD, MAX_HIERARCHY_DEPTH);
    }

    public componentDidUpdate() {
        this.constructGraph(ENTITY_RESOLUTION_THRESHOLD, MAX_HIERARCHY_DEPTH);
    }

    public render() {
        return <GraphSVG rootNode={this.state.rootNode} />;
    }
}

export default GraphQueryWrapper;
