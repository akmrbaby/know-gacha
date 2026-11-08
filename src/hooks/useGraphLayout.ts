import { useCallback, useEffect, useRef } from 'react';
import { useDerivedValue, useSharedValue } from 'react-native-reanimated';
import type { LayoutMeasurement } from '../graph/measurement';
import { createLayout } from '../graph/layout';
import type { GraphView, KnowledgeGraph, Position } from '../knowledge/model';

export type NodeDrag = { id: string; x: number; y: number; active: boolean } | null;
export function useGraphLayout(graph: KnowledgeGraph, view: GraphView, enabled: boolean, reduced: boolean, measurement?: LayoutMeasurement) {
  const probe = useRef(measurement);
  useEffect(() => { probe.current = measurement; }, [measurement]);
  const coordinates = useSharedValue(graph.positions);
  const drag = useSharedValue<NodeDrag>(null);
  const engine = useRef<ReturnType<typeof createLayout> | null>(null);
  const frame = useRef<number | null>(null);
  const runner = useRef<() => void>(() => {});
  const wake = useCallback(() => {
    if (frame.current === null) frame.current = requestAnimationFrame(() => runner.current());
  }, []);
  const topology = JSON.stringify([view.ids, view.edges.map((edge) => [edge.id, edge.sourceId, edge.targetId])]);
  useEffect(() => {
    if (!enabled) { coordinates.set(graph.positions); return; }
    const layout = engine.current ?? createLayout(graph, view);
    engine.current = layout;
    layout.update(view);
    function publish() { coordinates.set({ ...graph.positions, ...layout.positions() }); }
    function advance(settle: boolean) {
      const started = performance.now();
      let ticks = 0;
      const limit = settle ? 240 : 1;
      for (; ticks < limit && layout.active && (ticks === 0 || performance.now() - started < 4); ticks++) layout.tick();
      probe.current?.record(performance.now() - started, ticks);
    }
    runner.current = () => {
      frame.current = null;
      const held = drag.get();
      if (held) layout.hold(held.id, held);
      if (!held?.active) layout.release();
      // Reduced motion keeps the grabbed node direct, without animated followers.
      if (reduced && !held?.active) advance(true);
      else if (!reduced) advance(false);
      publish();
      if (held && !held.active) drag.set((current) => current && !current.active && current.id === held.id && current.x === held.x && current.y === held.y ? null : current);
      if (held?.active || layout.active) wake();
    };
    if (reduced) advance(true);
    publish(); wake();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      layout.stop();
      runner.current = () => {};
    };
    // Topology is structural: selection renders must not reheat the simulation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, topology, enabled, reduced]);
  const positions = useDerivedValue<Record<string, Position>>(() => {
    const held = drag.value;
    return held ? { ...coordinates.value, [held.id]: { x: held.x, y: held.y } } : coordinates.value;
  });
  return { positions, drag, wake };
}
