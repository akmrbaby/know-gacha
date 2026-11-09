import { useI18n } from '../../i18n/I18nProvider';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapViewport } from '../../hooks/useMapViewport';
import { Capsule } from '../../components/Capsule';
import { availability } from '../../graph/availability';
import { GraphCanvas, type CameraRequest } from '../../components/GraphCanvas';
import { MapPreview } from '../../components/MapPreview';
import { MapSheet } from '../../components/MapSheet';
import { AppIcon } from '../../components/native-ui/AppIcon';
import { AppSheet } from '../../components/native-ui/AppSheet';
import { NativeIconAction } from '../../components/native-ui/NativeIconAction';
import { NativeToolbar } from '../../components/native-ui/NativeToolbar';
import { NativeText } from '../../components/native-ui/NativeText';
import { NavigationRow } from '../../components/native-ui/NavigationRow';
import { Action } from '../../components/ui';
import { conceptName } from '../../data/graph';
import { baseGraph } from '../../knowledge/base';
import { graphForAcquired } from '../../knowledge/model';
import { useProgress } from '../../state/ProgressProvider';
import { spacing, useThemeColors } from '../../theme';
import { selectionFeedback } from '../../ui/feedback';
const sessionStarted = Date.now();
const appeared = new Set<string>();
export default function GraphScreen() {
  const {t}=useI18n();
  const colors = useThemeColors();
  const { progress, date, ready, busy, error, retry, open } = useProgress();
  const { focus, fresh } = useLocalSearchParams<{ focus?: string; fresh?: string }>();
  const acquiredIds = progress.openings.map(item => item.keywordId);
  const graph = graphForAcquired(baseGraph, acquiredIds);
  const [size, setSize] = useState({ width: 390, height: 700 });
  const viewport = useMapViewport(size.width, size.height);
  const [selected, setSelected] = useState('');
  const [reveal, setReveal] = useState<string | null>(null);
  const drawing = useRef(false);
  const { today, remaining } = availability(progress, date);
  async function draw() {
    if (drawing.current || !ready || !remaining) return;
    drawing.current = true;
    try { const id = await open(); if (id) { setPanelOpen(false); setReveal(id); } }
    finally { drawing.current = false; }
  }
  function finishReveal() { if (reveal) { const id = reveal; setReveal(null); choose(id); setRequest({id,kind:'focus',token:0}); } }
  const [list, setList] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => { setActive(true); return () => { setActive(false); setPanelOpen(false); }; }, []));
  const [request, setRequest] = useState<CameraRequest | null>(null);
  const consumed = useRef('');
  const insets = useSafeAreaInsets();
  const latest = progress.openings.at(-1);
  const newOwner = active && latest && !appeared.has(latest.openedAt) && Date.parse(latest.openedAt) >= sessionStarted ? latest.keywordId : undefined;
  const requested = typeof focus === 'string' ? focus : '';
  const requestKey = `${requested}:${fresh ?? ''}`;
  function choose(id: string, userInitiated = true) {
    setList(false);
    setSelected(id);
    setPanelOpen(false);
    if (id) {
      if (userInitiated && id !== selected) selectionFeedback();
    }
  }
  useEffect(() => {
    if (!ready || !requested || consumed.current === requestKey || !(graph.ids.includes(requested) || graph.edges.some(edge => edge.id === requested))) return;
    const frame = requestAnimationFrame(() => { consumed.current = requestKey; choose(requested, false); setRequest({id:requested,kind:'focus',token:Date.now()}); });
    return () => cancelAnimationFrame(frame);
    // The route parameter is an explicit camera request, separate from selection renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, requestKey, graph.ids.join('|')]);
  useEffect(() => {
    if (!newOwner || !latest) return;
    const timer = setTimeout(() => appeared.add(latest.openedAt), 1800);
    return () => clearTimeout(timer);
  }, [newOwner, latest]);
  const validSelected = graph.ids.includes(selected) || graph.edges.some(edge => edge.id === selected) ? selected : '';
  const selectedEdge = graph.edges.find(edge => edge.id === validSelected);
  const sheetTitle = validSelected ? selectedEdge ? `${conceptName(selectedEdge.sourceId)} → ${conceptName(selectedEdge.targetId)}` : conceptName(validSelected) : '出会った知識';
  return <View style={[map.screen, { backgroundColor: colors.map }]} onLayout={event => setSize(event.nativeEvent.layout)}>
    {ready && viewport.ready && graph.ids.length > 0 && <GraphCanvas dynamic initialCamera={viewport.initial} onCameraChange={viewport.save} ids={graph.ids} edges={graph.edges} width={size.width} height={size.height} selected={validSelected} request={request} newOwner={newOwner} onSelect={choose} />}
    <View pointerEvents="box-none" style={[map.top, { top: insets.top + spacing.sm }]}>
      <NativeToolbar style={map.titlebar}>
        <View pointerEvents="none" style={map.title}><NativeText variant="title" accessibilityRole="header">Map</NativeText><NativeText variant="caption">{progress.openings.length}語の知識</NativeText></View>
        {graph.ids.length > 0 && <NativeIconAction label="知識の一覧を開く" onPress={() => { selectionFeedback(); setSelected(''); setList(true); setPanelOpen(true); }}><AppIcon name="list" /></NativeIconAction>}
      </NativeToolbar>
    </View>
    {!graph.ids.length && <ScrollView contentContainerStyle={[map.empty, { paddingTop: insets.top + 120 }]}>
      {!ready && !error && <ActivityIndicator color={colors.accent} />}
      <NativeText variant="title">{!ready ? error ? '地図を読み込めませんでした' : '地図を準備しています' : '最初の知識をひらこう'}</NativeText>
      <NativeText>{!ready && error ? error : ready ? '最初の言葉をひらくと、知識とそのつながりがここに増えていきます。' : '保存した知識を読み込んでいます。'}</NativeText>
      {error && !ready ? <Action title="読み込みを再試行" onPress={retry} /> : ready && <Action title="最初の知識をひらく" loading={busy} onPress={() => { void draw(); }} />}
      {ready && error && <NativeText accessibilityRole="alert">{error}</NativeText>}
    </ScrollView>}
    {ready && !panelOpen && !reveal && !validSelected && graph.ids.length > 0 && <View pointerEvents="box-none" style={map.bottom}>
      <Pressable accessibilityRole="button" accessibilityLabel={t(remaining ? `残り${remaining}回、ガチャをひらく` : today ? '今日の知識を選択' : 'Gachaをひらく')} disabled={busy} onPress={() => remaining ? void draw() : today ? choose(today.keywordId) : router.navigate('/gacha')} style={[map.daily, { backgroundColor: colors.surface }]}>
        <AppIcon name="gacha" /><NativeText variant="label">{remaining ? `残り${remaining}回` : today ? '今日の知識' : 'Gacha'}</NativeText>
      </Pressable>
      <NativeToolbar style={map.zoom}>
        {(['out', 'in', 'fit'] as const).map(kind => <NativeIconAction key={kind} label={kind === 'in' ? '地図を拡大' : kind === 'out' ? '地図を縮小' : '地図全体を表示'} onPress={() => setRequest({ kind, token: Date.now() })}><AppIcon name={kind === 'in' ? 'plus' : kind === 'out' ? 'minus' : 'fit'} /></NativeIconAction>)}
      </NativeToolbar>
    </View>}
    {error && ready && graph.ids.length > 0 && <View style={[map.error,{backgroundColor:colors.surface}]}><NativeText accessibilityRole="alert">{error}</NativeText></View>}
    {active && !!validSelected && !panelOpen && !reveal && <MapPreview selected={validSelected} edges={graph.edges} height={size.height} onSelect={choose} onClose={() => setSelected('')} onExpand={() => setPanelOpen(true)} onCenter={() => setRequest({id:validSelected,kind:'focus',token:Date.now()})} />}
    {active && <AppSheet isPresented={panelOpen || !!reveal} title={reveal ? '今日の知識をひらく' : sheetTitle} closeLabel={reveal ? 'Mapで見る' : validSelected ? '詳細を閉じる' : '一覧を閉じる'} onClose={() => {
      if (reveal) { setSelected(reveal); setRequest({ id: reveal, kind: 'focus', token: Date.now() }); setReveal(null); }
      setPanelOpen(false);
    }} testID={reveal ? 'map-reveal' : validSelected ? 'map-sheet' : 'map-list'}>
      {reveal ? <View style={map.list}><Capsule key={reveal} opening onFinish={finishReveal} /><Action title="演出をスキップしてMapで見る" onPress={finishReveal} /></View> : validSelected && !list ? <MapSheet embedded edges={graph.edges} acquiredIds={acquiredIds} selected={validSelected} height={size.height} onSelect={choose} onClose={() => setPanelOpen(false)} /> : <ScrollView nestedScrollEnabled style={map.scroll} contentContainerStyle={[map.list, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {acquiredIds.map(id => <View key={id}>
          <NavigationRow title={conceptName(id)} description="開封済み" onPress={() => choose(id)} />
          {graph.edges.filter(edge => edge.sourceId === id || edge.targetId === id).map(edge => <View key={edge.id} style={map.related}>
            <NavigationRow title={conceptName(edge.sourceId === id ? edge.targetId : edge.sourceId)} description="周辺概念" onPress={() => choose(edge.sourceId === id ? edge.targetId : edge.sourceId)} />
            <NavigationRow title={edge.label} description="つながりの理由" onPress={() => choose(edge.id)} />
          </View>)}
        </View>)}
        <NavigationRow title="開封履歴" onPress={() => {setPanelOpen(false);router.push('/history');}} />
        <NativeText variant="caption">周辺語・関係は試作用原稿です。配置の距離は意味の近さを表しません。</NativeText>
      </ScrollView>}
    </AppSheet>}
  </View>;
}
const map = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  top: { position: 'absolute', left: spacing.md, right: spacing.md },
  titlebar: { justifyContent: 'space-between' },
  title: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  bottom: { position: 'absolute', right: spacing.md, left: spacing.md, bottom: spacing.md, flexDirection:'row', flexWrap:'wrap', gap:spacing.sm, justifyContent:'space-between', alignItems:'center' },
  daily: { minHeight:48, flexDirection:'row', alignItems:'center', gap:spacing.sm, paddingHorizontal:12, borderRadius:24 },
  error: {position:'absolute',left:spacing.md,right:spacing.md,bottom:80,padding:spacing.sm,borderRadius:12},
  zoom: { justifyContent: 'flex-end' },
  empty: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  scroll: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.md },
  related: { paddingLeft: spacing.md },
});
