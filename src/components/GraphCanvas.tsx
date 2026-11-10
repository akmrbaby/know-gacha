import { useI18n } from '../i18n/I18nProvider';
import { Text } from '../i18n/Text';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withDecay, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { lineInViewport, viewportNodes } from '../graph/viewport';
import { knowledgeColors } from '../colors';
import { visibleLabels, type LabelBox } from '../graph/labels';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation as Relation, KnowledgeGraph, Position } from '../knowledge/model';
import { fitCamera, focusCamera, MAX_SCALE, MIN_SCALE, zoomAt, type Camera } from '../graph/camera';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { LayoutMeasurement } from '../graph/measurement';
import { useGraphLayout } from '../hooks/useGraphLayout';
import { useLivingPositions } from '../hooks/useLivingPositions';
import { frozenNodes } from '../graph/life';
import { useThemeColors } from '../theme';

export type CameraRequest = { id?: string; kind: 'focus' | 'fit' | 'in' | 'out'; token: number };
type Props = {
  ids: string[]; edges: Relation[]; width: number; height: number;
  selected: string; request: CameraRequest | null; newOwner?: string;
  initialCamera?: Camera; onCameraChange?: (camera: Camera) => void;
  onSelect: (id: string) => void; graph?: KnowledgeGraph; dynamic?: boolean; measurement?: LayoutMeasurement; active?: boolean;
};
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function GraphCanvas({ ids, edges, width, height, selected, request, newOwner, onSelect, initialCamera, onCameraChange, graph = baseGraph, dynamic = false, measurement, active = true }: Props) {
  const theme = useThemeColors();
  const reduced = useReducedMotion();
  const { positions: basePositions, drag, wake } = useGraphLayout(graph, { ids, edges }, dynamic, reduced !== false, measurement);
  const touching = useSharedValue(false);
  const grabbed = useSharedValue('');
  const offset = useSharedValue({ x: 0, y: 0 });
  const manipulated = useSharedValue(false);
  const initial = initialCamera ?? fitCamera(ids, width, height, graph);
  const x = useSharedValue(initial.x), y = useSharedValue(initial.y), scale = useSharedValue(initial.scale);
  const labelSizes = useSharedValue<Record<string, { width: number; height: number }>>({});
  const peripheral = useZoomDetail(scale, 0.65, 0.5);
  const relations = useZoomDetail(scale, 1.1, 0.9);
  const relatedIds = useMemo(() => Object.fromEntries(edges.flatMap(edge => edge.id === selected || edge.sourceId === selected || edge.targetId === selected ? [[edge.sourceId, true], [edge.targetId, true]] : [])), [edges, selected]);
  const [rendered, setRendered] = useState<Record<string, number>>(() => viewportNodes(ids, graph.positions, initial, width, height, {}));
  const renderedIds = useSharedValue(Object.keys(rendered));
  const pinching = useSharedValue(false);
  const frozen = useMemo(() => frozenNodes(selected, edges), [selected, edges]);
  const positions = useLivingPositions({ base: basePositions, drag, renderedIds, frozen, touching, pinching, cameraX: x, cameraY: y, scale, active: active && reduced === false });
  useEffect(() => {
    function refresh() {
      const next = viewportNodes(ids, basePositions.get(), { x: x.get(), y: y.get(), scale: scale.get() }, width, height, { ...relatedIds, [selected]: true });
      setRendered(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
      renderedIds.set(Object.keys(next));
    }
    refresh();
    const timer = setInterval(refresh, 120);
    return () => clearInterval(timer);
  }, [ids, basePositions, x, y, scale, width, height, relatedIds, selected, renderedIds]);
  const renderedEdges = edges.filter(edge => rendered[edge.sourceId] && rendered[edge.targetId]);
  const labelOrder = useMemo(() => ids.map(id => {
    const main = graph.nodes[id].kind === 'knowledge', related = !!relatedIds[id] || id === selected;
    return { id, main, related, priority: id === selected ? 0 : related ? 1 : main ? 3 : 4 };
  }).sort((a, b) => a.priority - b.priority), [ids, selected, relatedIds, graph]);
  const visibility = useDerivedValue(() => {
    const boxes: (LabelBox & { priority: number })[] = [], points = positions.value, sizes = labelSizes.value;
    const z = scale.value, cx = x.value, cy = y.value;
    for (const { id, main, related, priority } of labelOrder) {
      if (selected && !related) continue;
      if (z < 0.35 && !related && ids.length > 30) continue;
      if (!main && !related && (selected || !peripheral.value)) continue;
      const size = sizes[id] ?? { width: 180, height: 32 };
      boxes.push({ id, priority, x: cx + points[id].x * z - size.width / 2, y: cy + points[id].y * z + 41, ...size });
    }
    for (const edge of edges) {
      const related = edge.id === selected || edge.sourceId === selected || edge.targetId === selected;
      if (!related && (selected || !relations.value)) continue;
      const a = points[edge.sourceId], b = points[edge.targetId];
      const size = sizes[edge.id] ?? { width: 130, height: 22 };
      const box = { id: edge.id, priority: edge.id === selected ? 0 : related ? 2 : 5, x: cx + (a.x + b.x) / 2 * z - 65, y: cy + (a.y + b.y) / 2 * z - 12, ...size };
      boxes.push(box);
    }
    return visibleLabels(boxes.sort((a, b) => a.priority - b.priority), width, height);
  });
  const pinchedThisPan = useSharedValue(false);
  const rebasePan = useSharedValue(false);
  const lastFocal = useSharedValue({ x: 0, y: 0 });
  const previousSize = useRef({ width, height });
  const previousRequest = useRef<CameraRequest | null>(null);
  useEffect(() => {
    if (!onCameraChange) return;
    const report = () => onCameraChange({ x: x.get(), y: y.get(), scale: scale.get() });
    const timer = setInterval(report, 700);
    return () => { clearInterval(timer); report(); };
  }, [onCameraChange, x, y, scale]);

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
      const resized = previousSize.current.width !== width || previousSize.current.height !== height;
      if (request === previousRequest.current) {
        if (resized) move({ x: x.get() + (width - previousSize.current.width) / 2, y: y.get() + (height - previousSize.current.height) / 2, scale: scale.get() });
        previousSize.current = { width, height };
        return;
      }
      previousSize.current = { width, height };
      previousRequest.current = request;
      if (!request || request.kind === 'fit') move(fitCamera(ids, width, height, currentGraph));
      else if (request.kind === 'focus' && request.id) move(focusCamera(request.id, width, height, currentGraph));
      else if (request.kind === 'in' || request.kind === 'out') move(zoomAt({ x: x.value, y: y.value, scale: scale.value }, width / 2, height / 2, scale.value * (request.kind === 'in' ? 1.6 : 1 / 1.6)));
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
      pinchedThisPan.set(pinching.value);
      cancelAnimation(x); cancelAnimation(y); cancelAnimation(scale);
      manipulated.set(false); grabbed.set('');
      if (event.numberOfPointers === 1) rebasePan.set(false);
      if (dynamic && event.numberOfPointers === 1) {
        const wx = (event.x - x.value) / scale.value, wy = (event.y - y.value) / scale.value;
        let nearest = Infinity;
        for (const id of renderedIds.value) {
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
      if (event.canceled || pinchedThisPan.value || pinching.value || rebasePan.value || reduced !== false) return;
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
      pinchedThisPan.set(true);
      rebasePan.set(true);
      lastFocal.set({ x: event.focalX, y: event.focalY });
    },
    onUpdate: (event) => {
      // Lifting a finger can move the reported focal point to the remaining finger.
      if (event.numberOfPointers < 2) return;
      const nextScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale.value * event.scaleChange));
      const ratio = nextScale / scale.value;
      x.set(event.focalX - (lastFocal.value.x - x.value) * ratio);
      y.set(event.focalY - (lastFocal.value.y - y.value) * ratio);
      scale.set(nextScale);
      lastFocal.set({ x: event.focalX, y: event.focalY });
    },
    onFinalize: () => { pinching.set(false); rebasePan.set(true); },
  });
  const tap = useTapGesture({
    maxDistance: 8,
    onDeactivate: (event) => {
      if (event.canceled || manipulated.value || pinching.value) return;
      const wx = (event.x - x.value) / scale.value, wy = (event.y - y.value) / scale.value;
      let closest = '', nearest = Infinity;
      for (const id of renderedIds.value) {
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
  return <GestureDetector gesture={gesture}>
    <View testID="atlas-canvas" style={StyleSheet.absoluteFill}>
      <Svg pointerEvents="none" width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs><Pattern id="atlas-dots" width="26" height="26" patternUnits="userSpaceOnUse"><Circle cx="1" cy="1" r="1" fill={theme.dot} opacity="0.55" /></Pattern></Defs>
        <Rect width="100%" height="100%" fill="url(#atlas-dots)" />
        {(['normal', 'connected', 'selected'] as const).map(kind => <Connections key={kind} kind={kind} edges={edges} graph={graph} positions={positions} cameraX={x} cameraY={y} scale={scale} selected={selected} width={width} height={height} />)}
      </Svg>
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {renderedEdges.map((edge) => <EdgeLabel key={edge.id} edge={edge} positions={positions} cameraX={x} cameraY={y} scale={scale} visibility={visibility} labelSizes={labelSizes} />)}
        {Object.keys(rendered).filter(id => ids.includes(id)).map((id) => <AtlasNode dimmed={!!selected && id !== selected && !relatedIds[id]} connected={!!relatedIds[id]} count={rendered[id]} key={id} id={id} graph={graph} positions={positions} selected={id === selected} visibility={visibility} labelSizes={labelSizes} cameraX={x} cameraY={y} scale={scale} appear={newOwner === id} reduced={reduced !== false} onSelect={onSelect} />)}
      </View>
    </View>
  </GestureDetector>;
}
function Connections({ kind, edges, graph, positions, cameraX, cameraY, scale, selected, width, height }: { kind: 'normal' | 'connected' | 'selected'; edges: Relation[]; graph: KnowledgeGraph; positions: SharedValue<Record<string, Position>>; cameraX: SharedValue<number>; cameraY: SharedValue<number>; scale: SharedValue<number>; selected: string; width: number; height: number }) {
  const theme = useThemeColors();
  const animated = useAnimatedProps(() => {
    let d = '';
    const points = positions.value, z = scale.value, cx = cameraX.value, cy = cameraY.value;
    for (const edge of edges) {
      const category = edge.id === selected ? 'selected' : edge.sourceId === selected || edge.targetId === selected ? 'connected' : 'normal';
      if (category !== kind) continue;
      const a = points[edge.sourceId], b = points[edge.targetId];
      const ax = cx + a.x * z, ay = cy + a.y * z, bx = cx + b.x * z, by = cy + b.y * z;
      if (!lineInViewport(ax, ay, bx, by, width, height)) continue;
      // Overview suppresses unselected lines; points and counts show the distribution.
      if (kind === 'normal' && z < 0.35 && edges.length > 60) continue;
      d += `M ${ax} ${ay} L ${bx} ${by} `;
    }
    return { d, strokeWidth: kind === 'selected' ? 2.8 : kind === 'connected' ? 2.2 : 1 + Math.min(1, Math.max(0, (z - 0.12) / 0.6)) * 0.6, strokeOpacity: kind !== 'normal' ? 1 : selected ? 0.18 : 0.38 + Math.min(1, Math.max(0, (z - 0.12) / 0.6)) * 0.37 };
  });
  const edge = edges.find(edge => edge.id === selected);
  const color = graph.nodes[selected]?.color ?? (edge && graph.nodes[edge.sourceId]?.color) ?? theme.edge;
  return <AnimatedPath animatedProps={animated} stroke={kind === 'normal' ? theme.edge : color} fill="none" strokeLinecap="round" />;
}
function AtlasNode({ dimmed, connected, count, id, graph, positions, selected, visibility, labelSizes, cameraX, cameraY, scale, appear, reduced, onSelect }: LabelState & { cameraX: SharedValue<number>; cameraY: SharedValue<number>; positions: SharedValue<Record<string, Position>>; graph: KnowledgeGraph; dimmed: boolean; connected: boolean; count: number; id: string; selected: boolean; scale: SharedValue<number>; appear: boolean; reduced: boolean; onSelect: (id: string) => void }) {
  const theme = useThemeColors();
  const {t}=useI18n();
  const look = graph.nodes[id], main = look.kind === 'knowledge';
  const emergence = useSharedValue(appear && !reduced ? 0 : 1);
  useEffect(() => { if (appear && !reduced) { emergence.set(0); emergence.set(withTiming(1, { duration: 150 })); } else if (reduced) emergence.set(1); }, [emergence, reduced, appear]);
  const node = useAnimatedStyle(() => ({ opacity: emergence.value * (dimmed ? 0.25 : 1), transform: [{ translateX: cameraX.get() + positions.get()[id].x * scale.get() }, { translateY: cameraY.get() + positions.get()[id].y * scale.get() }] }));
  const label = useAnimatedStyle(() => ({ opacity: visibility.value[id] ? 1 : 0 }));
  const orbSize = useAnimatedStyle(() => { const size = (main ? 64 : 28) * Math.min(1, 2.1 * scale.get()); return { width: size, height: size }; });
  const markSize = useAnimatedStyle(() => ({ fontSize: 30 * Math.min(1, 2.1 * scale.get()) }));
  return <Animated.View style={[atlas.nodeAnchor, { left: -90, top: -32 }, node]}>
    <Pressable accessibilityRole="button" accessibilityLabel={t(`${graph.nodes[id].name}、${main ? '開封済み教材' : '周辺語'}`)} accessibilityState={{ selected }} onAccessibilityTap={() => onSelect(id)} accessibilityActions={[{ name: 'activate' }]} onAccessibilityAction={(event) => { if (event.nativeEvent.actionName === 'activate') onSelect(id); }} style={{ alignItems: 'center', gap: 9, width: 180, minHeight: 80 }}>
      <View style={atlas.orbSlot}><Animated.View style={[atlas.orb, { width: main ? 64 : 28, height: main ? 64 : 28, borderRadius: 40, backgroundColor: main ? look.color : theme.surface, borderColor: look.color, borderWidth: main ? 0 : 2 }, (selected || connected) && { outlineWidth: selected ? 3 : 2, outlineColor: look.color, outlineOffset: 6 }, orbSize]}>
        {main && <Animated.Text accessible={false} style={[{ color: knowledgeColors.onNode }, markSize]}>{look.mark}</Animated.Text>}
        {!main && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: look.color }} />}
      </Animated.View></View>
      {count > 1 && <Text style={{ color: theme.text, backgroundColor: theme.surface, fontSize: 12 }}>{count}点</Text>}
      <Animated.View testID={`atlas-label-${id}`} pointerEvents="none" onLayout={event => { const { width, height } = event.nativeEvent.layout; labelSizes.set(previous => ({ ...previous, [id]: { width, height } })); }} style={[atlas.label, { backgroundColor: theme.surface }, label]}><Text style={{ fontSize: main ? 15 : 12, lineHeight: main ? 22 : 19, fontWeight: main ? '700' : '500', color: theme.text, textAlign: 'center' }}>{graph.nodes[id].name}</Text></Animated.View>
    </Pressable>
  </Animated.View>;
}
type LabelState = { visibility: SharedValue<Record<string, boolean>>; labelSizes: SharedValue<Record<string, { width: number; height: number }>> };
function EdgeLabel({ edge, positions, cameraX, cameraY, scale, visibility, labelSizes }: LabelState & { cameraX: SharedValue<number>; cameraY: SharedValue<number>; positions: SharedValue<Record<string, Position>>; edge: Relation; scale: SharedValue<number>; }) {
  const theme = useThemeColors();
  const style = useAnimatedStyle(() => {
    const a = positions.value[edge.sourceId], b = positions.value[edge.targetId];
    return { opacity: visibility.value[edge.id] ? 1 : 0, transform: [{ translateX: cameraX.value + (a.x + b.x) / 2 * scale.value }, { translateY: cameraY.value + (a.y + b.y) / 2 * scale.value }] };
  });
  return <Animated.View testID={`atlas-label-${edge.id}`} pointerEvents="none" onLayout={event => { const { width, height } = event.nativeEvent.layout; labelSizes.set(previous => ({ ...previous, [edge.id]: { width, height } })); }} style={[atlas.edgeLabel, { backgroundColor: theme.surface, left: -65, top: -12 }, style]}><Text style={{ color: theme.secondaryText, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>{edge.label}</Text></Animated.View>;
}
// Separate show/hide thresholds keep labels stable near a zoom boundary.
function useZoomDetail(scale: SharedValue<number>, show: number, hide: number) {
  const visible = useSharedValue(false);
  useAnimatedReaction(() => scale.get() >= show ? 1 : scale.get() <= hide ? 0 : -1,
    (next) => { if (next !== -1) visible.set(next === 1); }, [show, hide]);
  return visible;
}
const atlas = StyleSheet.create({
  orbSlot: { height: 64, justifyContent: 'center', alignItems: 'center' },
  nodeAnchor: { position: 'absolute', width: 180, alignItems: 'center', transformOrigin: '90px 32px' },
  orb: { alignItems: 'center', justifyContent: 'center' },
  label: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, maxWidth: 180 },
  edgeLabel: { position: 'absolute', width: 130, padding: 3, borderRadius: 8 },
});
