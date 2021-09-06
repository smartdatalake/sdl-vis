export interface ToLocalFunction {
    <T extends { x: number; y: number }>(dataPoint: T): T;
    invert: <T extends { x: number; y: number }>(dataPoint: T) => T;
}
