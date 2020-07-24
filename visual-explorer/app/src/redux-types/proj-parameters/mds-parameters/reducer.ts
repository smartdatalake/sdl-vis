import { Reducer } from 'redux';
import { IMDSTuningState, MDSTuningActionTypes } from './types';

const initialState: IMDSTuningState = {
    epsilon: 0.001,
    maxIter: 300,
};

const mdsParametersReducer: Reducer<IMDSTuningState> = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case MDSTuningActionTypes.SET_EPSILON: {
            return { ...state, epsilon: action.payload };
        }
        case MDSTuningActionTypes.SET_MAXITER: {
            return { ...state, maxIter: action.payload };
        }
        default: {
            return state;
        }
    }
};

export { mdsParametersReducer };
