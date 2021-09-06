export interface SimilarityGraphNode {
    x: number;
    y: number;
    id: string;
    totalScore: number;
    cluster: number;
    size: number;
    fillColor: string;
    rank: string | number;
    [key: string]: string | number | string[];
}

export interface SimilarityGraphEdge {
    left: string;
    right: string;
    score: number;
}

export interface SimilarityGraph {
    adjMat: SimilarityGraphEdge[];
    points: SimilarityGraphNode[];
}
