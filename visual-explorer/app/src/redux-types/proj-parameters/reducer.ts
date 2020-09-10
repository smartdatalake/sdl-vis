import { Reducer } from 'redux';
import { IProjParametersState, ProjParametersActionTypes } from './types';
import produce from 'immer';

const initialState: IProjParametersState = {
    type: 'pca',
    queryAttributes: {
        keywords: {
            weight: 0.3,
            value: 'Computer+science,Electronics,Software,E-commerce',
            active: true,
        },
        revenue: {
            weight: 0.5,
            value: 1000000,
            active: true,
        },
        employees: {
            weight: 0.5,
            value: 50,
            active: true,
        },
        location: {
            weight: 0.5,
            value: 'POINT (12.4534 41.9029)',
            active: false,
        },
    },
    newQueryAttributes: false,
};

const projParametersReducer: Reducer<IProjParametersState> = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case ProjParametersActionTypes.SET_TYPE: {
            return { ...state, type: action.payload };
        }
        case ProjParametersActionTypes.MOD_QUERYATTRIBUTE: {
            return produce(state, (draftState: IProjParametersState) => {
                switch (action.meta.key) {
                    case 'weight':
                        draftState.queryAttributes[action.payload].weight =
                            action.meta.value;
                        break;
                    case 'value':
                        draftState.queryAttributes[action.payload].value =
                            action.meta.value;
                        break;
                    case 'active':
                        draftState.queryAttributes[action.payload].active =
                            action.meta.value;
                        break;
                    default:
                        break;
                }
            });
        }
        case ProjParametersActionTypes.SET_NEWQUERYATTRIBUTES: {
            return { ...state, type: action.payload };
        }
        default: {
            return state;
        }
    }
};

export { projParametersReducer };
