import { useCallback, useRef, useState } from 'react';

interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

const LIMIT = 60;

/**
 * Undo/redo. Changes passed with the same `key` within a second are merged into
 * one step, so a whole drag or a slider move undoes in one tap.
 */
export function useHistory<T>(initial: T) {
  const [h, setH] = useState<History<T>>({ past: [], present: initial, future: [] });
  const last = useRef<{ key?: string; t: number }>({ t: 0 });

  const update = useCallback((fn: (p: T) => T, key?: string) => {
    const now = Date.now();
    const merge = !!key && last.current.key === key && now - last.current.t < 1000;
    last.current = { key, t: now };
    setH((s) => {
      const next = fn(s.present);
      if (next === s.present) return s;
      return merge ? { ...s, present: next } : { past: [...s.past.slice(-LIMIT + 1), s.present], present: next, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    last.current = { t: 0 };
    setH((s) => (s.past.length ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] } : s));
  }, []);

  const redo = useCallback(() => {
    last.current = { t: 0 };
    setH((s) => (s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s));
  }, []);

  const reset = useCallback((value: T) => {
    last.current = { t: 0 };
    setH({ past: [], present: value, future: [] });
  }, []);

  return { present: h.present, update, undo, redo, reset, canUndo: h.past.length > 0, canRedo: h.future.length > 0 };
}
