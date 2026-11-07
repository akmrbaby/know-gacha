import { router, Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { GraphCanvas, type CameraRequest } from '../components/GraphCanvas';
import { MapSheet } from '../components/MapSheet';
import { Action, colors, styles } from '../components/ui';
import { demoGraph, demoOrder, demoSizes, demoView } from '../knowledge/demo';
import { graphCounts, neighborhood } from '../knowledge/model';

export default function GraphDemo() {
  // No provider mutations or storage: navigating away discards this demonstration.
  const [count, setCount] = useState(5);
  const [selected, setSelected] = useState('');
  const [list, setList] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [size, setSize] = useState({ width: 390, height: 600 });
  const [request, setRequest] = useState<CameraRequest | null>(null);
  const visible = useMemo(() => demoView(count), [count]);
  const view = useMemo(() => nearby && selected ? neighborhood(visible, selected) : visible, [nearby, selected, visible]);
  const counts = graphCounts(demoGraph, visible);
  function choose(id: string) {
    setList(false); setSelected(id);
    if (id) setRequest({ kind: 'focus', id, token: (request?.token ?? 0) + 1 });
  }
  function changeCount(next: number) {
    setCount(next); setSelected(''); setNearby(false); setList(false);
    setRequest({ kind: 'fit', token: (request?.token ?? 0) + 1 });
  }
  function addNext() {
    const next = count + 1;
    setCount(next); setNearby(false);
    setSelected(''); setList(false);
  }
  if (!__DEV__) return <View style={demo.unavailable}><Text style={styles.body}>デモは開発用です。</Text><Action title="Mapへ" onPress={() => router.replace('/graph')} /></View>;
  return <View style={{ flex: 1, backgroundColor: colors.paper }}>
    <Stack.Screen options={{ title: '知識グラフ · デモ', headerBackVisible: false }} />
    <View style={demo.controls}>
      <View style={demo.row}><Text accessibilityRole="header" style={styles.heading}>デモ · {counts.acquired}件</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/graph')} style={demo.control}><Text>デモを終了</Text></Pressable></View>
      <Text style={styles.small}>取得知識 {counts.acquired} · 周辺概念 {counts.concepts} · 関係 {counts.relations}</Text>
      <Text style={styles.small}>{count <= 10 ? '出典確認済みのデモ原稿 · 公開前の校閲は未実施' : `内容確認用10件＋架空の検証用${count - 10}件 · 学習内容ではありません`}</Text>
      <Text style={styles.small}>{count <= 10 ? '動的配置の試作 · ノードをドラッグ、背景をパン／ピンチ' : '固定配置の比較デモ · 動的配置は10件の実機評価後に拡張'}</Text>
      <Text style={styles.small}>配置の距離は意味の近さや関係の強さを表しません。</Text>
      <View style={demo.row}>{demoSizes.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={`${value}件のデモ`} accessibilityState={{ selected: value === count }} onPress={() => changeCount(value)} style={[demo.control, value === count && demo.active]}><Text>{value}件</Text></Pressable>)}</View>
      <View style={demo.row}>
        <Pressable accessibilityRole="button" disabled={count >= 10} onPress={addNext} style={[demo.control, count >= 10 && { opacity: 0.4 }]}><Text>次の1件を追加</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setList(!list)} style={demo.control}><Text>{list ? 'Mapに戻る' : '一覧'}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setNearby(false); setRequest({ kind: 'fit', token: (request?.token ?? 0) + 1 }); }} style={demo.control}><Text>全体</Text></Pressable>
      </View>
      {!!selected && <Pressable accessibilityRole="button" accessibilityState={{ selected: nearby }} style={demo.control} onPress={() => { setNearby(!nearby); setRequest({ kind: 'fit', token: (request?.token ?? 0) + 1 }); }}><Text>{nearby ? '全件表示へ' : '選択した知識の周辺だけ表示'}</Text></Pressable>}
    </View>
    <View style={demo.map} onLayout={(event) => setSize(event.nativeEvent.layout)}>
      <GraphCanvas dynamic={count <= 10} graph={demoGraph} ids={view.ids} edges={view.edges} width={size.width} height={size.height} selected={selected} request={request} onSelect={choose} />
      {list && <FlatList testID="demo-list" style={demo.list} contentContainerStyle={{ padding: 16 }} data={visible.ids} keyExtractor={(id) => id} renderItem={({ item: id }) => <Pressable accessibilityRole="button" onPress={() => choose(id)} style={demo.listItem}><Text style={styles.body}>{demoGraph.nodes[id].name}</Text><Text style={styles.small}>{demoGraph.nodes[id].kind === 'knowledge' ? '取得済み' : '未取得の周辺概念'} · {demoGraph.nodes[id].provenance === 'fixture' ? '架空の検証用' : '出典あり'}</Text></Pressable>} />}
      {!!selected && !list && <MapSheet demo graph={demoGraph} edges={visible.edges} acquiredIds={demoOrder.slice(0, count)} selected={selected} height={size.height} onSelect={choose} onClose={() => { setSelected(''); setNearby(false); }} />}
    </View>
  </View>;
}
const demo = StyleSheet.create({
  unavailable: { flex: 1, padding: 24, gap: 16 },
  controls: { padding: 12, gap: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
  control: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  active: { backgroundColor: '#D7E5D8', borderColor: colors.ink },
  map: { flex: 1, overflow: 'hidden', backgroundColor: '#F0F3EB' },
  list: { ...StyleSheet.absoluteFill, backgroundColor: colors.paper },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
});
