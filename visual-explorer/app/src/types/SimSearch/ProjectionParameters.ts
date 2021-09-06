export enum ProjectionAlgorithm {
    MDS = 'mds',
    UMAP = 'umap',
    FORCE = 'force',
}

export interface ProjectionParameters {
    type: ProjectionAlgorithm;
    k: number;
    epsilon?: number;
    maxIter?: number;
}
