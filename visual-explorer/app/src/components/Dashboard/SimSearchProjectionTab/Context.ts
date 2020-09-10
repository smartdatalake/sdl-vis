import { createContext } from 'react';
import { ProjectionParameters } from './ProjectionParameters';
import { SearchParameterName, SearchParameters } from './SearchParameters';

interface SimilaritySearchContext {
    attributeToPreview: SearchParameterName | undefined;
    setAttributeToPreview: (attribute: SearchParameterName | undefined) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    projectionParameters: ProjectionParameters | undefined;
    setProjectionParameters: (parameters: ProjectionParameters) => void;
    searchParameters: SearchParameters | undefined;
    setSearchParameters: (parameters: SearchParameters) => void;
}

const defaultContext: SimilaritySearchContext = {
    attributeToPreview: undefined,
    isLoading: false,
    projectionParameters: undefined,
    searchParameters: undefined,
    setAttributeToPreview: () => {},
    setIsLoading: () => {},
    setProjectionParameters: () => {},
    setSearchParameters: () => {},
};

const SimilaritySearchContext = createContext(defaultContext);

export default SimilaritySearchContext;
