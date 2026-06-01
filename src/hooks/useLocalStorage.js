import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DEBOUNCE_MS = 800;

// Returns true if Firebase is configured (not placeholder values)
function isFirebaseReady() {
  try {
    return db.app.options.projectId !== 'REMPLACE_MOI';
  } catch {
    return false;
  }
}

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const debounceRef = useRef(null);
  // Tracks writes we initiated so we ignore our own Firestore snapshots
  const localWriteRef = useRef(null);

  // Re-read from localStorage when key changes (e.g. week navigation)
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

  // Real-time Firestore sync: on mount and on key change, listen for remote updates
  useEffect(() => {
    if (!isFirebaseReady()) return;

    const unsub = onSnapshot(
      doc(db, 'planner', key),
      (snap) => {
        // Ignore snapshots caused by our own pending writes
        if (snap.metadata.hasPendingWrites) return;

        if (!snap.exists()) {
          // Firestore has no data for this key — push localStorage if we have it
          const localItem = window.localStorage.getItem(key);
          if (localItem !== null) {
            setDoc(doc(db, 'planner', key), { v: localItem }).catch(() => {});
          }
          return;
        }

        try {
          const remote = JSON.parse(snap.data().v);
          const remoteStr = JSON.stringify(remote);
          // Only update if different from what we last wrote locally
          if (localWriteRef.current === remoteStr) return;
          window.localStorage.setItem(key, remoteStr);
          setStoredValue(remote);
        } catch {}
      },
      () => {} // ignore Firestore errors (e.g. offline)
    );

    return unsub;
  }, [key]);

  const setValue = (value) => {
    try {
      let current;
      try {
        const item = window.localStorage.getItem(key);
        current = item !== null ? JSON.parse(item) : initialValue;
      } catch {
        current = storedValue;
      }
      const valueToStore = value instanceof Function ? value(current) : value;
      const serialized = JSON.stringify(valueToStore);

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serialized);
      localWriteRef.current = serialized;

      // Debounced write to Firestore
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (!isFirebaseReady()) return;
        setDoc(doc(db, 'planner', key), { v: serialized }).catch(() => {});
      }, DEBOUNCE_MS);
    } catch (error) {
      console.error('useLocalStorage error:', error);
    }
  };

  return [storedValue, setValue];
}
