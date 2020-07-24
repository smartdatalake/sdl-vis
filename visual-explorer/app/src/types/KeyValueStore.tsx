export type KeyValueStore<
    K extends string | number,
    V extends { weight: number; value: string | number; active: boolean }
> = {
    [key in K]: V;
};
