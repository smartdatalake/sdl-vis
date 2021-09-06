import { NumberValue } from 'd3-scale';
import { isSVGElement, isSVGSVGElement } from '@visx/event/lib/typeGuards';
import _ from 'lodash';

export function getNumberFormatter(digits: number) {
    const si = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

    return (num: number | NumberValue) => {
        let i;
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
        return (num.valueOf() / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
    };
}

export function bounds(array: Array<number>): { min: number; max: number } {
    return array.reduce(({ min, max }, item) => ({ min: Math.min(item, min), max: Math.max(item, max) }), {
        min: Infinity,
        max: -Infinity,
    });
}

/**
 * Converts client position (e.g., from an event) to local coordinates in the current SVG group. This differs
 * from visx's localPoint implementation, which always computes the coordinates relative to the owner SVG element
 * (instead of the current group).
 * @param node The node, to which the relative local position should be calculated.
 * @param pos The client position that should be converted.
 */
export function relativeLocalPoint<T extends { x: number; y: number }>(
    node: SVGGElement | SVGSVGElement,
    pos: T
): T | null {
    // find top-most SVG
    const svg = isSVGElement(node) ? node.ownerSVGElement : node;

    const screenCTM = node.getScreenCTM();

    if (isSVGSVGElement(svg) && screenCTM) {
        let point = svg.createSVGPoint();
        point.x = pos.x;
        point.y = pos.y;
        point = point.matrixTransform(screenCTM.inverse());

        return {
            ...pos,
            x: point.x,
            y: point.y,
        };
    }

    return null;
}

export function sortByEuclideanDistance<T extends { x: number; y: number }, U extends { x: number; y: number }>(
    refPoint: T,
    points: U[]
): U[] {
    return _.cloneDeep(points).sort((dp1, dp2) => {
        // Calculate axis-wise distances on dp1
        const d1x = dp1.x - refPoint.x;
        const d1y = dp1.y - refPoint.y;

        // Calculate axis-wise distances on dp2
        const d2x = dp2.x - refPoint.x;
        const d2y = dp2.y - refPoint.y;

        // Calculate part under square root of euclidean distance for both points dp1 and dp2
        const d1 = d1x * d1x + d1y * d1y;
        const d2 = d2x * d2x + d2y * d2y;

        // Use the difference as comparison criterion
        return d1 - d2;
    });
}
