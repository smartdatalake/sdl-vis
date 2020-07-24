import {
    forceCenter,
    forceCollide,
    forceLink,
    forceManyBody,
    forceSimulation,
    Simulation,
    SimulationLinkDatum,
} from 'd3';
import memoize from 'memoize-one';
import React from 'react';
import { Vector2D } from 'types/Vector2D';
import { approximateCircle } from 'tools/geometry';
import './d3-force-hierarchy-level.scss';
import CustomHierarchyNode from 'types/CustomHierarchyNode';
import Link from 'types/Link';
import D3Node from './graph-entities/D3Node';
import D3ConvexHull from './graph-entities/D3ConvexHull';
import D3Link from './graph-entities/D3Link';

interface ID3ForceHierarchyLevelProps {
    rootNode: CustomHierarchyNode;
}

interface ID3ForceHierarchyLevelState {
    currentNode: CustomHierarchyNode;
}

class D3ForceHierarchyLevel extends React.Component<
    ID3ForceHierarchyLevelProps,
    ID3ForceHierarchyLevelState
> {
    private currentChildNodes: CustomHierarchyNode[] = [];
    private currentChildLinks: Link[] = [];

    public forceSimulationFn = memoize((currentNode: CustomHierarchyNode) => {
        // Stop old simulation
        if (this.forceSimulation) {
            this.forceSimulation.stop();
        }

        this.currentChildNodes = currentNode.children
            ? currentNode.children
            : [];

        // Convert adjacency-matrix to single links
        this.currentChildLinks = [];
        for (let i = 0; i < this.currentChildNodes.length; i++) {
            for (let j = 0; j < i; j++) {
                if (currentNode.data.linkage[i][j] > 0) {
                    this.currentChildLinks.push({
                        source: this.currentChildNodes[i],
                        target: this.currentChildNodes[j],
                        strength: currentNode.data.linkage[i][j],
                    });
                }
            }
        }

        // Reset parentNode positions
        this.currentChildNodes.forEach(c => {
            c.x = undefined;
            c.y = undefined;
        });

        // Create force simulation
        this.forceSimulation = forceSimulation<
            CustomHierarchyNode,
            SimulationLinkDatum<CustomHierarchyNode>
        >(this.currentChildNodes)
            .force('charge', forceManyBody<CustomHierarchyNode>().strength(-10))
            .force('center', forceCenter<CustomHierarchyNode>(0, 0))
            .force(
                'collide',
                forceCollide<CustomHierarchyNode>(d => d.radius * 1.2)
            )
            .force('link', forceLink(this.currentChildLinks))
            .on('tick', () => {
                this.forceUpdate();
            });
    });

    private forceSimulation?: Simulation<
        CustomHierarchyNode,
        SimulationLinkDatum<CustomHierarchyNode>
    >;

    constructor(props: ID3ForceHierarchyLevelProps) {
        super(props);

        this.state = {
            currentNode: props.rootNode,
        };
    }

    public componentDidMount(): void {
        this.forceSimulationFn(this.state.currentNode);
    }

    public componentDidUpdate(
        prevProps: ID3ForceHierarchyLevelProps,
        prevState: ID3ForceHierarchyLevelState
    ) {
        this.forceSimulationFn(this.state.currentNode);
    }

    public render() {
        const { currentNode } = this.state;

        // Create parentNode elements
        const nodeElements = this.currentChildNodes.map((c, idx) => {
            const onNodeClick = () => {
                if (c.children) {
                    this.setState({ currentNode: c });
                }
            };

            return <D3Node key={idx} node={c} onDoubleClick={onNodeClick} />;
        });

        // Create convex hull element
        const onConvexHullClick = () => {
            if (currentNode.parent) {
                this.setState({ currentNode: currentNode.parent });
            }
        };

        const circleShapeApproximationPoints: Vector2D[] = this.currentChildNodes
            .map(c => {
                return approximateCircle(new Vector2D(c.x, c.y), c.radius, 32);
            })
            .flat();

        const convexHullElement = (
            <D3ConvexHull
                delta={30}
                onDoubleClick={onConvexHullClick}
                points={circleShapeApproximationPoints}
                parentNode={currentNode}
            />
        );

        // Create link elements
        const childLinks = this.currentChildLinks.map((l, idx) => {
            return <D3Link key={idx} link={l} parentNode={currentNode} />;
        });

        return (
            <g>
                {convexHullElement}
                {childLinks}
                {nodeElements}
            </g>
        );
    }
}

export default D3ForceHierarchyLevel;
