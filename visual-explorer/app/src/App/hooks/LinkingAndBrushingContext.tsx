import React, { DependencyList } from 'react';

export interface ILinkingAndBrushingContext {
    useBrush: <T>(event: string, payload: () => T, deps: DependencyList) => ((payload: T) => void)[];
    useLink: <T>(
        event: string,
        next: (value: T) => void,
        complete?: () => void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?: (value: any) => void
    ) => (() => void)[];
}

const defaultContext: ILinkingAndBrushingContext = {
    useBrush: () => {
        // Initial value. Replaced by context provider.
        return [];
    },
    useLink: () => {
        // Initial value. Replaced by context provider.
        return [];
    },
};

export const LinkingAndBrushingContext = React.createContext(defaultContext);
