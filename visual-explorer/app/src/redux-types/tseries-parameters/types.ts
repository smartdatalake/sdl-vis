export enum TSeriesParametersActionTypes {
    SET_ALLCOMPANIES = '@@tseries-parameters/SET_ALLCOMPANIES',
    SET_NEWACTIVECOMPANY = '@@tseries-parameters/SET_NEWACTIVECOMPANY',
    RMV_ACTIVECOMPANY = ' @@tseries-parameters/RMV_ACTIVECOMPANY'
}

export interface TSeriesParametersState {
    readonly allCompanies: Array<string>;
    readonly activeCompanies: Array<string>;
}
