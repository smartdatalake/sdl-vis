/*****************************************************************************************
 * See:                                                                                  *
 * https://resir014.xyz/posts/2018/07/06/redux-4-plus-typescript/                        *
 * https://dev.to/resir014/redux-4--typescript-29-a-type-safe-approach-2lf4              *
 * https://medium.com/@resir014/redux-4-typescript-2-9-a-type-safe-approach-7f073917b803 *
 *****************************************************************************************/

import { combineReducers } from 'redux';
import { hinParametersReducer, IHinParametersState } from './hin-parameters';
import { IProjParametersState, projParametersReducer } from './proj-parameters';
import {
    IMDSTuningState,
    mdsParametersReducer,
} from './proj-parameters/mds-parameters';
import {
    tSeriesParametersReducer,
    TSeriesParametersState,
} from './tseries-parameters';

// The top-level state object
export interface IApplicationState {
    hinParametersState: IHinParametersState;
    projParametersState: IProjParametersState;
    mdsParametersState: IMDSTuningState;
    tSeriesParametersState: TSeriesParametersState;
}

// Whenever an action is dispatched, Redux will update each top-level application state property
// using the reducer with the matching name. It's important that the names match exactly, and that
// the reducer acts on the corresponding IApplicationState property type.
export const rootReducer = combineReducers<IApplicationState>({
    hinParametersState: hinParametersReducer,
    projParametersState: projParametersReducer,
    mdsParametersState: mdsParametersReducer,
    tSeriesParametersState: tSeriesParametersReducer,
});
