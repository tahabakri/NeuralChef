import 'react';

declare module 'react' {
  function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  function useState<T = undefined>(): [T | undefined, React.Dispatch<React.SetStateAction<T | undefined>>];
  
  function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
} 