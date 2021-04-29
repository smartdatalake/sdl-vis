import _ from 'lodash';

interface Graph {
    graphName: string;
    graphAttributes: string[];
    // graphLinks: string[];
}

interface AlgorithmParamsKMeans {
    k: number; // number of clusters
    reps: number; // number of representative nodes per level per cluster. This number grows exponentially when the level id grows.
    algorep: 'topk' | 'revtopk'; //  algorithm to be used to calculate the representative nodes of each level
}

interface AlgorithmParamsSingle {
    k: number; // number of clusters
    reps: number; // number of representative nodes per level per cluster.
    splits: number; // Number of partitions to be used by Spark, for small datasets that fit into the memory it can be setted to 1 (Cordis graph dataset, DBLP dataset, SpazioDati sample dataset and etc). For big data datasets (SpazioDati full company dataset, GDELT dataset) it needs to be setted to more.
}

interface Algorithm {
    algorithm: 'kmeans' | 'single';
    featureExtractor: null | 'word2vec' | 'tfidf';
    algorithmParamsKMeans: AlgorithmParamsKMeans;
    algorithmParamsSingle: AlgorithmParamsSingle;
}

export interface GraphSettings {
    graphSettings: Graph;
    algorithmSettings: Algorithm;
}

export const DEFAULT_GRAPH_SETTINGS: GraphSettings = {
    graphSettings: {
        graphName: 'Iris',
        graphAttributes: [],
    },
    algorithmSettings: {
        algorithm: 'kmeans',
        featureExtractor: null,
        algorithmParamsKMeans: {
            k: 3,
            reps: 5,
            algorep: 'topk',
        },
        algorithmParamsSingle: {
            k: 3,
            reps: 5,
            splits: 1,
        },
    },
};

// Get or set values of a graph settings object
export function value(graphSettings: GraphSettings, path: string, value?: string | string[] | number) {
    if (value) {
        const valueNullable = value === 'null' ? null : value;
        _.set(graphSettings, path, valueNullable);
    } else {
        const valueNullable = _.get(graphSettings, path);
        return valueNullable ? valueNullable.toString() : 'null';
    }

    return graphSettings;
}
