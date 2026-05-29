import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';

const INACTIVITY_MS_DEFAULT = 5 * 60 * 1000; // 5 minutes

export function useFaceLock() {
  const user = useSelector(s => s.user);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef(null);

  const faceEnabled = user?.faceDescriptorEnabled;
  const inactivityMs = (user?.faceLockInactivityMinutes || 5) * 60 * 1000;

  const lock = useCallback(() => setLocked(true), []);
  const unlock = useCallback(() => {
    setLocked(false);
    resetTimer();
  }, []);

  const resetTimer = useCallback(() => {
    if (!faceEnabled) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(lock, inactivityMs);
  }, [faceEnabled, inactivityMs, lock]);

  // Reset timer on user activity
  useEffect(() => {
    if (!faceEnabled) return;
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, [faceEnabled, resetTimer]);

  return { locked: faceEnabled ? locked : false, lock, unlock };
}
