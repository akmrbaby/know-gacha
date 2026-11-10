import { useI18n } from '../i18n/I18nProvider';
import { Text } from '../i18n/Text';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import Constants from 'expo-constants';
import { FlatList, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GraphCanvas, type CameraRequest } from '../components/GraphCanvas';
import { MapSheet } from '../components/MapSheet';
import { Action, useUI } from '../components/ui';
import { type ThemeColors } from '../theme';
import { demoGraph, demoOrder, demoSizes, demoTopicCount, demoView } from '../knowledge/demo';
import { useMapMeasurement } from '../hooks/useMapMeasurement';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { graphLabEnabled } from '../graph/lab';
import { graphCounts, neighborhood } from '../knowledge/model';

export default function GraphDemo() {
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => { setActive(true); return () => setActive(false); }, []));
  const {t}=useI18n();
  const { theme, styles } = useUI();
  const demo = makeStyles(theme);
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
  const reduced = useReducedMotion();
  const measurement = useMapMeasurement(JSON.stringify({
    acquired: count, nodes: view.ids.length, relations: view.edges.length,
    mode: 'force-viewport-svg',
    platform: Platform.OS, osVersion: Platform.Version, executionEnvironment: Constants.executionEnvironment,
    development: __DEV__, appVersion: Constants.expoConfig?.version ?? null,
    nativeBuildVersion: Constants.nativeBuildVersion, reducedMotion: reduced, viewport: size,
    nearby, listVisible: list,
  }), JSON.stringify([view.ids, view.edges.map((edge) => edge.id)]));
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
  if (!graphLabEnabled) return <View style={demo.unavailable}><Text style={styles.body}>デモは比較検証用ビルドで利用できます。</Text><Action title="Mapへ" onPress={() => router.replace('/')} /></View>;
  return <View style={{ flex: 1, backgroundColor: theme.background }}>
    <Stack.Screen options={{ title: t('知識グラフ · デモ'), headerBackVisible: false }} />
    <View style={demo.controls}>
      <View style={demo.row}><Text accessibilityRole="header" style={styles.heading}>デモ · {counts.acquired}件</Text><Pressable accessibilityRole="button" onPress={() => router.replace('/')} style={demo.control}><Text style={{ color: theme.text }}>デモを終了</Text></Pressable></View>
      <Text style={styles.small}>取得知識 {counts.acquired} · 周辺概念 {counts.concepts} · 関係 {counts.relations}</Text>
      <Text style={styles.small}>{count <= demoTopicCount ? '出典確認済みのデモ原稿 · 公開前の校閲は未実施' : `内容確認用${demoTopicCount}件＋架空の検証用${count - demoTopicCount}件 · 学習内容ではありません`}</Text>
      <Text style={styles.small}>動的配置 · ノードをドラッグ、背景をパン／ピンチ</Text>
      <Text style={styles.small}>縮小時の数字は近くの点の数です。拡大・選択で個別の知識へ。配置の距離は意味の近さを表しません。</Text>
      <View style={demo.row}>{demoSizes.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={t(`${value}件のデモ`)} accessibilityState={{ selected: value === count }} onPress={() => changeCount(value)} style={[demo.control, value === count && demo.active]}><Text style={{ color: theme.text }}>{value}件</Text></Pressable>)}</View>
      <View style={demo.row}>
        <Pressable accessibilityRole="button" disabled={count >= 500} onPress={addNext} style={[demo.control, count >= 500 && { opacity: 0.4 }]}><Text style={{ color: theme.text }}>次の1件を追加</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setList(!list)} style={demo.control}><Text style={{ color: theme.text }}>{list ? 'Mapに戻る' : '一覧'}</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setNearby(false); setRequest({ kind: 'fit', token: (request?.token ?? 0) + 1 }); }} style={demo.control}><Text style={{ color: theme.text }}>全体</Text></Pressable>
      </View>
      {!!selected && <Pressable accessibilityRole="button" accessibilityState={{ selected: nearby }} style={demo.control} onPress={() => { setNearby(!nearby); setRequest({ kind: 'fit', token: (request?.token ?? 0) + 1 }); }}><Text style={{ color: theme.text }}>{nearby ? '全件表示へ' : '選択した知識の周辺だけ表示'}</Text></Pressable>}
    </View>
    <View style={demo.measurement}>
      <View style={demo.row}><Pressable accessibilityRole="button" disabled={reduced === null} style={demo.control} onPress={() => measurement.recording ? measurement.finish() : measurement.begin()}><Text style={{ color: theme.text }}>{measurement.recording ? '計測を停止' : '20秒間の計測を開始'}</Text></Pressable>
        {!!measurement.report && <Pressable accessibilityRole="button" style={demo.control} onPress={measurement.dismiss}><Text style={{ color: theme.text }}>結果を閉じる</Text></Pressable>}</View>
      <Text numberOfLines={2} style={[styles.small, { height: 36 }]}>{measurement.recording ? '計測中 · ノード／背景ドラッグ、ピンチ、指の切り替えを試してください。' : 'UIの呼び出し間隔と配置時間を記録。機種・操作感は別途記録してください。'}</Text>
    </View>
    <View style={demo.map} onLayout={(event) => { const { width, height } = event.nativeEvent.layout; setSize({ width, height }); }}>
      <GraphCanvas active={active && !list && !selected && !measurement.recording && !measurement.report} measurement={measurement.probe} dynamic graph={demoGraph} ids={view.ids} edges={view.edges} width={size.width} height={size.height} selected={selected} request={request} onSelect={choose} />
      {!!measurement.report && <View style={demo.report}><ScrollView style={{ maxHeight: 160 }}><Text selectable testID="map-measurement-report" style={styles.small}>{measurement.report}</Text></ScrollView></View>}
      {list && <FlatList testID="demo-list" style={demo.list} contentContainerStyle={{ padding: 16 }} data={visible.ids} keyExtractor={(id) => id} renderItem={({ item: id }) => <Pressable accessibilityRole="button" onPress={() => choose(id)} style={demo.listItem}><Text style={styles.body}>{demoGraph.nodes[id].name}</Text><Text style={styles.small}>{demoGraph.nodes[id].kind === 'knowledge' ? '取得済み' : '未取得の周辺概念'} · {demoGraph.nodes[id].provenance === 'fixture' ? '架空の検証用' : '出典あり'}</Text></Pressable>} />}
      {!!selected && !list && <MapSheet demo graph={demoGraph} edges={visible.edges} acquiredIds={demoOrder.slice(0, count)} selected={selected} height={size.height} onSelect={choose} onClose={() => { setSelected(''); setNearby(false); }} />}
    </View>
  </View>;
}
const makeStyles = (theme: ThemeColors) => StyleSheet.create({
  unavailable: { flex: 1, padding: 24, gap: 16 },
  report: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: theme.surface, padding: 12, borderRadius: 12 },
  measurement: { paddingHorizontal: 12, paddingBottom: 6, gap: 6 },
  controls: { padding: 12, gap: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center', justifyContent: 'space-between' },
  control: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: theme.separator, backgroundColor: theme.surface },
  active: { backgroundColor: theme.surface, borderColor: theme.accent },
  map: { flex: 1, overflow: 'hidden', backgroundColor: theme.map },
  list: { ...StyleSheet.absoluteFill, backgroundColor: theme.background },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.separator },
});
