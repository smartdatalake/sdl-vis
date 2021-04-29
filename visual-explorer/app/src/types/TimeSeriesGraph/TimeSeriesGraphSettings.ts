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
    timeseries: [
        'EU- Corn Future_0011B1.txt',
        'EU- Rapeseed Future_0011B3.txt',
        'EU- Milling Wheat Future_0011B2.txt',
        'GB- Cocoa (C) Future GBp-t_001062.txt',
    ],
    start: 0,
    windowSize: 3,
    stepSize: 3,
    steps: 3,
    correlationMethod: 'pearson',
};
