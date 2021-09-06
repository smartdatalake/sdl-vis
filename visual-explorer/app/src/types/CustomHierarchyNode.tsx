import { SimulationNodeDatum } from 'd3-force';
import { HierarchyNode } from 'd3-hierarchy';

interface NodeDatum extends SimulationNodeDatum {
    id: number;
    dist: number;
    count: number;

    linkage: [number, number][];
}

export default interface CustomHierarchyNode extends SimulationNodeDatum, HierarchyNode<NodeDatum> {
    value: number;
    color: string;
    radius: number;
}
