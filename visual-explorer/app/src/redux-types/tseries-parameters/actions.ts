import { action } from 'typesafe-actions';
import { TSeriesParametersActionTypes } from 'redux-types/tseries-parameters/types';

export const setAllCompanies = (companies: Array<String>) =>
    action(TSeriesParametersActionTypes.SET_ALLCOMPANIES, companies)

export const addActiveCompany = (company: string) =>
    action(TSeriesParametersActionTypes.SET_NEWACTIVECOMPANY, company)

export const removeActiveCompany = (idx: number) =>
    action(TSeriesParametersActionTypes.RMV_ACTIVECOMPANY, idx)
