import { hsl } from 'd3';

export function getColorVariations(
    baseColor: string,
    variations: number = 4
): string[] {
    const result: string[] = [];

    for (let i = 0; i < variations; i++) {
        const colorHSL = hsl(baseColor);
        colorHSL.l = (i + 3) * (1 / (variations + 3));
        result.push(colorHSL.hex());
    }

    return result;
}
