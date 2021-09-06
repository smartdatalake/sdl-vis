import React, { DependencyList, ReactNode, useEffect, useState } from 'react';
import { Subject, Subscription } from 'rxjs';
import { useUpdateEffect } from 'react-use';
import { LinkingAndBrushingContext } from 'App/hooks/LinkingAndBrushingContext';

export const LinkingAndBrushingContextProvider = ({ children }: { children: ReactNode }) => {
    const [events, setEvents] = useState<Map<string, unknown>>(new Map<string, unknown>());

    const useLink = <T,>(
        event: string,
        next: (value: T) => void,
        complete?: () => void,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error?: (value: any) => void
    ): (() => void)[] => {
        if (!events.has(event)) {
            setEvents(events.set(event, new Subject<T>()));
        }

        const link: () => void = () => {
            const subject: Subject<T> = events.get(event) as Subject<T>;
            let subscription: Subscription;

            if (subject) {
                subscription = subject.subscribe({
                    complete,
                    error,
                    next,
                });
            }

            return () => {
                if (subscription) subscription.unsubscribe();
            };
        };

        useEffect(link, []);

        return [link];
    };

    const useBrush = <T,>(event: string, payload: () => T, deps: DependencyList) => {
        if (!events.has(event)) {
            setEvents(events.set(event, new Subject<T>()));
        }

        const brush = (payload: T) => {
            const subject: Subject<T> = events.get(event) as Subject<T>;

            if (subject) subject.next(payload);
        };

        useUpdateEffect(() => brush(payload()), deps);

        return [brush];
    };

    return (
        <LinkingAndBrushingContext.Provider
            value={{
                useLink,
                useBrush,
            }}
        >
            {children}
        </LinkingAndBrushingContext.Provider>
    );
};
