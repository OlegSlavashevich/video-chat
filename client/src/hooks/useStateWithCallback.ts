import { useCallback, useEffect, useRef, useState } from 'react';

const useStateWithCallback = <T>(
  initialState: T
): [T, (newState: (prev: T) => T, cb?: () => void) => void] => {
  const [state, setState] = useState<T>(initialState);
  const cbRef = useRef<unknown>(null);

  const updateState = useCallback(
    (newState: (prev: T) => T, cb?: () => void) => {
      cbRef.current = cb;

      setState((prev: T) =>
        typeof newState === 'function' ? newState(prev) : newState
      );
    },
    []
  );

  useEffect(() => {
    if (typeof cbRef.current === 'function') {
      cbRef.current(state);
      cbRef.current = null;
    }
  }, [state]);

  return [state, updateState];
};

export default useStateWithCallback;
