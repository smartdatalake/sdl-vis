import _ from 'lodash';

interface Graph {
    graphName: string;
    graphAttributes: string[];
    // graphLinks: string[];
}

interface Algorithm {
    algorithm: 'kmeansf' | 'kmeans' | 'single';
    featureExtractor: null | 'word2vec' | 'tfidf';
    algorithmParams: Record<Algorithm['algorithm'], Record<string, string | number>>;
}

export interface GraphSettings {
    graphSettings: Graph;
    algorithmSettings: Algorithm;
}

export const constructDefaultGraphSettings = (graphName: string): GraphSettings => {
    return {
        graphSettings: {
            graphName: graphName,
            graphAttributes: [],
        },
        algorithmSettings: {
            algorithm: 'kmeansf',
            featureExtractor: null,
            algorithmParams: {
                kmeansf: {
                    k: 3,
                    reps: 5,
                    algorep: 'topk',
                },
                kmeans: {
                    k: 3,
                    reps: 5,
                    algorep: 'topk',
                },
                single: {
                    k: 3,
                    reps: 5,
                    splits: 1,
                },
            },
        },
    };
};

// Get or set values of a graph settings object
export function value(graphSettings: GraphSettings, path: string, value?: string | string[] | number) {
    if (value) {
        const valueNullable = value === 'null' ? null : value;
        _.set(graphSettings, path, valueNullable);
    } else {
        const valueNullable = _.get(graphSettings, path);
        return valueNullable ? valueNullable : 'null';
    }

    return graphSettings;
}
