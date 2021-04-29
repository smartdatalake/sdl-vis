import { hsl, interpolateCubehelix, interpolateRainbow, interpolateSinebow, ScaleOrdinal } from 'd3';
import { scaleLinear, scaleOrdinal } from '@visx/scale';

export function getColorVariations(baseColor: string, variations = 4): string[] {
    const result: string[] = [];

    for (let i = 0; i < variations; i++) {
        const colorHSL = hsl(baseColor);
        colorHSL.l = (i + 3) * (1 / (variations + 3));
        result.push(colorHSL.hex());
    }

    return result;
}

export function lightest(baseColor: string): string {
    return _changeLightness(baseColor, 0.9);
}

export function lighter(baseColor: string): string {
    return _changeLightness(baseColor, 0.7);
}

export function mid(baseColor: string): string {
    return _changeLightness(baseColor, 0.5);
}

export function darker(baseColor: string): string {
    return _changeLightness(baseColor, 0.3);
}

export function darkest(baseColor: string): string {
    return _changeLightness(baseColor, 0.2);
}

function _changeLightness(baseColor: string, l: number): string {
    const lClamped = _clamp(l, 0, 1);
    const colorHSL = hsl(baseColor);
    colorHSL.l = lClamped;
    return colorHSL.formatHex();
}

function _clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export const schemeCustombow: string[] = ['#9F608E', '#517EAE', '#58A7A1', '#5FAB54', '#E8BA17', '#F07E0F', '#D02F31'];

export const interpolateCustombow: (t: number) => string = (t: number) =>
    scaleLinear<string>()
        .domain(schemeCustombow.map((_, idx) => idx / (schemeCustombow.length - 1)))
        .range(schemeCustombow)
        .interpolate(interpolateCubehelix)(t) ?? '#000';

const SHORTENED_INTERVAL_SCALE = scaleLinear<number>().domain([0, 1]).range([0, 0.9]);
export const acyclicInterpolateSinebow = (t: number) => interpolateSinebow(SHORTENED_INTERVAL_SCALE(t) ?? 0);
export const acyclicInterpolateRainbow = (t: number) => interpolateRainbow(SHORTENED_INTERVAL_SCALE(t) ?? 0);

export function ordinalColorscale(
    categories: Array<string | number>,
    interpolator: (t: number) => string = acyclicInterpolateRainbow
): ScaleOrdinal<string | number, string> {
    const numCategories = categories.length;
    const outCategories: string[] = categories.map((_, idx) => interpolator(idx / (numCategories - 1)));

    return scaleOrdinal({
        domain: categories,
        range: outCategories,
    });
}
