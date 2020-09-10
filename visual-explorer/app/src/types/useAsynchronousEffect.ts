import { useEffect } from 'react';

const useAsynchronousEffect = (
    effect: () => Promise<void>,
    dependencies?: readonly any[]
) => {
    useEffect(() => {
        (async () => {
            await effect();
        })();
    }, dependencies);
};

export default useAsynchronousEffect;
