import { useCallback, useRef, useMemo, useState, useEffect } from 'react';
import { isEqual } from 'lodash'; // You would need to install this dependency

/**
 * A hook that returns a memoized version of the state, setter, and a selector function.
 * Only triggers re-renders when the selected slice of state changes.
 * Helps prevent unnecessary re-renders in components that only need part of a complex state.
 * 
 * @param initialState The initial state value
 * @returns Tuple containing [state, setState, useSelector]
 */
export function useMemoizedState<T>(initialState: T) {
  const [state, setStateInternal] = useState<T>(initialState);
  const stateRef = useRef(state);
  
  // Update the ref when state changes
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Setter that only updates state if the value has changed
  const setState = useCallback((newState: T | ((prevState: T) => T)) => {
    if (typeof newState === 'function') {
      setStateInternal((prevState) => {
        const result = (newState as ((prevState: T) => T))(prevState);
        if (isEqual(prevState, result)) {
          return prevState;
        }
        return result;
      });
    } else if (!isEqual(stateRef.current, newState)) {
      setStateInternal(newState);
    }
  }, []);

  // Create a selector hook that only returns a specific slice of state
  const useSelector = useCallback(<S>(selector: (state: T) => S, deps: any[] = []) => {
    return useMemo(() => selector(stateRef.current), [state, ...deps]);
  }, [state]);
  
  return [state, setState, useSelector] as const;
}

/**
 * Hook to create a memoized callback that only changes when its deps change.
 * Prevents unnecessary re-renders and function recreations.
 * 
 * @param callback Function to memoize
 * @param deps Dependency array that will trigger recreation when changed
 * @returns Memoized callback
 */
export function useStableMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>({
    deps: [],
    value: undefined as unknown as T,
  });
  
  if (!ref.current.value || !isEqual(deps, ref.current.deps)) {
    ref.current.deps = deps;
    ref.current.value = factory();
  }
  
  return ref.current.value;
}

/**
 * Hook to get previous value of a variable
 * 
 * @param value The current value
 * @returns The previous value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

/**
 * Hook that prevents state updates when component is unmounted
 * 
 * @returns Object with isMounted flag to check before state updates
 */
export function useIsMounted() {
  const isMountedRef = useRef(false);
  
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    isMounted: () => isMountedRef.current
  };
} 