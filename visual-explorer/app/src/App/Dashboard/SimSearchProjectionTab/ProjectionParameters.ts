export enum ProjectionAlgorithm {
    MDS = 'mds',
    UMAP = 'umap',
    FORCE = 'force',
}

export interface ProjectionParameters {
    algorithm: ProjectionAlgorithm;
    k: number;
    epsilon?: number;
    maximumIterations?: number;
}