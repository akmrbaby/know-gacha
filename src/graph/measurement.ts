export const MAX_SAMPLES = 6000;
export type SampleSummary = { count: number; p50: number; p95: number; max: number };
export function summarize(samples: readonly number[]): SampleSummary | null {
  const sorted = samples.filter((value) => Number.isFinite(value) && value >= 0).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const percentile = (fraction: number) => sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)];
  return { count: sorted.length, p50: percentile(0.5), p95: percentile(0.95), max: sorted[sorted.length - 1] };
}
export type LayoutMeasurement = { record: (duration: number, ticks: number) => void };
export function createLayoutMeasurement() {
  let recording = false;
  let durations: number[] = [];
  let ticks = 0;
  let truncated = false;
  return {
    start() { durations = []; ticks = 0; truncated = false; recording = true; },
    record(duration: number, count: number) {
      if (!recording || count === 0) return;
      if (durations.length === MAX_SAMPLES) { truncated = true; return; }
      durations.push(duration); ticks += count;
    },
    stop() {
      recording = false;
      return { batchesMs: summarize(durations), ticks, truncated };
    },
  };
}
