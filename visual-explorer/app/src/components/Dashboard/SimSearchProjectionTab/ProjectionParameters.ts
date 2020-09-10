export enum ProjectionAlgorithm {
    PCA = 'pca',
    MDS = 'mds',
    UMAP = 'umap'
}

export interface ProjectionParameters {
    algorithm: ProjectionAlgorithm,
    epsilon?: number,
    maximumIterations?: number
}
