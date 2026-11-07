import { positions, relations } from '../data/graph';
export type Camera = { x: number; y: number; scale: number };
export const MIN_SCALE = 0.25;
export const MAX_SCALE = 2.2;
export const WORLD_SIZE = 2400;
export const WORLD_CENTER = WORLD_SIZE / 2;
export function fitCamera(ids: string[], width: number, height: number): Camera {
  if (!ids.length) return { x: width / 2, y: height / 2, scale: 1 };
  const xs = ids.map((id) => positions[id].x), ys = ids.map((id) => positions[id].y);
  const left = Math.min(...xs) - 110, right = Math.max(...xs) + 110;
  const top = Math.min(...ys) - 120, bottom = Math.max(...ys) + 100;
  const scale = Math.max(MIN_SCALE, Math.min(1.05, (width - 48) / (right - left), Math.max(120, height - 170) / (bottom - top)));
  return { x: width / 2 - (left + right) / 2 * scale, y: height / 2 + 12 - (top + bottom) / 2 * scale, scale };
}
// Zoom around a screen point, keeping its world coordinate under the fingers.
export function zoomAt(camera: Camera, focalX: number, focalY: number, scale: number): Camera {
  'worklet';
  const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));
  const ratio = next / camera.scale;
  return { x: focalX - (focalX - camera.x) * ratio, y: focalY - (focalY - camera.y) * ratio, scale: next };
}
export function focusCamera(id: string, width: number, height: number): Camera {
  const edge = relations.find((item) => item.id === id);
  const p = edge ? { x: (positions[edge.sourceId].x + positions[edge.targetId].x) / 2, y: (positions[edge.sourceId].y + positions[edge.targetId].y) / 2 } : positions[id];
  if (!p) return fitCamera([], width, height);
  const scale = Math.min(1.2, (width - 48) / 250);
  return { x: width / 2 - p.x * scale, y: (Math.max(0, height - Math.min(265, height * 0.4)) + 100) / 2 - p.y * scale, scale };
}
