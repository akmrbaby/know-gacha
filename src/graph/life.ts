import type { Position } from '../knowledge/model';

export type Drift = {
  x: number; y: number; vx: number; vy: number;
  targetX: number; targetY: number; remaining: number; resting: number;
  radius: number; speed: number; seed: number;
  reach: number; pace: number; zoom: number;
};

export function displayPositions(base: Record<string, Position>, drifts: Record<string, Drift>, held = ''): Record<string, Position> {
  'worklet';
  const points = { ...base };
  for (const [id, drift] of Object.entries(drifts)) {
    const point = points[id];
    if (point && id !== held) points[id] = { x: point.x + drift.x, y: point.y + drift.y };
  }
  return points;
}

function random(state: Drift) {
  'worklet';
  state.seed = (state.seed * 1664525 + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

// Worklets capture other worklets when this module is initialized; declare
// these helpers before the callers so their captured functions already exist.
function motionRadius(reach: number, zoom: number) {
  'worklet';
  return (8 + (reach - 8) * Math.min(1, zoom / 0.75)) / zoom;
}

function motionSpeed(pace: number, zoom: number) {
  'worklet';
  return pace * (0.65 + 0.35 * Math.min(1, zoom / 0.75)) / zoom;
}

function destination(state: Drift) {
  'worklet';
  const angle = random(state) * Math.PI * 2;
  const radius = motionRadius(state.reach, state.zoom) * (0.45 + random(state) * 0.4);
  state.targetX = Math.cos(angle) * radius;
  state.targetY = Math.sin(angle) * radius;
  if (Math.hypot(state.targetX - state.x, state.targetY - state.y) < radius * 0.4) {
    state.targetX *= -1; state.targetY *= -1;
  }
  state.remaining = 4 + random(state) * 4;
}

export function createDrift(id: string, session = 0, scale = 1): Drift {
  'worklet';
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) hash = Math.imul(hash ^ id.charCodeAt(index), 16777619) >>> 0;
  const zoom = Math.max(0.02, scale), reach = 28 + (hash % 1000) / 71.43, pace = 4 + ((hash >>> 12) % 1000) / 333.33;
  const state: Drift = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, remaining: 0, resting: 0, radius: motionRadius(reach, zoom), speed: motionSpeed(pace, zoom), seed: (hash ^ session) >>> 0, reach, pace, zoom };
  destination(state);
  return state;
}

export function retuneDrift(previous: Drift, scale: number): Drift {
  'worklet';
  const zoom = Math.max(0.02, scale);
  if (Math.abs(previous.zoom - zoom) < 0.000001) return previous;
  // Keep the exact world position across a pinch. A temporarily wider offset
  // returns gradually into the new screen-space envelope, never by snapping.
  const state = { ...previous, zoom, speed: motionSpeed(previous.pace, zoom), radius: Math.max(motionRadius(previous.reach, zoom), Math.hypot(previous.x, previous.y)), vx: 0, vy: 0, resting: 0 };
  destination(state);
  return state;
}

export function frozenNodes(selected: string, edges: { id: string; sourceId: string; targetId: string }[]): Record<string, boolean> {
  const edge = edges.find(item => item.id === selected);
  return edge ? { [edge.sourceId]: true, [edge.targetId]: true } : selected ? { [selected]: true } : {};
}

export function freezeDrift(state: Drift): Drift {
  'worklet';
  return state.vx || state.vy ? { ...state, vx: 0, vy: 0 } : state;
}

export function advanceDrift(previous: Drift, seconds: number): Drift {
  'worklet';
  // A delayed/background frame never catches up in one large jump.
  const dt = Math.min(0.05, Math.max(0, seconds));
  if (!dt) return previous;
  const state = { ...previous };
  state.remaining -= dt;
  const envelope = motionRadius(state.reach, state.zoom);
  state.radius = Math.max(envelope, Math.hypot(state.x, state.y));
  if (state.remaining <= 0 || (!state.resting && Math.hypot(state.targetX - state.x, state.targetY - state.y) < envelope * 0.15)) {
    destination(state);
    if (random(state) < 0.1) state.resting = 0.8 + random(state) * 1;
  }
  state.resting = Math.max(0, state.resting - dt);
  const dx = state.targetX - state.x, dy = state.targetY - state.y;
  const distance = Math.hypot(dx, dy);
  const speed = state.resting ? 0 : state.speed * Math.min(1, distance / Math.max(1, envelope * 0.15));
  const blend = 1 - Math.exp(-dt / 0.8);
  state.vx += ((distance ? dx / distance * speed : 0) - state.vx) * blend;
  state.vy += ((distance ? dy / distance * speed : 0) - state.vy) * blend;
  state.x += state.vx * dt;
  state.y += state.vy * dt;
  const radius = Math.hypot(state.x, state.y);
  if (radius > state.radius) {
    state.x *= state.radius / radius;
    state.y *= state.radius / radius;
  }
  return state;
}
