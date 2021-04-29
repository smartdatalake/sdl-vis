import { HierarchyNode, SimulationNodeDatum } from 'd3';

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
