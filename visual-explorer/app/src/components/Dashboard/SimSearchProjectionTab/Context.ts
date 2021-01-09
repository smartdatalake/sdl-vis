import { createContext } from 'react';
import { ProjectionParameters } from './ProjectionParameters';
import { SearchParameterName, SearchParameters } from './SearchParameters';
import { Node } from './Projection/ProjectionSVG';

interface SimilaritySearchContext {
    attributeToPreview: SearchParameterName | undefined;
    setAttributeToPreview: (attribute: SearchParameterName | undefined) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    projectionParameters: ProjectionParameters | undefined;
    setProjectionParameters: (parameters: ProjectionParameters) => void;
    searchParameters: SearchParameters | undefined;
    setSearchParameters: (parameters: SearchParameters) => void;
    highlightedNode: Node | null;
    setHighlightedNode: (highlightedNode: Node | null) => void;
}

const defaultContext: SimilaritySearchContext = {
    attributeToPreview: undefined,
    isLoading: false,
    projectionParameters: undefined,
    searchParameters: undefined,
    highlightedNode: null,
    setAttributeToPreview: () => {},
    setIsLoading: () => {},
    setProjectionParameters: () => {},
    setSearchParameters: () => {},
    setHighlightedNode: () => {},
};

const SimilaritySearchContext = createContext(defaultContext);

export default SimilaritySearchContext;
