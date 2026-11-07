export type LabelBox = { id: string; x: number; y: number; width: number; height: number };

// Candidates arrive in priority order. A screen-space grid avoids comparing every pair.
export function visibleLabels(boxes: LabelBox[], width: number, height: number): Record<string, boolean> {
  'worklet';
  const cells: Record<string, LabelBox[]> = {};
  const visible: Record<string, boolean> = {};
  for (const box of boxes) {
    if (box.x + box.width < 0 || box.y + box.height < 0 || box.x > width || box.y > height) continue;
    const left = Math.floor((box.x - 4) / 128), right = Math.floor((box.x + box.width + 4) / 128);
    const top = Math.floor((box.y - 4) / 128), bottom = Math.floor((box.y + box.height + 4) / 128);
    let overlaps = false;
    for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
      for (const other of cells[`${x},${y}`] ?? []) {
        if (box.x < other.x + other.width + 4 && box.x + box.width + 4 > other.x && box.y < other.y + other.height + 4 && box.y + box.height + 4 > other.y) overlaps = true;
      }
    }
    if (overlaps) continue;
    visible[box.id] = true;
    for (let x = left; x <= right; x++) for (let y = top; y <= bottom; y++) {
      const key = `${x},${y}`;
      (cells[key] ??= []).push(box);
    }
  }
  return visible;
}
