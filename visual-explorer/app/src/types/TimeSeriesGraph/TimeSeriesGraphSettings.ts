export interface TimeSeriesGraphSettings extends Record<string, unknown> {
    timeseries: string[];
    start: number;
    windowSize: number;
    stepSize: number;
    steps: number;
    correlationMethod: 'pearson' | 'kendall' | 'spearman';
    locale?: string;
}

export const DEFAULT_TIME_SERIES_GRAPH_SETTINGS: TimeSeriesGraphSettings = {
    timeseries: [],
    start: 0,
    windowSize: 3,
    stepSize: 3,
    steps: 3,
    correlationMethod: 'pearson',
};
