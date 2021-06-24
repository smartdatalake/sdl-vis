export type DataValue = number | number[] | string;
export type DataRow = Record<string, DataValue>;
export type DataArray = Array<DataRow>;

export const isNumberArray = (v: DataValue): v is number[] => {
    return Array.isArray(v);
};

export const isNumber = (v: DataValue): v is number => {
    return typeof v === 'number';
};

export const isString = (v: DataValue): v is number => {
    return typeof v === 'string';
};
