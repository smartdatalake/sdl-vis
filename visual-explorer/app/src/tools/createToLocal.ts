import { ScaleContinuousNumeric } from 'd3-scale';
import { ToLocalFunction } from 'types/ToLocalFunction';

export const createToLocal = <Range, Output, Unknown = never>(
    scaleX: ScaleContinuousNumeric<Range, Output, Unknown>,
    scaleY: ScaleContinuousNumeric<Range, Output, Unknown>
): ToLocalFunction => {
    const invert = <T extends { x: number; y: number }>(dataPoint: T): T => ({
        ...dataPoint,
        x: scaleX.invert(dataPoint.x),
        y: scaleY.invert(dataPoint.y),
    });

    const toLocal = <T extends { x: number; y: number }>(dataPoint: T): T => ({
        ...dataPoint,
        x: scaleX(dataPoint.x),
        y: scaleY(dataPoint.y),
    });

    toLocal.invert = invert;

    return toLocal;
};
