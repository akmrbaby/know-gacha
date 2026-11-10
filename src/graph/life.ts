import type { Position } from '../knowledge/model';

export type Drift = {
  x: number; y: number; vx: number; vy: number;
  targetX: number; targetY: number; remaining: number; resting: number;
  radius: number; speed: number; seed: number;
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

function destination(state: Drift) {
  'worklet';
  const angle = random(state) * Math.PI * 2;
  const radius = state.radius * (0.25 + random(state) * 0.6);
  state.targetX = Math.cos(angle) * radius;
  state.targetY = Math.sin(angle) * radius;
  state.remaining = 6 + random(state) * 10;
}

export function createDrift(id: string, session = 0): Drift {
  'worklet';
  let hash = 2166136261;
  for (let index = 0; index < id.length; index++) hash = Math.imul(hash ^ id.charCodeAt(index), 16777619) >>> 0;
  const state: Drift = { x: 0, y: 0, vx: 0, vy: 0, targetX: 0, targetY: 0, remaining: 0, resting: 0, radius: 14 + (hash % 1000) / 100, speed: 0.85 + ((hash >>> 12) % 1000) / 800, seed: (hash ^ session) >>> 0 };
  destination(state);
  return state;
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
  if (state.remaining <= 0) {
    destination(state);
    if (random(state) < 0.22) state.resting = 1.8 + random(state) * 3.8;
  }
  state.resting = Math.max(0, state.resting - dt);
  const dx = state.targetX - state.x, dy = state.targetY - state.y;
  const distance = Math.hypot(dx, dy);
  const speed = state.resting ? 0 : state.speed * Math.min(1, distance / 6);
  const blend = 1 - Math.exp(-dt / 1.4);
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
