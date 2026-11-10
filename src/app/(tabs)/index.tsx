import { useI18n } from '../../i18n/I18nProvider';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMapViewport } from '../../hooks/useMapViewport';
import { availability } from '../../graph/availability';
import { GraphCanvas, type CameraRequest } from '../../components/GraphCanvas';
import { MapPreview } from '../../components/MapPreview';
import { MapSheet } from '../../components/MapSheet';
import { SettingsAction } from '../../components/SettingsAction';
import { AppIcon } from '../../components/native-ui/AppIcon';
import { AppSheet } from '../../components/native-ui/AppSheet';
import { NativeIconAction } from '../../components/native-ui/NativeIconAction';
import { NativeToolbar } from '../../components/native-ui/NativeToolbar';
import { NativeText } from '../../components/native-ui/NativeText';
import { Action } from '../../components/ui';
import { findKeyword } from '../../data/keywords';
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
  const drawing = useRef(false);
  const { today, remaining, exhausted, daily, bonus } = availability(progress, date);
  async function draw() {
    if (drawing.current || !ready || !remaining) return;
    drawing.current = true;
    try { const id = await open(); if (id) { setPanelOpen(false); router.push({pathname:'/word/[id]',params:{id,opening:String(Date.now())}}); } }
    finally { drawing.current = false; }
  }
  const [panelOpen, setPanelOpen] = useState(false);
  const [active, setActive] = useState(false);
  useFocusEffect(useCallback(() => { setActive(true); return () => { setActive(false); setPanelOpen(false); }; }, [setPanelOpen]));
  const [request, setRequest] = useState<CameraRequest | null>(null);
  const consumed = useRef('');
  const insets = useSafeAreaInsets();
  const latest = progress.openings.at(-1);
  const newOwner = active && latest && !appeared.has(latest.openedAt) && Date.parse(latest.openedAt) >= sessionStarted ? latest.keywordId : undefined;
  const requested = typeof focus === 'string' ? focus : '';
  const requestKey = `${requested}:${fresh ?? ''}`;
  function choose(id: string, userInitiated = true) {
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
  return <View pointerEvents={active ? 'auto' : 'none'} style={[map.screen, { backgroundColor: colors.map }]} onLayout={event => setSize(event.nativeEvent.layout)}>
    {ready && viewport.ready && graph.ids.length > 0 && <GraphCanvas dynamic active={active && !panelOpen} initialCamera={viewport.initial} onCameraChange={viewport.save} ids={graph.ids} edges={graph.edges} width={size.width} height={size.height} selected={validSelected} request={request} newOwner={newOwner} onSelect={choose} />}
    <View pointerEvents="box-none" style={[map.top, { top: insets.top + spacing.sm }]}>
      <NativeToolbar style={map.titlebar}>
        <View pointerEvents="none" style={map.title}><NativeText variant="title" accessibilityRole="header">Map</NativeText><NativeText variant="caption">{progress.openings.length}語の知識</NativeText></View>
        {graph.ids.length > 0 && <Action title="知識一覧" secondary onPress={() => router.push('/history')} />}
        <SettingsAction />
      </NativeToolbar>
    </View>
    {!graph.ids.length && <ScrollView contentContainerStyle={[map.empty, { paddingTop: insets.top + 120 }]}>
      {!ready && !error && <ActivityIndicator color={colors.accent} />}
      {ready && <Image source={require('../../../assets/gacha-mascot.png')} accessible={false} style={{width:140,height:156,alignSelf:'center'}} resizeMode="contain" />}
      <NativeText variant="title">{!ready ? error ? '地図を読み込めませんでした' : '地図を準備しています' : '知らなかった視点に、\nひとつ出会う。'}</NativeText>
      <NativeText>{!ready && error ? error : ready ? 'ひとつの言葉から、新しい世界の見方を。' : '保存した知識を読み込んでいます。'}</NativeText>
      {error && !ready ? <Action title="読み込みを再試行" onPress={retry} /> : ready && <Action title="最初の知識をひらく" loading={busy} onPress={() => { void draw(); }} />}
      {ready && bonus > 0 && <NativeText variant="caption">{`今日の1回＋初回特典${Math.min(bonus, Math.max(0, remaining - 1))}回`}</NativeText>}
      {ready && error && <NativeText accessibilityRole="alert">{error}</NativeText>}
    </ScrollView>}
    {ready && !panelOpen && !validSelected && graph.ids.length > 0 && <View pointerEvents="box-none" style={[map.bottom,{bottom:Math.max(insets.bottom,spacing.md)}]}>
      <View style={[map.daily, {backgroundColor:colors.surface}]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t(exhausted ? '出会った知識を読み返す' : daily ? '今日の知識をひらく' : today ? `今日出会った知識：${conceptName(today.keywordId)}` : '特典でもうひとつ')} disabled={busy} onPress={() => {
          if (exhausted) router.push('/history');
          else if (daily || !today) void draw();
          else router.push({pathname:'/word/[id]',params:{id:today.keywordId}});
        }} style={map.dailyMain}>
          <Image source={require('../../../assets/gacha-mascot.png')} accessible={false} style={{width:38,height:44}} resizeMode="contain" />
          <View style={{flexShrink:1,gap:2}}>
            <NativeText variant="label">{exhausted ? '出会った知識を読み返す' : daily ? '今日の知識をひらく' : today ? conceptName(today.keywordId) : '特典でもうひとつ'}</NativeText>
            <NativeText variant="caption">{exhausted ? '知識一覧へ' : daily ? '知らなかった視点に出会う' : today ? '今日出会った知識' : `初回特典 あと${remaining}回`}</NativeText>
          </View>
        </Pressable>
        {!exhausted && bonus > 0 && !daily && <Pressable accessibilityRole="button" disabled={busy} onPress={() => {void draw();}} style={map.bonus}><NativeText variant="caption" style={{color:colors.accent}}>{`特典でもうひとつ（あと${remaining}回）`}</NativeText></Pressable>}
        {!exhausted && bonus > 0 && !!daily && <View style={{paddingHorizontal:16,paddingBottom:10}}><NativeText variant="caption">{`初回特典 あと${Math.min(bonus, Math.max(0,remaining-1))}回`}</NativeText></View>}
      </View>
      <NativeToolbar style={map.zoom}>
        {(['out', 'in', 'fit'] as const).map(kind => <NativeIconAction key={kind} label={kind === 'in' ? '地図を拡大' : kind === 'out' ? '地図を縮小' : '地図全体を表示'} onPress={() => setRequest({ kind, token: Date.now() })}><AppIcon name={kind === 'in' ? 'plus' : kind === 'out' ? 'minus' : 'fit'} /></NativeIconAction>)}
      </NativeToolbar>
    </View>}
    {error && ready && graph.ids.length > 0 && <View style={[map.error,{backgroundColor:colors.surface}]}><NativeText accessibilityRole="alert">{error}</NativeText></View>}
    {active && !!validSelected && !panelOpen && <MapPreview selected={validSelected} edges={graph.edges} height={size.height} onSelect={choose} onClose={() => setSelected('')} onExpand={() => { if (findKeyword(validSelected) && acquiredIds.includes(validSelected)) router.push({pathname:'/word/[id]',params:{id:validSelected}}); else setPanelOpen(true); }} onCenter={() => setRequest({id:validSelected,kind:'focus',token:Date.now()})} />}
    {active && <AppSheet isPresented={panelOpen} title={sheetTitle} closeLabel="詳細を閉じる" onClose={() => setPanelOpen(false)} testID="map-sheet" contentKey={validSelected}>
      {!!validSelected && <MapSheet embedded edges={graph.edges} acquiredIds={acquiredIds} selected={validSelected} height={size.height} onSelect={choose} onClose={() => setPanelOpen(false)} />}
    </AppSheet>}

  </View>;
}
const map = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden' },
  top: { position: 'absolute', left: spacing.md, right: spacing.md, zIndex: 1 },
  titlebar: { justifyContent: 'space-between' },
  title: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  bottom: { position: 'absolute', right: spacing.md, left: spacing.md, bottom: spacing.md, flexDirection:'row', flexWrap:'wrap', gap:spacing.sm, justifyContent:'space-between', alignItems:'center' },
  daily: { flexShrink:1, maxWidth:'100%', borderRadius:20, overflow:'hidden' },
  dailyMain: {minHeight:60,flexDirection:'row',alignItems:'center',gap:8,padding:12},
  bonus: {minHeight:44,paddingHorizontal:16,paddingBottom:10,justifyContent:'center'},
  error: {position:'absolute',left:spacing.md,right:spacing.md,bottom:80,padding:spacing.sm,borderRadius:12},
  zoom: { justifyContent: 'flex-end' },
  empty: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
});
