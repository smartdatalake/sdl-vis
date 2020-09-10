import { Reducer } from 'redux';
import { TSeriesParametersState, TSeriesParametersActionTypes } from './types';
import produce from 'immer';

const initialState: TSeriesParametersState = {
    allCompanies: [
        'TCL Electronics Holdings Ltd._016288',
        'Telecom Italia S.p.A._120470',
    ],
    activeCompanies: [
        'TCL Electronics Holdings Ltd._016288',
        'Telecom Italia S.p.A._120470',
    ],
};

const tSeriesParametersReducer: Reducer<TSeriesParametersState> = (
    state = initialState,
    action
) => {
    console.log('reduce', action);
    switch (action.type) {
        case TSeriesParametersActionTypes.SET_NEWACTIVECOMPANY: {
            return produce(state, (draftState: TSeriesParametersState) => {
                draftState.activeCompanies.push(action.payload);
            });
        }
        case TSeriesParametersActionTypes.RMV_ACTIVECOMPANY: {
            return produce(state, (draftState: TSeriesParametersState) => {
                draftState.activeCompanies.splice(action.payload, 1);
            });
        }
        case TSeriesParametersActionTypes.SET_ALLCOMPANIES: {
            return { ...state, allCompanies: action.payload };
        }
        default: {
            return state;
        }
    }
};

export { tSeriesParametersReducer };
