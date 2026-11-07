import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures, useTapGesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedProps, useAnimatedReaction, useAnimatedStyle, useSharedValue, withDecay, withDelay, withSpring, withTiming, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation as Relation, KnowledgeGraph } from '../knowledge/model';
import { fitCamera, focusCamera, MAX_SCALE, MIN_SCALE, WORLD_CENTER, WORLD_SIZE, zoomAt, type Camera } from '../graph/camera';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors } from './ui';

export type CameraRequest = { id?: string; kind: 'focus' | 'fit' | 'in' | 'out'; token: number };
type Props = {
  ids: string[]; edges: Relation[]; width: number; height: number;
  selected: string; request: CameraRequest | null; newOwner?: string;
  onSelect: (id: string) => void; graph?: KnowledgeGraph;
};
const AnimatedPath = Animated.createAnimatedComponent(Path);
export function GraphCanvas({ ids, edges, width, height, selected, request, newOwner, onSelect, graph = baseGraph }: Props) {
  const { positions } = graph;
  const worldSize = graph === baseGraph ? 2400 : WORLD_SIZE;
  const worldCenter = worldSize / 2;
  const reduced = useReducedMotion();
  const initial = fitCamera(ids, width, height, graph);
  const x = useSharedValue(initial.x), y = useSharedValue(initial.y), scale = useSharedValue(initial.scale);
  const pinching = useSharedValue(false);
  const rebasePan = useSharedValue(false);
  const lastFocal = useSharedValue({ x: 0, y: 0 });
  const nodeHits = ids.map((id) => ({ id, ...positions[id] }));
  const lineHits = edges.map((edge) => ({ id: edge.id, a: positions[edge.sourceId], b: positions[edge.targetId] }));
  function move(camera: Camera) {
    const duration = reduced === false ? 480 : 0;
    x.set(withTiming(camera.x, { duration }));
    y.set(withTiming(camera.y, { duration }));
    scale.set(withTiming(camera.scale, { duration }));
  }
  useEffect(() => {
    if (!request || request.kind === 'fit') move(fitCamera(ids, width, height, graph));
    else if (request.kind === 'focus' && request.id) move(focusCamera(request.id, width, height, graph));
    else if (request.kind === 'in' || request.kind === 'out') move(zoomAt({ x: x.value, y: y.value, scale: scale.value }, width / 2, height / 2, scale.value * (request.kind === 'in' ? 1.25 : 0.8)));
    // A camera request is an explicit event. Ordinary selection/state renders must not reset the viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, width, height]);

  const pan = usePanGesture({
    minDistance: 5, averageTouches: true,
    onBegin: () => { cancelAnimation(x); cancelAnimation(y); cancelAnimation(scale); },
    onUpdate: (event) => {
      if (pinching.value || event.numberOfPointers > 1) { rebasePan.set(true); return; }
      if (rebasePan.value) { rebasePan.set(false); return; }
      x.set(x.value + event.changeX);
      y.set(y.value + event.changeY);
    },
    onDeactivate: (event) => {
      if (event.canceled || pinching.value || rebasePan.value || reduced !== false) return;
      x.set(withDecay({ velocity: event.velocityX, clamp: [-2500, 2500] }));
      y.set(withDecay({ velocity: event.velocityY, clamp: [-2500, 2500] }));
    },
  });
  const pinch = usePinchGesture({
    onActivate: (event) => {
      cancelAnimation(x); cancelAnimation(y); cancelAnimation(scale);
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
      if (event.canceled) return;
      const wx = (event.x - x.value) / scale.value, wy = (event.y - y.value) / scale.value;
      let closest = '', nearest = Infinity;
      for (const node of nodeHits) {
        const distance = Math.hypot(wx - node.x, wy - node.y);
        if (distance < Math.max(48, 26 / scale.value) && distance < nearest) { closest = node.id; nearest = distance; }
      }
      if (!closest) {
        for (const line of lineHits) {
          const dx = line.b.x - line.a.x, dy = line.b.y - line.a.y;
          const t = Math.max(0, Math.min(1, ((wx - line.a.x) * dx + (wy - line.a.y) * dy) / (dx * dx + dy * dy)));
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
      </Svg>
      <Animated.View pointerEvents="box-none" style={[atlas.world, { width: worldSize, height: worldSize }, world]}>
        <Svg pointerEvents="none" width={worldSize} height={worldSize} style={StyleSheet.absoluteFill}>
          {ids.filter((id) => graph.nodes[id].kind === 'knowledge').map((id) => <Circle key={id} cx={worldCenter + positions[id].x} cy={worldCenter + positions[id].y} r={180} fill={graph.nodes[id].color} opacity={0.045} />)}
          {edges.map((edge, index) => <Connection key={edge.id} edge={edge} graph={graph} selected={selected === edge.id} appear={(newOwner === edge.sourceId || newOwner === edge.targetId)} index={index} reduced={reduced !== false} />)}
        </Svg>
        {edges.map((edge) => <EdgeLabel key={edge.id} edge={edge} graph={graph} scale={scale} selected={selected === edge.id} />)}
        {ids.map((id) => <AtlasNode key={id} id={id} graph={graph} selected={id === selected} scale={scale} appear={newOwner === id} reduced={reduced !== false} onSelect={onSelect} />)}
      </Animated.View>
    </View>
  </GestureDetector>;
}
function Connection({ edge, graph, selected, appear, index, reduced }: { graph: KnowledgeGraph; edge: Relation; selected: boolean; appear: boolean; index: number; reduced: boolean }) {
  const worldCenter = graph === baseGraph ? 1200 : WORLD_CENTER;
  const progress = useSharedValue(appear && !reduced ? 0 : 1);
  useEffect(() => { if (appear && !reduced) { progress.set(0); progress.set(withDelay(180 + index * 80, withTiming(1, { duration: 550 }))); } else if (reduced) progress.set(1); }, [progress, reduced, index, appear]);
  const a = graph.positions[edge.sourceId], b = graph.positions[edge.targetId];
  const length = Math.hypot(b.x - a.x, b.y - a.y) + 20;
  const animated = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
  const color = graph.nodes[edge.sourceId].color;
  return <AnimatedPath animatedProps={animated} d={`M ${worldCenter + a.x} ${worldCenter + a.y} Q ${worldCenter + (a.x + b.x) / 2 + 14} ${worldCenter + (a.y + b.y) / 2} ${worldCenter + b.x} ${worldCenter + b.y}`} stroke={selected ? color : '#A8BBB0'} strokeWidth={selected ? 3 : 1.5} fill="none" strokeDasharray={[length, length]} strokeLinecap="round" />;
}
function AtlasNode({ id, graph, selected, scale, appear, reduced, onSelect }: { graph: KnowledgeGraph; id: string; selected: boolean; scale: SharedValue<number>; appear: boolean; reduced: boolean; onSelect: (id: string) => void }) {
  const worldCenter = graph === baseGraph ? 1200 : WORLD_CENTER;
  const look = graph.nodes[id], main = look.kind === 'knowledge', p = graph.positions[id];
  const emergence = useSharedValue(appear && !reduced ? 0 : 1);
  useEffect(() => { if (appear && !reduced) { emergence.set(0); emergence.set(withSpring(1, { damping: 18, stiffness: 150 })); } else if (reduced) emergence.set(1); }, [emergence, reduced, appear]);
  const node = useAnimatedStyle(() => ({ opacity: emergence.value, transform: [{ scale: Math.min(2.1, 1 / scale.value) * emergence.value }] }));
  const labelOpacity = useLabelOpacity(scale, !!main, 0.65, 0.5);
  const label = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));
  return <Animated.View style={[atlas.nodeAnchor, { left: worldCenter + p.x - 90, top: worldCenter + p.y - 32 }, node]}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${graph.nodes[id].name}、${main ? '開封済み教材' : '周辺語'}`} accessibilityState={{ selected }} onPress={() => onSelect(id)} style={{ alignItems: 'center', gap: 9, width: 180, minHeight: 80 }}>
      <View style={atlas.orbSlot}><View style={[atlas.orb, { width: main ? 64 : 28, height: main ? 64 : 28, borderRadius: 40, backgroundColor: main ? look.color : colors.card, borderColor: look.color, borderWidth: main ? 0 : 2 }, selected && { outlineWidth: 3, outlineColor: look.color, outlineOffset: 6 }]}>
        {main && <Text accessible={false} style={{ color: '#FFFDF5', fontSize: 30 }}>{look.mark}</Text>}
        {!main && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: look.color }} />}
      </View></View>
      <Animated.View style={[atlas.label, label]}><Text style={{ fontSize: main ? 15 : 12, lineHeight: main ? 22 : 19, fontWeight: main ? '700' : '500', color: colors.ink, textAlign: 'center' }}>{graph.nodes[id].name}</Text></Animated.View>
    </Pressable>
  </Animated.View>;
}
function EdgeLabel({ edge, graph, scale, selected }: { graph: KnowledgeGraph; edge: Relation; scale: SharedValue<number>; selected: boolean }) {
  const worldCenter = graph === baseGraph ? 1200 : WORLD_CENTER;
  const a = graph.positions[edge.sourceId], b = graph.positions[edge.targetId];
  const opacity = useLabelOpacity(scale, selected, 1.1, 0.9);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View pointerEvents="none" style={[atlas.edgeLabel, { left: worldCenter + (a.x + b.x) / 2 - 65, top: worldCenter + (a.y + b.y) / 2 - 12 }, style]}><Text style={{ color: colors.muted, fontSize: 10, lineHeight: 16, textAlign: 'center' }}>{edge.label}</Text></Animated.View>;
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
