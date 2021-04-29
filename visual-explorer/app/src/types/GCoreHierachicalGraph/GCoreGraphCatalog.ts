export interface GCoreGraphNode {
    id: number;
    label: string;
    property: string[];
    title: string;
}

export interface GCoreGraphLink {
    from: number;
    to: number;
    label: string;
    property: string[];
    title: string;
}

export interface GCoreGraphSchema {
    nodes: GCoreGraphNode[];
    links: GCoreGraphLink[];
}

export type GCoreGraphCatalog = Record<string, GCoreGraphSchema>;
