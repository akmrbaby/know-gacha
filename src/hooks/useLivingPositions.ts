import { useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { useAnimatedReaction, useDerivedValue, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import { advanceDrift, createDrift, displayPositions, freezeDrift, type Drift } from '../graph/life';
import type { Position } from '../knowledge/model';
import type { NodeDrag } from './useGraphLayout';
import { createForegroundStore } from '../state/foreground';

const foregroundStore = createForegroundStore(AppState);

export function useLivingPositions({ base, drag, renderedIds, frozen, touching, pinching, cameraX, cameraY, scale, active }: {
  base: SharedValue<Record<string, Position>>; drag: SharedValue<NodeDrag>;
  renderedIds: SharedValue<string[]>; frozen: Record<string, boolean>;
  touching: SharedValue<boolean>; pinching: SharedValue<boolean>;
  cameraX: SharedValue<number>; cameraY: SharedValue<number>; scale: SharedValue<number>; active: boolean;
}) {
  const foreground = useSyncExternalStore(foregroundStore.subscribe, foregroundStore.getSnapshot, foregroundStore.getServerSnapshot);
  const [session] = useState(() => Math.floor(Math.random() * 4294967296));
  const drifts = useSharedValue<Record<string, Drift>>({});
  const cooldown = useSharedValue(1.2), ramp = useSharedValue(0), elapsed = useSharedValue(0);
  const previousCamera = useSharedValue({ x: 0, y: 0, scale: 0 });
  useAnimatedReaction(() => drag.value?.active ? drag.value.id : '', (id, previous) => {
    if (id && id !== previous) {
      // The drag target already includes the visible offset. Absorb that offset
      // into the layout instead of adding it a second time on release.
      drifts.set({ ...drifts.value, [id]: createDrift(id, session) });
    }
  });
  const frames = useFrameCallback(frame => {
    if (!active || !foreground) return;
    const dt = Math.min(0.05, (frame.timeSincePreviousFrame ?? 0) / 1000);
    const camera = { x: cameraX.value, y: cameraY.value, scale: scale.value };
    const previous = previousCamera.value;
    const cameraMoved = camera.x !== previous.x || camera.y !== previous.y || camera.scale !== previous.scale;
    previousCamera.set(camera);
    if (touching.value || pinching.value || cameraMoved || camera.scale < 0.35) {
      cooldown.set(1.2); ramp.set(0); elapsed.set(0);
      return;
    }
    if (cooldown.value > 0) { cooldown.set(Math.max(0, cooldown.value - dt)); return; }
    elapsed.set(elapsed.value + dt);
    if (elapsed.value < 1 / 30) return;
    const step = Math.min(0.05, elapsed.value);
    elapsed.set(0);
    ramp.set(Math.min(1, ramp.value + step / 0.9));
    const next = { ...drifts.value };
    let changed = false;
    for (const id of renderedIds.value) {
      if (!base.value[id]) continue;
      const previous = next[id] ?? createDrift(id, session);
      const current = frozen[id] ? freezeDrift(previous) : advanceDrift(previous, step * ramp.value);
      if (current !== next[id]) { next[id] = current; changed = true; }
    }
    if (changed) drifts.set(next);
  }, false);
  useEffect(() => {
    cooldown.set(1.2); ramp.set(0); elapsed.set(0);
    frames.setActive(active && foreground);
    return () => frames.setActive(false);
  }, [active, foreground, frames, cooldown, ramp, elapsed]);
  return useDerivedValue<Record<string, Position>>(() => {
    const held = drag.value;
    return displayPositions(base.value, drifts.value, held?.active ? held.id : '');
  });
}
