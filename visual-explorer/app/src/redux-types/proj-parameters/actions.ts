import { action } from 'typesafe-actions';
import { ProjParametersActionTypes } from 'redux-types/proj-parameters/types';

export const setType = (type: string) =>
    action(ProjParametersActionTypes.SET_TYPE, type);

export const modifyQueryAttribute = (attribute: string, value: any) =>
    action(ProjParametersActionTypes.MOD_QUERYATTRIBUTE, attribute, value);

export const setNewQueryAttributes = (newQueryAttributes: boolean) =>
    action(
        ProjParametersActionTypes.SET_NEWQUERYATTRIBUTES,
        newQueryAttributes
    );
