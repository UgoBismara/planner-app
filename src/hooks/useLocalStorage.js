import { useState, useEffect, useRef } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // Re-read from localStorage whenever the key changes (e.g. week navigation)
  const prevKeyRef = useRef(key);
  useEffect(() => {
    if (prevKeyRef.current === key) return;
    prevKeyRef.current = key;
    try {
      const item = window.localStorage.getItem(key);
      setStoredValue(item !== null ? JSON.parse(item) : initialValue);
    } catch {
      setStoredValue(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const setValue = (value) => {
    try {
      // Always read current value from localStorage to avoid stale closure
      let current;
      try {
        const item = window.localStorage.getItem(key);
        current = item !== null ? JSON.parse(item) : initialValue;
      } catch {
        current = storedValue;
      }
      const valueToStore = value instanceof Function ? value(current) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  };

  return [storedValue, setValue];
}
