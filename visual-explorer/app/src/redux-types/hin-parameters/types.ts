export enum HinParametersActionTypes {
    SET_ENTITY_RESOLUTION_THRESHOLD = '@@hin-parameters/SET_ENTITY_RESOLUTION_THRESHOLD',
    SET_MAX_HIERARCHY_DEPTH = '@@hin-parameters/SET_MAX_HIERARCHY_DEPTH',
}

export interface IHinParametersState {
    readonly entityResolutionThreshold: number;
    readonly maxHierarchyDepth: number;
}
