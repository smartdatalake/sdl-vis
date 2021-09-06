import React, { ReactNode, useState } from 'react';
import Context from './Context';
import { ProjectionAlgorithm, ProjectionParameters } from 'types/SimSearch/ProjectionParameters';
import { SearchParameters } from 'types/SimSearch/SearchParameters';
import { SearchColumn } from 'types/SimSearch/SearchColumn';
import { SimilarityGraphNode } from 'types/SimSearch/SimilarityGraph';

export const defaultProjectionParameters: ProjectionParameters = {
    type: ProjectionAlgorithm.MDS,
    k: 15,
    epsilon: 0.001,
    maxIter: 300,
};

/* export const defaultSearchParameters: SearchParameters = {
    employees: {
        active: true,
        value: 50,
        weights: [0.5],
    },
    keywords: {
        active: true,
        value: ['Computer+science', 'Electronics', 'Software', 'E-commerce'],
        weights: [0.3],
    },
    location: {
        active: false,
        value: 'POINT (12.4534 41.9029)',
        weights: [0.5],
    },
    revenue: {
        active: true,
        value: 1000000,
        weights: [0.5],
    },
}; */

const Provider = ({ children }: { children: ReactNode }) => {
    const [attributeToPreview, setAttributeToPreview] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [projectionParameters, setProjectionParameters] = useState<ProjectionParameters>(defaultProjectionParameters);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>();
    const [highlightedNode, setHighlightedNode] = useState<SimilarityGraphNode | null>(null);
    const [possibleParameter, setPossibleParameter] = useState<SearchColumn[] | null>(null);
    const [newQueryResults, setNewQueryResults] = useState<boolean>(false);

    return (
        <Context.Provider
            value={{
                attributeToPreview,
                setAttributeToPreview,
                isLoading,
                setIsLoading,
                projectionParameters,
                setProjectionParameters,
                searchParameters,
                setSearchParameters,
                highlightedNode,
                setHighlightedNode,
                searchColumns: possibleParameter,
                setPossibleParameter,
                newQueryResults,
                setNewQueryResults,
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default Provider;
