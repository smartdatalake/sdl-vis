import { KeyValueStore } from 'types/KeyValueStore';

export enum ProjParametersActionTypes {
    SET_TYPE = '@@proj-parameters/SET_TYPE',
    MOD_QUERYATTRIBUTE = '@@proj-parameters/MOD_QUERYATTRIBUTE',
    SET_NEWQUERYATTRIBUTES = '@@proj-parameters/SET_NEWQUERYATTRIBUTES',
}

export interface IProjParametersState {
    readonly type: string;
    readonly queryAttributes: KeyValueStore<
        string,
        { weight: number; value: string | number; active: boolean }
    >;
    readonly newQueryAttributes: boolean;
}
