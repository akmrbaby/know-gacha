import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { conceptName, ownerOf, positions, specimens, type Relation } from '../data/graph';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { findKeyword } from '../data/keywords';
import { colors, styles } from './ui';

type Camera = { x: number; y: number; scale: number };
const clamp = (scale: number) => Math.min(1.5, Math.max(0.75, scale));
const distance = (event: GestureResponderEvent) => {
  const [a, b] = event.nativeEvent.touches;
  return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
};
export function GraphCanvas({ ids, edges, focusId, selected, onSelect }: { ids: string[]; edges: Relation[]; focusId: string; selected: string; onSelect: (id: string) => void }) {
  const reduced = useReducedMotion();
  const [opacity] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) { opacity.setValue(1); return; }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [reduced, opacity]);
  const [width, setWidth] = useState(320);
  const [camera, setCamera] = useState<Camera>({ ...positions[focusId], scale: 0.75 });
  const cameraRef = useRef(camera);
  const start = useRef({ camera, distance: 0, dx: 0, dy: 0 });
  const update = (next: Camera) => { cameraRef.current = next; setCamera(next); };
  // PanResponder stores callbacks; their ref reads happen during gestures, never during render.
  // eslint-disable-next-line react-hooks/refs
  const [responder] = useState(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (event, gesture) => event.nativeEvent.touches.length > 1 || Math.abs(gesture.dx) + Math.abs(gesture.dy) > 8,
    onPanResponderGrant: (event, gesture) => { start.current = { camera: cameraRef.current, distance: distance(event), dx: gesture.dx, dy: gesture.dy }; },
    onPanResponderMove: (event, gesture) => {
      const d = distance(event);
      if (d > 0) {
        if (!start.current.distance) start.current = { camera: cameraRef.current, distance: d, dx: gesture.dx, dy: gesture.dy };
        update({ ...start.current.camera, scale: clamp(start.current.camera.scale * d / start.current.distance) });
      } else {
        if (start.current.distance) start.current = { camera: cameraRef.current, distance: 0, dx: gesture.dx, dy: gesture.dy };
        update({ ...start.current.camera, x: start.current.camera.x - (gesture.dx - start.current.dx) / start.current.camera.scale, y: start.current.camera.y - (gesture.dy - start.current.dy) / Math.max(0.65, start.current.camera.scale) });
      }
    },
    onPanResponderTerminationRequest: () => true,
  }));
  const point = (id: string) => ({ x: width / 2 + (positions[id].x - camera.x) * camera.scale, y: 50 + (positions[id].y - camera.y) * Math.max(0.65, camera.scale) });
  function center(id: string) { update({ ...positions[id], scale: 0.75 }); }
  function overview() {
    const xs = ids.map((id) => positions[id].x);
    update({ x: (Math.min(...xs) + Math.max(...xs)) / 2, y: 0, scale: Math.min(0.75, (width - 80) / (Math.max(...xs) - Math.min(...xs) + 80)) });
  }
  return <View style={{ gap: 10 }}>
    <Animated.View style={[map.canvas, { opacity }]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)} {...responder.panHandlers}>
      <View accessible={false} pointerEvents="none" style={map.grid} />
      {edges.map((edge) => {
        const a = point(edge.sourceId), b = point(edge.targetId);
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        return <View key={edge.id}>
          <Pressable accessibilityRole="button" accessibilityLabel={`${conceptName(edge.sourceId)}から${conceptName(edge.targetId)}、${edge.label}`} onPress={() => onSelect(edge.id)} style={{ position: 'absolute', left: (a.x + b.x) / 2 - length / 2, top: (a.y + b.y) / 2 - 14, width: length, height: 28, justifyContent: 'center', transform: [{ rotate: `${angle}deg` }] }}>
            <View style={{ height: selected === edge.id ? 3 : 1.5, backgroundColor: selected === edge.id ? colors.accent : '#A6B6A8' }} /><Text accessible={false} style={{ position: 'absolute', right: length * 0.3, color: colors.ink }}>▸</Text>
          </Pressable>
          {camera.scale >= 0.5 && <Pressable accessibilityRole="button" accessibilityLabel={edge.label} onPress={() => onSelect(edge.id)} style={{ position: 'absolute', left: (a.x + b.x) / 2 - 36, top: (a.y + b.y) / 2 - 22, width: 72, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}><Text style={map.edgeLabel}>{edge.label}</Text></Pressable>}
        </View>;
      })}
      {ids.map((id) => {
        const p = point(id), main = findKeyword(id), look = specimens[ownerOf(id)!];
        const compact = camera.scale < 0.5;
        const nodeWidth = compact ? (main ? 64 : 24) : Math.min(152, (width - 32) / 2);
        return <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: selected === id }} accessibilityLabel={`${conceptName(id)}、${main ? '開封済み教材' : '周辺語'}`} onPress={() => { onSelect(id); if (compact) center(id); }} style={[map.node, { width: nodeWidth, minHeight: compact ? 44 : 84, padding: compact ? 3 : 10, left: p.x - nodeWidth / 2, top: p.y - (compact ? 22 : 42), borderColor: selected === id ? colors.accent : look.color, borderWidth: selected === id ? 3 : 1, backgroundColor: main ? look.tint : colors.card }]}>
          {!compact && <Text style={{ fontSize: 10, color: look.color }}>{selected === id ? '選択中 · ' : ''}{main ? `${look.mark} 開封済み` : '周辺語'}</Text>}
          <Text style={{ fontSize: compact ? 10 : 14, lineHeight: compact ? 15 : 21, color: colors.ink, fontWeight: '600', textAlign: 'center' }}>{compact && !main ? '○' : conceptName(id)}</Text>
        </Pressable>;
      })}
    </Animated.View>
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <Control title="−" label="地図を縮小" onPress={() => update({ ...cameraRef.current, scale: clamp(cameraRef.current.scale - 0.15) })} />
      <Control title="＋" label="地図を拡大" onPress={() => update({ ...cameraRef.current, scale: clamp(cameraRef.current.scale + 0.15) })} />
      <Control title="全体" onPress={overview} />
      <Control title="選択に戻る" onPress={() => center(positions[selected] ? selected : edges.find((edge) => edge.id === selected)?.ownerId ?? focusId)} />
    </View>
    <Text style={[styles.small, { fontSize: 11, lineHeight: 18 }]}>ドラッグ・ピンチで移動と拡縮。全体では表示を簡略化。{ '\n' }地図の距離は意味の近さを表しません。</Text>
  </View>;
}
const map = StyleSheet.create({
  canvas: { height: 260, borderWidth: 1, borderColor: colors.line, borderRadius: 18, overflow: 'hidden', backgroundColor: '#EEEEE2' },
  grid: { position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, backgroundColor: '#E1E3D6' },
  node: { position: 'absolute', width: 152, minHeight: 84, borderRadius: 16, padding: 10, gap: 4, alignItems: 'center', justifyContent: 'center' },
  edgeLabel: { fontSize: 10, lineHeight: 15, textAlign: 'center', color: colors.muted, backgroundColor: '#EEEEE2', padding: 3, borderRadius: 4 },
});

function Control({ title, label, onPress }: { title: string; label?: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} onPress={onPress} style={({ pressed }) => ({ flex: 1, minHeight: 44, paddingHorizontal: 5, borderRadius: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}><Text style={{ fontSize: 12, color: colors.ink }}>{title}</Text></Pressable>;
}
