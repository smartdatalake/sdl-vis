export enum MDSTuningActionTypes {
    SET_EPSILON = 'epsilon',
    SET_MAXITER = 'maxiter',
}

export interface IMDSTuningState {
    readonly epsilon: number;
    readonly maxIter: number;
}
