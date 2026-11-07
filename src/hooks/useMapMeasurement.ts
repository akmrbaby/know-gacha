import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useFrameCallback, useSharedValue, type FrameInfo } from 'react-native-reanimated';
import { createLayoutMeasurement, MAX_SAMPLES, summarize } from '../graph/measurement';

// Opt-in instrumentation. Only the final report crosses into React state.
export function useMapMeasurement(metadata: string, contextKey: string) {
  const samples = useSharedValue<number[]>([]);
  const collectFrame = useCallback((frame: FrameInfo) => {
    'worklet';
    const interval = frame.timeSincePreviousFrame;
    if (interval === null) return;
    samples.modify((values) => { if (values.length < MAX_SAMPLES) values.push(interval); return values; });
  }, [samples]);
  const frameCallback = useFrameCallback(collectFrame, false);
  const [probe] = useState(createLayoutMeasurement);
  const started = useRef<{ at: number; date: string; metadata: string; contextKey: string } | null>(null);
  const [recording, setRecording] = useState(false);
  const [report, setReport] = useState('');
  const finish = useCallback((reason = 'manual') => {
    const run = started.current;
    if (!run) return;
    started.current = null;
    frameCallback.setActive(false);
    const frames = samples.get();
    const result = {
      schema: 1, startedAt: run.date, elapsedMs: performance.now() - run.at,
      reason, comparable: (reason === 'manual' || reason === 'timeout') && frames.length >= 2 && frames.length < MAX_SAMPLES,
      ...JSON.parse(run.metadata),
      frameCallbackIntervalMs: summarize(frames), frameSamplesTruncated: frames.length >= MAX_SAMPLES,
      layout: probe.stop(),
      limitations: 'Instrumented UI callback intervals, not GPU render times or touch latency. Record hardware model, refresh rate, build ID/commit, gestures and feel separately.',
    };
    setRecording(false); setReport(JSON.stringify(result, null, 2));
  }, [frameCallback, probe, samples]);
  function begin() {
    if (started.current) return;
    samples.set([]); probe.start(); setReport('');
    started.current = { at: performance.now(), date: new Date().toISOString(), metadata, contextKey };
    frameCallback.setActive(true); setRecording(true);
  }
  useEffect(() => {
    if (!recording) return;
    const timer = setTimeout(() => finish('timeout'), 20000);
    return () => clearTimeout(timer);
  }, [recording, finish]);
  useEffect(() => {
    if (started.current && (started.current.contextKey !== contextKey || started.current.metadata !== metadata)) finish('context-changed');
  }, [contextKey, metadata, finish]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => { if (state !== 'active') finish('app-not-active'); });
    return () => subscription.remove();
  }, [finish]);
  useEffect(() => () => { started.current = null; probe.stop(); frameCallback.setActive(false); }, [frameCallback, probe]);
  return { probe, begin, finish, recording, report, dismiss: () => setReport('') };
}
