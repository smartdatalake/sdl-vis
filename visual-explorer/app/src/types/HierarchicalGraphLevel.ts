export interface HierarchicalGraphNode {
    label: string;
    cluster: number;
    id: number;
    level: number;
    x: number;
    y: number;
    attributes: Record<string, number | string>;
}

export interface HierarchicalGraphLevel {
    transactionId: string;
    nodes: HierarchicalGraphNode[];
}
