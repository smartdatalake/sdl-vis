import { createContext } from 'react';
import { ProjectionParameters } from './ProjectionParameters';
import { SearchParameters, PossibleSearchParameter } from './SearchParameters';
import { Node } from './Projection/ProjectionSVG';

interface SimilaritySearchContext {
    attributeToPreview: string | undefined;
    setAttributeToPreview: (attribute: string | undefined) => void;
    isLoading: boolean;
    setIsLoading: (isLoading: boolean) => void;
    projectionParameters: ProjectionParameters | undefined;
    setProjectionParameters: (parameters: ProjectionParameters) => void;
    searchParameters: SearchParameters | undefined;
    setSearchParameters: (parameters: SearchParameters) => void;
    highlightedNode: Node | null;
    setHighlightedNode: (highlightedNode: Node | null) => void;
    possibleParameter: PossibleSearchParameter[] | null;
    setPossibleParameter: (param: PossibleSearchParameter[] | null) => void;
    newQueryResults: boolean;
    setNewQueryResults: (newQuery: boolean) => void;
}

const defaultContext: SimilaritySearchContext = {
    attributeToPreview: undefined,
    isLoading: false,
    projectionParameters: undefined,
    searchParameters: undefined,
    highlightedNode: null,
    possibleParameter: null,
    newQueryResults: false,

    setAttributeToPreview: () => {
        // Initial value. Replaced by context provider.
    },
    setIsLoading: () => {
        // Initial value. Replaced by context provider.
    },
    setProjectionParameters: () => {
        // Initial value. Replaced by context provider.
    },
    setSearchParameters: () => {
        // Initial value. Replaced by context provider.
    },
    setHighlightedNode: () => {
        // Initial value. Replaced by context provider.
    },
    setPossibleParameter: () => {
        // Initial value. Replaced by context provider.
    },
    setNewQueryResults: () => {
        // Initial value. Replaced by context provider.
    },
};

const SimilaritySearchContext = createContext(defaultContext);

export default SimilaritySearchContext;
