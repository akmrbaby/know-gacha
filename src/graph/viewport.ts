import type { Position } from '../knowledge/model';
import type { Camera } from './camera';

// Screen-space groups are proximity summaries, never semantic categories.
export function viewportNodes(ids: string[], positions: Record<string, Position>, camera: Camera, width: number, height: number, priority: Record<string, boolean>) {
  const groups: Record<string, { id: string; count: number }> = {};
  const result: Record<string, number> = {};
  for (const id of ids) {
    const p = positions[id];
    if (!p) continue;
    const x = camera.x + p.x * camera.scale, y = camera.y + p.y * camera.scale;
    if (x < -110 || y < -110 || x > width + 110 || y > height + 110) continue;
    if (camera.scale >= 0.35 || priority[id]) { result[id] = 1; continue; }
    const cell = `${Math.floor(x / 44)},${Math.floor(y / 44)}`;
    if (groups[cell]) groups[cell].count++;
    else groups[cell] = { id, count: 1 };
  }
  for (const group of Object.values(groups)) result[group.id] = group.count;
  return result;
}
export function lineInViewport(ax: number, ay: number, bx: number, by: number, width: number, height: number) {
  'worklet';
  return !(Math.max(ax, bx) < 0 || Math.min(ax, bx) > width || Math.max(ay, by) < 0 || Math.min(ay, by) > height);
}
