import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MAX_SCALE, MIN_SCALE, type Camera } from '../graph/camera';

const KEY = 'knowgacha.map-viewport.v1';
type Viewport = { centerX: number; centerY: number; scale: number };
export function useMapViewport(width: number, height: number) {
  const [restored, setRestored] = useState<Viewport | null | undefined>(undefined);
  const last = useRef('');
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(KEY).then(raw => {
      const value = raw ? JSON.parse(raw) as Viewport : null;
      const valid = value && [value.centerX, value.centerY, value.scale].every(Number.isFinite) && value.scale >= MIN_SCALE && value.scale <= MAX_SCALE;
      if (mounted) setRestored(valid ? value : null);
    }).catch(() => { if (mounted) setRestored(null); });
    return () => { mounted = false; };
  }, []);
  const save = useCallback((camera: Camera) => {
    const value = JSON.stringify({ centerX: (width / 2 - camera.x) / camera.scale, centerY: (height / 2 - camera.y) / camera.scale, scale: camera.scale });
    if (value === last.current) return;
    last.current = value;
    writes.current = writes.current.then(() => AsyncStorage.setItem(KEY, value)).catch(() => { last.current = ''; });
  }, [width, height]);
  return { ready: restored !== undefined, initial: restored ? { x: width / 2 - restored.centerX * restored.scale, y: height / 2 - restored.centerY * restored.scale, scale: restored.scale } : undefined, save };
}
