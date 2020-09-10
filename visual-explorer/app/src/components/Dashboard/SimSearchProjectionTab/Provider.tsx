import React, { ReactNode, useState } from 'react';
import Context from './Context';
import { ProjectionAlgorithm, ProjectionParameters } from './ProjectionParameters';
import { SearchParameterName, SearchParameters } from './SearchParameters';

export const defaultProjectionParameters: ProjectionParameters = {
    algorithm: ProjectionAlgorithm.PCA,
    epsilon: 0.001,
    maximumIterations: 300,
};

export const defaultSearchParameters: SearchParameters = {
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
};

const Provider = ({ children }: { children: ReactNode }) => {
    const [attributeToPreview, setAttributeToPreview] = useState<SearchParameterName | undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [projectionParameters, setProjectionParameters] = useState<ProjectionParameters>(defaultProjectionParameters);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>(defaultSearchParameters);

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
            }}
        >
            {children}
        </Context.Provider>
    );
};

export default Provider;
