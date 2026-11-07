import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Link, router } from 'expo-router';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation, KnowledgeGraph } from '../knowledge/model';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { Action, colors, styles } from './ui';
export function MapSheet({ selected, height, onSelect, onClose, graph = baseGraph, edges, acquiredIds, demo = false }: { graph?: KnowledgeGraph; edges: GraphRelation[]; acquiredIds: string[]; demo?: boolean; selected: string; height: number; onSelect: (id: string) => void; onClose: () => void }) {
  const reduced = useReducedMotion();
  const sheetHeight = Math.min(height * 0.78, 640), peek = Math.min(265, height * 0.4), collapsed = sheetHeight - peek;
  const offset = useSharedValue(sheetHeight + 40), start = useSharedValue(0);
  const edge = edges.find((item) => item.id === selected), node = graph.nodes[selected];
  const acquired = acquiredIds.includes(selected);
  const reference = edge?.evidence ?? node?.evidence ?? [];
  const connected = edges.filter((item) => item.sourceId === selected || item.targetId === selected);
  const conceptName = (id: string) => graph.nodes[id]?.name ?? '';
  useEffect(() => { offset.set(withTiming(collapsed, { duration: reduced === false ? 320 : 0 })); }, [selected, collapsed, offset, reduced]);
  const drag = usePanGesture({
    onActivate: () => { cancelAnimation(offset); start.set(offset.value); },
    onUpdate: (event) => { offset.set(Math.max(0, Math.min(sheetHeight + 30, start.value + event.translationY))); },
    onDeactivate: (event) => {
      if (event.canceled) { offset.set(withTiming(collapsed, { duration: 150 })); return; }
      if (offset.value > collapsed + peek * 0.35 || event.velocityY > 1000) {
        offset.set(withTiming(sheetHeight + 40, { duration: reduced === false ? 200 : 0 }, (finished) => { if (finished) scheduleOnRN(onClose); }));
      } else { offset.set(withSpring(offset.value < collapsed * 0.6 ? 0 : collapsed, { damping: 25, stiffness: 220 })); }
    },
  });
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return <Animated.View testID="map-sheet" style={[sheet.container, { height: sheetHeight }, animated]}>
    <GestureDetector gesture={drag}><View style={sheet.handleArea} accessible accessibilityRole="adjustable" accessibilityLabel="詳細シート。上に引くと展開、下に引くと閉じる" accessibilityActions={[{ name: 'increment', label: '展開' }, { name: 'decrement', label: '縮小' }]} onAccessibilityAction={(event) => { offset.set(withTiming(event.nativeEvent.actionName === 'increment' ? 0 : collapsed, { duration: 0 })); }}><View style={sheet.handle} /></View></GestureDetector>
    <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 38, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={styles.eyebrow}>{edge ? 'つながりの理由' : acquired ? `${node.category} · 取得済み` : '未取得の周辺概念'}</Text><Pressable accessibilityRole="button" accessibilityLabel="詳細を閉じる" hitSlop={8} onPress={onClose} style={sheet.smallButton}><Text style={{ color: colors.ink, fontSize: 22 }}>×</Text></Pressable></View>
      <Text accessibilityRole="header" style={styles.heading}>{edge ? `${conceptName(edge.sourceId)} → ${conceptName(edge.targetId)}` : conceptName(selected)}</Text>
      {acquired && !demo && <Action title="解説を読む →" onPress={() => router.push({ pathname: '/word/[id]', params: { id: selected } })} />}
      {edge && <Text style={styles.small}>{edge.label}</Text>}
      <Text selectable style={styles.body}>{edge?.explanation ?? node?.summary}</Text>
      <Pressable accessibilityRole="button" onPress={() => { offset.set(withTiming(0, { duration: reduced === false ? 300 : 0 })); }}><Text style={[styles.small, { textDecorationLine: 'underline', paddingVertical: 8 }]}>詳しく見る ↑</Text></Pressable>
      {edge && <><Action title={conceptName(edge.sourceId)} secondary onPress={() => onSelect(edge.sourceId)} /><Action title={conceptName(edge.targetId)} secondary onPress={() => onSelect(edge.targetId)} /></>}
      {connected.map((item) => <Action key={item.id} title={`つながり：${item.label}`} secondary onPress={() => onSelect(item.id)} />)}
      {demo && acquired && node?.detail && <Text selectable style={styles.body}>{node.detail}</Text>}
      {demo && <Text style={styles.small}>{(edge?.provenance ?? node?.provenance) === 'fixture' ? '架空の検証用データ · 学習内容ではありません' : '出典確認済みのデモ原稿 · 公開前の校閲は未実施'}</Text>}
      {reference.map((item) => <Link key={item.url} href={item.url} style={styles.small}>{item.title} ↗</Link>)}
      <Text style={styles.small}>試作用原稿 · 周辺語の閲覧は回数を消費しません。</Text>
    </ScrollView>
  </Animated.View>;
}
const sheet = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.card, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderWidth: 1, borderColor: '#DDDCCF', overflow: 'hidden' },
  handleArea: { height: 32, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 38, height: 4, borderRadius: 3, backgroundColor: '#CCCFC3' },
  smallButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
