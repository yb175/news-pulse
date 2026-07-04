import { useEffect, useRef } from 'react';

export function usePolling(callback: () => void, delayMs: number = 30000) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    
    const id = setInterval(() => {
      savedCallback.current();
    }, delayMs);
    
    return () => clearInterval(id);
  }, [delayMs]);
}
