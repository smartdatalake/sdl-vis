import { Reducer } from 'redux';
import { HinParametersActionTypes, IHinParametersState } from './types';

const initialState: IHinParametersState = {
    entityResolutionThreshold: 0.5,
    maxHierarchyDepth: 1,
};

const hinParametersReducer: Reducer<IHinParametersState> = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case HinParametersActionTypes.SET_ENTITY_RESOLUTION_THRESHOLD: {
            return { ...state, entityResolutionThreshold: action.payload };
        }
        case HinParametersActionTypes.SET_MAX_HIERARCHY_DEPTH: {
            return { ...state, maxHierarchyDepth: action.payload };
        }
        default: {
            return state;
        }
    }
};

export { hinParametersReducer };
