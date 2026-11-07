import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GraphCanvas, type CameraRequest } from '../../components/GraphCanvas';
import { MapSheet } from '../../components/MapSheet';
import { Action, colors, styles } from '../../components/ui';
import { conceptName, ownerOf, relations, visibleGraph } from '../../data/graph';
import { findKeyword } from '../../data/keywords';
import { useProgress } from '../../state/ProgressProvider';
const sessionStarted = Date.now();
export default function GraphScreen() {
  const { progress, ready, error } = useProgress();
  const { focus, fresh } = useLocalSearchParams<{ focus?: string; fresh?: string }>();
  const graph = visibleGraph(progress.openings.map((item) => item.keywordId));
  const [size, setSize] = useState({ width: 390, height: 700 });
  const [selected, setSelected] = useState('');
  const [list, setList] = useState(false);
  const [request, setRequest] = useState<CameraRequest | null>(null);
  const consumed = useRef('');
  const insets = useSafeAreaInsets();
  const latest = progress.openings.at(-1);
  const newOwner = latest && Date.parse(latest.openedAt) >= sessionStarted ? latest.keywordId : undefined;
  const requested = typeof focus === 'string' ? focus : '';
  const requestKey = `${requested}:${fresh ?? ''}`;
  function choose(id: string) {
    setList(false);
    setSelected(id);
    if (id) setRequest({ id: relations.find((edge) => edge.id === id)?.ownerId ?? id, kind: 'focus', token: Date.now() });
  }
  useEffect(() => {
    if (!ready || !requested || consumed.current === requestKey || !(graph.ids.includes(requested) || graph.edges.some((edge) => edge.id === requested))) return;
    // Navigation is an external request; defer the selection until this frame is mounted.
    const frame = requestAnimationFrame(() => { consumed.current = requestKey; choose(requested); });
    return () => cancelAnimationFrame(frame);
    // Ordinary tab changes and camera interactions preserve the viewport.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, requestKey, graph.ids.join('|')]);
  const validSelected = graph.ids.includes(selected) || graph.edges.some((edge) => edge.id === selected) ? selected : '';
  return <View style={map.screen} onLayout={(event) => setSize(event.nativeEvent.layout)}>
    {ready && graph.ids.length > 0 && <GraphCanvas ids={graph.ids} edges={graph.edges} width={size.width} height={size.height} selected={validSelected} request={request} newOwner={newOwner} onSelect={choose} />}
    <View pointerEvents="box-none" style={[map.top, { top: insets.top + 16 }]}>
      <View pointerEvents="none"><Text style={map.title}>Map<Text style={{ color: colors.accent }}>.</Text></Text><Text style={styles.small}>知識が、つながる。 · {progress.openings.length}語</Text></View>
      {graph.ids.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="知識の一覧を開く" onPress={() => setList(true)} style={map.pill}><Text style={map.pillText}>☷  一覧</Text></Pressable>}
    </View>
    {!graph.ids.length && <View style={map.empty}><Text style={{ fontSize: 52, color: '#93A697' }}>◇</Text><Text style={styles.heading}>{!ready ? '地図を準備しています…' : 'まだ知らない世界へ。'}</Text><Text style={[styles.body, { textAlign: 'center' }]}>{error && !ready ? error : 'Gachaで出会った知識が、\nここに小さな地図をつくります。'}</Text><Action title="Gachaへ" onPress={() => router.navigate('/')} /></View>}
    {graph.ids.length > 0 && !validSelected && <View pointerEvents="box-none" style={map.bottom}>
      <Text pointerEvents="none" style={map.hint}>広げて、たどって、気になる言葉へ。</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
        {(['out', 'in', 'fit'] as const).map((kind) => <Pressable key={kind} accessibilityRole="button" accessibilityLabel={kind === 'in' ? '地図を拡大' : kind === 'out' ? '地図を縮小' : '地図全体を表示'} onPress={() => setRequest({ kind, token: Date.now() })} style={map.pill}><Text style={map.pillText}>{kind === 'in' ? '＋' : kind === 'out' ? '−' : '↗ 全体'}</Text></Pressable>)}
      </View>
    </View>}
    {!!validSelected && <MapSheet selected={validSelected} height={size.height} onSelect={choose} onClose={() => setSelected('')} />}
    <Modal visible={list} transparent animationType="fade" onRequestClose={() => setList(false)}>
      <SafeAreaView style={map.scrim}><View style={map.list}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}><Text style={styles.heading}>出会った知識</Text><Pressable accessibilityRole="button" accessibilityLabel="一覧を閉じる" style={map.pill} onPress={() => setList(false)}><Text style={map.pillText}>×</Text></Pressable></View>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 16 }}>
          {graph.ids.filter((id) => findKeyword(id)).map((id) => <View key={id} style={map.listGroup}><Action title={`${conceptName(id)} · 開封済み`} onPress={() => choose(id)} />{graph.edges.filter((edge) => edge.ownerId === id).map((edge) => <View key={edge.id} style={{ gap: 8 }}><Text style={styles.small}>{conceptName(edge.sourceId)} → {conceptName(edge.targetId)}</Text><Action title={`${conceptName(edge.sourceId === id ? edge.targetId : edge.sourceId)} · 周辺語`} secondary onPress={() => choose(edge.sourceId === id ? edge.targetId : edge.sourceId)} /><Action title={`関係：${edge.label}`} secondary onPress={() => choose(edge.id)} /></View>)}</View>)}
          <Text style={styles.small}>周辺語・関係は試作用原稿です。配置の距離は意味の近さを表しません。</Text>
        </ScrollView>
      </View></SafeAreaView>
    </Modal>
  </View>;
}
const map = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F3EB', overflow: 'hidden' },
  top: { position: 'absolute', left: 24, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '800', color: colors.ink, letterSpacing: -1.5 },
  pill: { minHeight: 46, minWidth: 46, paddingHorizontal: 16, borderRadius: 24, backgroundColor: '#FFFEF6', borderWidth: 1, borderColor: '#DCE2D7', alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 14, fontWeight: '600', color: colors.ink },
  bottom: { position: 'absolute', left: 20, right: 20, bottom: 18, gap: 14 },
  hint: { textAlign: 'center', fontSize: 12, color: '#677A6A', letterSpacing: 1 },
  empty: { position: 'absolute', left: 32, right: 32, top: '34%', gap: 20, alignItems: 'center' },
  scrim: { flex: 1, padding: 16, backgroundColor: '#18362C55', justifyContent: 'center' },
  list: { maxHeight: '94%', backgroundColor: colors.card, borderRadius: 26, overflow: 'hidden' },
  listGroup: { gap: 14, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: colors.line },
});
