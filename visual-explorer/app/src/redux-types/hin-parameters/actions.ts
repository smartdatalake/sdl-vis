import { action } from 'typesafe-actions';
import { HinParametersActionTypes } from './types';

const setEntityResolutionThreshold = (entityResolutionThreshold: number) =>
    action(
        HinParametersActionTypes.SET_ENTITY_RESOLUTION_THRESHOLD,
        entityResolutionThreshold
    );
const setMaxHierarchyDepth = (maxHierarchyDepth: number) =>
    action(HinParametersActionTypes.SET_MAX_HIERARCHY_DEPTH, maxHierarchyDepth);

const hinParametersActions = {
    setEntityResolutionThreshold,
    setMaxHierarchyDepth,
};

export default hinParametersActions;
