import { NumberValue } from 'd3-scale';

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
