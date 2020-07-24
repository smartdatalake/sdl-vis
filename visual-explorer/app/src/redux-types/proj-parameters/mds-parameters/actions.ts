import { action } from 'typesafe-actions';

const setEpsilon = (epsilon: number) => action('epsilon', epsilon);

const setMaxIter = (maxIter: number) => action('maxiter', maxIter);

const mdsParametersActions = {
    setEpsilon,
    setMaxIter,
};

export default mdsParametersActions;
