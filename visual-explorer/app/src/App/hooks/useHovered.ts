import { useCallback, useState } from 'react';

type Handler = () => void;

export const useHovered = (): [boolean, Handler, Handler] => {
    const [hovered, setHovered] = useState(false);

    const onHoverHandler = useCallback(() => {
        setHovered(true);
    }, []);

    const onUnhoverHandler = useCallback(() => {
        setHovered(false);
    }, []);

    return [hovered, onHoverHandler, onUnhoverHandler];
};
