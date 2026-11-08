import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Capsule } from '../../components/Capsule';
import { keywords } from '../../data/keywords';
import { Specimen } from '../../components/Specimen';
import { Action } from '../../components/ui';
import { NativeText } from '../../components/native-ui/NativeText';
import { NavigationRow } from '../../components/native-ui/NavigationRow';
import { graphLabEnabled } from '../../graph/lab';
import { availability } from '../../graph/availability';
import { useProgress } from '../../state/ProgressProvider';
import { spacing, useThemeColors } from '../../theme';
import { selectionFeedback } from '../../ui/feedback';

export default function Gacha() {
  const colors = useThemeColors();
  const { progress, date, ready, busy, error, retry, open, nextDay, reset } = useProgress();
  const [reveal, setReveal] = useState<{ id: string; phase: 'opening' | 'result' } | null>(null);
  const [development, setDevelopment] = useState(false);
  const [resultReady, setResultReady] = useState<string | null>(null);
  const lock = useRef(false);
  const drawnDate = useRef<string | null>(null);
  const { today, exhausted, remaining } = availability(progress, date);
  async function draw() {
    if (lock.current || !remaining || drawnDate.current === date) return;
    lock.current = true;
    setResultReady(null);
    try {
      const id = await open();
      if (id) { drawnDate.current = date; selectionFeedback(); setReveal({ id, phase: 'opening' }); }
    } finally { lock.current = false; }
  }
  function read(id: string) { setReveal(null); router.push({ pathname: '/word/[id]', params: { id } }); }
  function finish() { setReveal(value => value ? { ...value, phase: 'result' } : null); }
  const opening = reveal?.phase === 'opening';
  const displayedId = reveal?.phase === 'result' ? reveal.id : today?.keywordId ?? (exhausted ? progress.openings.at(-1)?.keywordId : undefined);
  useEffect(() => {
    if (!displayedId || opening) return;
    const timer = setTimeout(() => setResultReady(displayedId), 350);
    return () => clearTimeout(timer);
  }, [displayedId, opening]);
  const status = !ready ? '読み込み中' : opening ? '開封中' : exhausted ? 'コンプリート' : remaining ? '未開封' : '開封済み';
  return <SafeAreaView style={[gacha.screen, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={gacha.content}>
      <View style={gacha.brand}>
        <NativeText variant="label">KnowGacha<NativeText variant="label" style={{ color: colors.accent }}>.</NativeText></NativeText>
        <NativeText variant="caption">脳ガチャ — 好奇心の入口</NativeText>
      </View>
      <View style={gacha.header}>
        <View style={{ gap: spacing.xs }}>
          <NativeText variant="title" accessibilityRole="header">今日のガチャ</NativeText>
          <NativeText variant="caption">{date.replaceAll('-', ' / ')}{__DEV__ && progress.dayOffset > 0 ? ' · 開発用日付' : ''}</NativeText>
        </View>
        <View style={[gacha.status, { backgroundColor: colors.surface, borderColor: colors.separator }]}><NativeText variant="caption" accessibilityLiveRegion="polite">{status}</NativeText></View>
      </View>
      <View testID="gacha-main" style={[gacha.main, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        {!ready ? <>
          {!error && <ActivityIndicator color={colors.accent} />}
          <NativeText>{error ? '知識を読み込めませんでした' : '知識を準備しています…'}</NativeText>
          {error && <><NativeText accessibilityRole="alert">{error}</NativeText><Action title="読み込みを再試行" onPress={retry} /></>}
        </> : opening ? <>
          <NativeText variant="label" accessibilityLiveRegion="polite">知識をひらいています</NativeText>
          <Capsule opening onFinish={finish} />
          <Action title="演出をスキップ" secondary onPress={finish} />
        </> : displayedId ? <>
          {!today && exhausted && <NativeText variant="caption">最近出会った知識</NativeText>}
          <Specimen id={displayedId} compact />
          <Action title="解説を読む" disabled={resultReady !== displayedId} onPress={() => read(displayedId)} />
          <NavigationRow title="Mapでつながりを見る" onPress={() => {
            setReveal(null);
            router.navigate({ pathname: '/graph', params: { focus: displayedId, fresh: String(Date.now()) } });
          }} />
          <NativeText variant="caption">{exhausted ? 'すべての知識を開封しました。何度でも読み返せます。' : '次の開封は明日。今日の知識は何度でも読めます。'}</NativeText>
        </> : <>
          <Capsule />
          <NativeText style={{ textAlign: 'center' }}>1日1回、新しい言葉に出会えます。</NativeText>
          <Action title="今日の知識をひらく" loading={busy} onPress={() => { void draw(); }} />
        </>}
        {ready && error && <NativeText accessibilityRole="alert" selectable>{error}</NativeText>}
      </View>
      {ready && !opening && <View>
        <NavigationRow title="開封履歴" description={`${progress.openings.length} / ${keywords.length}語`} onPress={() => router.push('/history')} />
        {graphLabEnabled && <View>
          <NavigationRow title={development ? '検証メニューを閉じる' : '検証メニュー'} onPress={() => setDevelopment(!development)} />
          {development && <View style={gacha.tools}>
            <NavigationRow title="知識グラフのデモ" description="5・10・50・100・500件" onPress={() => router.push('/graph-demo')} />
            {__DEV__ && <>
              <Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { setReveal(null); void nextDay(); }} />
              <Action title="進捗を初期化する" secondary disabled={busy} onPress={() => Alert.alert('進捗を初期化しますか？', 'この端末の開封履歴と開発用日付を消去します。', [{ text: 'キャンセル', style: 'cancel' }, { text: '初期化する', style: 'destructive', onPress: () => { setReveal(null); drawnDate.current = null; void reset(); } }])} />
            </>}
          </View>}
        </View>}
      </View>}
    </ScrollView>
  </SafeAreaView>;
}
const gacha = StyleSheet.create({
  screen: { flex: 1 },
  brand: { gap: 2 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl, gap: spacing.lg, maxWidth: 600, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  status: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, paddingVertical: spacing.xs, paddingHorizontal: 12 },
  main: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, padding: spacing.lg, gap: spacing.md },
  tools: { paddingHorizontal: spacing.md, gap: spacing.sm },
});
