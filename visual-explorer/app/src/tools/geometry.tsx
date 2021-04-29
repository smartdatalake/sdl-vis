import { Vector2D } from 'types/Vector2D';

const sqrt2 = 1.4142135623730951;
const sqrtPI = 1.7724538509055159;

export function approximateCircle(c: Vector2D, r: number, res = 32): Vector2D[] {
    const polygon: Vector2D[] = [];

    const tMax = 2 * Math.PI;
    const tDelta = tMax / res;

    for (let i = 0; i < res; i++) {
        const t = i * tDelta;
        polygon.push(new Vector2D(c.x + r * Math.cos(t), c.y + r * Math.sin(t)));
    }

    return polygon;
}

export function getRadiusForCircleOfArea(area: number): number {
    area = Math.abs(area);

    return Math.sqrt(area) / (sqrt2 * sqrtPI);
}
