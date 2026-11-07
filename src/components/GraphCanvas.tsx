import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDecay, withDelay, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation as Relation, KnowledgeGraph, Position } from '../knowledge/model';
import { fitCamera, focusCamera, MAX_SCALE, MIN_SCALE, WORLD_CENTER, WORLD_SIZE, zoomAt, type Camera } from '../graph/camera';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { LayoutMeasurement } from '../graph/measurement';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { colors } from './ui';

export type CameraRequest = { id?: string; kind: 'focus' | 'fit' | 'in' | 'out'; token: number };
type Props = {
  ids: string[]; edges: Relation[]; width: number; height: number;
  selected: string; request: CameraRequest | null; newOwner?: string;
  onSelect: (id: string) => void; graph?: KnowledgeGraph; dynamic?: boolean; measurement?: LayoutMeasurement;
};
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function GraphCanvas({ ids, edges, width, height, selected, request, newOwner, onSelect, graph = baseGraph, dynamic = false, measurement }: Props) {
  const worldSize = graph === baseGraph ? 2400 : WORLD_SIZE;
  const worldCenter = worldSize / 2;
  const reduced = useReducedMotion();
  const { positions, drag, wake } = useGraphLayout(graph, { ids, edges }, dynamic, reduced !== false, measurement);
  const touching = useSharedValue(false);
  const grabbed = useSharedValue('');
  const offset = useSharedValue({ x: 0, y: 0 });
  const manipulated = useSharedValue(false);
  const initial = fitCamera(ids, width, height, graph);
  const x = useSharedValue(initial.x), y = useSharedValue(initial.y), scale = useSharedValue(initial.scale);
  const pinching = useSharedValue(false);
  const rebasePan = useSharedValue(false);
  const lastFocal = useSharedValue({ x: 0, y: 0 });

  function move(camera: Camera) {
    const duration = reduced === false ? 480 : 0;
    scheduleOnUI(() => {
      'worklet';
      // A request queued on JS must not restart motion after a finger interrupted it.
      if (touching.value) return;
      x.set(withTiming(camera.x, { duration }));
      y.set(withTiming(camera.y, { duration }));
      scale.set(withTiming(camera.scale, { duration }));
    });
  }
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const currentGraph = { ...graph, positions: positions.get() };
      if (!request || request.kind === 'fit') move(fitCamera(ids, width, height, currentGraph));
      else if (request.kind === 'focus' && request.id) move(focusCamera(request.id, width, height, currentGraph));
      else if (request.kind === 'in' || request.kind === 'out') move(zoomAt({ x: x.value, y: y.value, scale: scale.value }, width / 2, height / 2, scale.value * (request.kind === 'in' ? 1.25 : 0.8)));
    });
    return () => cancelAnimationFrame(frame);
    // A camera request is an explicit event. Ordinary selection/state renders must not reset the viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, width, height]);

  function releaseDrag() {
    'worklet';
    const held = drag.value;
    if (held?.active) { drag.set({ ...held, active: false }); scheduleOnRN(wake); }
    grabbed.set('');
  }
  const pan = usePanGesture({
    minDistance: 5, averageTouches: true,
    onBegin: (event) => {
      touching.set(true);
      cancelAnimation(x); cancelAnimation(y); cancelAnimation(scale);
      manipulated.set(false); grabbed.set('');
      if (event.numberOfPointers === 1) rebasePan.set(false);
      if (dynamic && event.numberOfPointers === 1) {
        const wx = (event.x - x.value) / scale.value, wy = (event.y - y.value) / scale.value;
        let nearest = Infinity;
        for (const id of ids) {
          const p = positions.value[id];
          const distance = Math.hypot(wx - p.x, wy - p.y);
          if (distance < Math.max(32 * Math.min(2.1, 1 / scale.value), 26 / scale.value) && distance < nearest) {
            grabbed.set(id); offset.set({ x: p.x - wx, y: p.y - wy }); nearest = distance;
          }
        }
      }
    },
    onUpdate: (event) => {
      manipulated.set(true);
      if (pinching.value || event.numberOfPointers > 1) { releaseDrag(); rebasePan.set(true); return; }
      if (rebasePan.value) { rebasePan.set(false); return; }
      if (grabbed.value) {
        const starting = !drag.value?.active;
        drag.set({ active: true, id: grabbed.value, x: (event.x - x.value) / scale.value + offset.value.x, y: (event.y - y.value) / scale.value + offset.value.y });
        if (starting) scheduleOnRN(wake);
        return;
      }
      x.set(x.value + event.changeX);
      y.set(y.value + event.changeY);
    },
    onDeactivate: (event) => {
      if (grabbed.value) { releaseDrag(); return; }
      if (event.canceled || pinching.value || rebasePan.value || reduced !== false) return;
      x.set(withDecay({ velocity: event.velocityX, clamp: [-2500, 2500] }));
      y.set(withDecay({ velocity: event.velocityY, clamp: [-2500, 2500] }));
    },
    onFinalize: () => { touching.set(false); releaseDrag(); },
  });
  const pinch = usePinchGesture({
    onActivate: (event) => {
      cancelAnimation(x); cancelAnimation(y); cancelAnimation(scale);
      manipulated.set(true); releaseDrag();
      pinching.set(true);
      rebasePan.set(true);
      lastFocal.set({ x: event.focalX, y: event.focalY });
    },
    onUpdate: (event) => {
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * event.scaleChange));
      const ratio = nextScale / scale.value;
      x.set(event.focalX - (lastFocal.value.x - x.value) * ratio);
      y.set(event.focalY - (lastFocal.value.y - y.value) * ratio);
      scale.set(nextScale);
      lastFocal.set({ x: event.focalX, y: event.focalY });
    },
    onFinalize: () => { pinching.set(false); },
  });
  const tap = useTapGesture({
    maxDistance: 8,
    onDeactivate: (event) => {
      if (event.canceled || manipulated.value || pinching.value) return;
      const wx = (event.x - x.value) / scale.value, wy = (event.y - y.value) / scale.value;
      let closest = '', nearest = Infinity;
      for (const id of ids) {
        const node = { id, ...positions.value[id] };
        const distance = Math.hypot(wx - node.x, wy - node.y);
        if (distance < Math.max(48, 26 / scale.value) && distance < nearest) { closest = node.id; nearest = distance; }
      }
      if (!closest) {
        for (const edge of edges) {
          const line = { id: edge.id, a: positions.value[edge.sourceId], b: positions.value[edge.targetId] };
          const dx = line.b.x - line.a.x, dy = line.b.y - line.a.y;
          const t = Math.max(0, Math.min(1, ((wx - line.a.x) * dx + (wy - line.a.y) * dy) / Math.max(0.0001, dx * dx + dy * dy)));
          const distance = Math.hypot(wx - line.a.x - t * dx, wy - line.a.y - t * dy);
          if (distance < 22 / scale.value && distance < nearest) { closest = line.id; nearest = distance; }
        }
      }
      scheduleOnRN(onSelect, closest);
    },
  });
  const gesture = useSimultaneousGestures(pan, pinch, tap);
  const world = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - worldCenter * scale.value }, { translateY: y.value - worldCenter * scale.value }, { scale: scale.value }],
  }));
  return <GestureDetector gesture={gesture}>
    <View testID="atlas-canvas" style={StyleSheet.absoluteFill}>
      <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs><Pattern id="atlas-dots" width="26" height="26" patternUnits="userSpaceOnUse"><Circle cx="1" cy="1" r="1" fill="#CCD5CC" opacity="0.55" /></Pattern></Defs>
        <Rect width="100%" height="100%" fill="url(#atlas-dots)" />
        {edges.map((edge, index) => <Connection key={edge.id} edge={edge} graph={graph} positions={positions} cameraX={x} cameraY={y} scale={scale} selected={selected === edge.id} connected={edge.sourceId === selected || edge.targetId === selected} hasSelection={!!selected} appear={(newOwner === edge.sourceId || newOwner === edge.targetId)} index={index} reduced={reduced !== false} />)}
      </Svg>
      <Animated.View pointerEvents="box-none" style={[atlas.world, { width: worldSize, height: worldSize }, world]}>
        {edges.map((edge) => <EdgeLabel key={edge.id} edge={edge} graph={graph} positions={positions} scale={scale} selected={selected === edge.id} />)}
        {ids.map((id) => <AtlasNode key={id} id={id} graph={graph} positions={positions} selected={id === selected} scale={scale} appear={newOwner === id} reduced={reduced !== false} onSelect={onSelect} />)}
      </Animated.View>
    </View>
  </GestureDetector>;
}
function Connection({ edge, graph, positions, cameraX, cameraY, scale, selected, connected, hasSelection, appear, index, reduced }: { cameraX: SharedValue<number>; cameraY: SharedValue<number>; positions: SharedValue<Record<string, Position>>; scale: SharedValue<number>; graph: KnowledgeGraph; edge: Relation; selected: boolean; connected: boolean; hasSelection: boolean; appear: boolean; index: number; reduced: boolean }) {
  const progress = useSharedValue(appear && !reduced ? 0 : 1);
  useEffect(() => { if (appear && !reduced) { progress.set(0); progress.set(withDelay(180 + index * 80, withTiming(1, { duration: 550 }))); } else if (reduced) progress.set(1); }, [progress, reduced, index, appear]);
  const color = selected || connected ? graph.nodes[edge.sourceId].color : '#587565';
  const animated = useAnimatedProps(() => {
    const a = positions.value[edge.sourceId], b = positions.value[edge.targetId];
    const ax = cameraX.value + a.x * scale.value, ay = cameraY.value + a.y * scale.value;
    const bx = cameraX.value + b.x * scale.value, by = cameraY.value + b.y * scale.value;
    const length = Math.hypot(bx - ax, by - ay) + 20;
    const detail = Math.min(1, Math.max(0, (scale.value - 0.12) / 0.6));
    const highlighted = selected || connected;
    // The viewport-sized SVG draws in screen pixels; never allocate a world-sized native surface.
    const width = selected ? 2.8 : connected ? 2.2 : 1 + detail * 0.6;
    const opacity = highlighted ? 1 : hasSelection ? 0.18 : 0.38 + detail * 0.37;
    return { d: `M ${ax} ${ay} L ${bx} ${by}`, strokeWidth: width, strokeOpacity: opacity, strokeDasharray: [length, length], strokeDashoffset: length * (1 - progress.value) };
  });
  return <AnimatedPath animatedProps={animated} stroke={color} fill="none" strokeLinecap="round" />;
}
function AtlasNode({ id, graph, positions, selected, scale, appear, reduced, onSelect }: { positions: SharedValue<Record<string, Position>>; graph: KnowledgeGraph; id: string; selected: boolean; scale: SharedValue<number>; appear: boolean; reduced: boolean; onSelect: (id: string) => void }) {
  const worldCenter = graph === baseGraph ? 1200 : WORLD_CENTER;
  const look = graph.nodes[id], main = look.kind === 'knowledge';
  const emergence = useSharedValue(appear && !reduced ? 0 : 1);
  useEffect(() => { if (appear && !reduced) { emergence.set(0); emergence.set(withSpring(1, { damping: 18, stiffness: 150 })); } else if (reduced) emergence.set(1); }, [emergence, reduced, appear]);
  const node = useAnimatedStyle(() => ({ opacity: emergence.value, transform: [{ translateX: positions.value[id].x }, { translateY: positions.value[id].y }, { scale: Math.min(2.1, 1 / scale.value) * emergence.value }] }));
  const labelOpacity = useLabelOpacity(scale, !!main, 0.65, 0.5);
  const label = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));
  return <Animated.View style={[atlas.nodeAnchor, { left: worldCenter - 90, top: worldCenter - 32 }, node]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${graph.nodes[id].name}、${main ? '開封済み教材' : '周辺語'}`} accessibilityState={{ selected }} onAccessibilityTap={() => onSelect(id)} accessibilityActions={[{ name: 'activate' }]} onAccessibilityAction={(event) => { if (event.nativeEvent.actionName === 'activate') onSelect(id); }} style={{ alignItems: 'center', gap: 9, width: 180, minHeight: 80 }}>
      <View style={atlas.orbSlot}><View style={[atlas.orb, { width: main ? 64 : 28, height: main ? 64 : 28, borderRadius: 40, backgroundColor: main ? look.color : colors.card, borderColor: look.color, borderWidth: main ? 0 : 2 }, selected && { outlineWidth: 3, outlineColor: look.color, outlineOffset: 6 }]}>
        {main && <Text accessible={false} style={{ color: '#FFFDF5', fontSize: 30 }}>{look.mark}</Text>}
        {!main && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: look.color }} />}
      </View></View>
      <Animated.View style={[atlas.label, label]}><Text style={{ fontSize: main ? 15 : 12, lineHeight: main ? 22 : 19, fontWeight: main ? '700' : '500', color: colors.ink, textAlign: 'center' }}>{graph.nodes[id].name}</Text></Animated.View>
    </Pressable>
  </Animated.View>;
}
function EdgeLabel({ edge, graph, positions, scale, selected }: { positions: SharedValue<Record<string, Position>>; graph: KnowledgeGraph; edge: Relation; scale: SharedValue<number>; selected: boolean }) {
  const worldCenter = graph === baseGraph ? 1200 : WORLD_CENTER;
  const opacity = useLabelOpacity(scale, selected, 1.1, 0.9);
  const style = useAnimatedStyle(() => {
    const a = positions.value[edge.sourceId], b = positions.value[edge.targetId];
    return { opacity: opacity.value, transform: [{ translateX: (a.x + b.x) / 2 }, { translateY: (a.y + b.y) / 2 }] };
  });
  return <Animated.View pointerEvents="none" style={[atlas.edgeLabel, { left: worldCenter - 65, top: worldCenter - 12 }, style]}><Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>{edge.label}</Text></Animated.View>;
}
// Separate show/hide thresholds keep labels stable near a zoom boundary.
function useLabelOpacity(scale: SharedValue<number>, always: boolean, show: number, hide: number) {
  const opacity = useSharedValue(always ? 1 : 0);
  useAnimatedReaction(() => always || scale.value >= show ? 1 : scale.value <= hide ? 0 : -1,
    (next) => { if (next !== -1) opacity.set(withTiming(next, { duration: 120 })); }, [always, show, hide]);
  return opacity;
}
const atlas = StyleSheet.create({
  orbSlot: { height: 64, justifyContent: 'center', alignItems: 'center' },
  world: { position: 'absolute', width: WORLD_SIZE, height: WORLD_SIZE, left: 0, top: 0, transformOrigin: 'top left' },
  nodeAnchor: { position: 'absolute', width: 180, alignItems: 'center', transformOrigin: '90px 32px' },
  orb: { alignItems: 'center', justifyContent: 'center' },
  label: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: '#FAF9F0', maxWidth: 180 },
  edgeLabel: { position: 'absolute', width: 130, padding: 3, backgroundColor: '#FAF9F0', borderRadius: 8 },
});
