import { LanguageSelector } from '../../components/LanguageSelector';
import { useI18n } from '../../i18n/I18nProvider';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Capsule } from '../../components/Capsule';
import { INITIAL_BONUS } from '../../state/progress';
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
  const {t}=useI18n();
  const colors = useThemeColors();
  const { progress, date, ready, busy, error, retry, open, nextDay, reset } = useProgress();
  const [reveal, setReveal] = useState<{ id: string; phase: 'opening' | 'result' } | null>(null);
  const [development, setDevelopment] = useState(false);
  const [resultReady, setResultReady] = useState<string | null>(null);
  const lock = useRef(false);
  const { today, exhausted, remaining } = availability(progress, date);
  async function draw() {
    if (lock.current || !remaining) return;
    lock.current = true;
    setResultReady(null);
    try {
      const id = await open();
      if (id) { selectionFeedback(); setReveal({ id, phase: 'opening' }); }
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
  const status = !ready ? '読み込み中' : opening ? '開封中' : exhausted ? 'コンプリート' : remaining ? `残り${remaining}回` : '開封済み';
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
          <Action title="解説を読む" secondary={remaining > 0} disabled={resultReady !== displayedId} onPress={() => read(displayedId)} />
          {remaining > 0 && <Action title={`次の知識をひらく（残り${remaining}回）`} disabled={resultReady !== displayedId} loading={busy} onPress={() => { void draw(); }} />}
          <NavigationRow title="Mapでつながりを見る" onPress={() => {
            setReveal(null);
            router.navigate({ pathname: '/', params: { focus: displayedId, fresh: String(Date.now()) } });
          }} />
          <NativeText variant="caption">{exhausted ? 'すべての知識を開封しました。何度でも読み返せます。' : remaining ? `あと${remaining}回ひらけます。` : '当日分は明日1回追加されます。'}</NativeText>
        </> : <>
          <Capsule />
          <NativeText style={{ textAlign: 'center' }}>残り{remaining}回、新しい言葉に出会えます。</NativeText>
          <Action title="今日の知識をひらく" loading={busy} onPress={() => { void draw(); }} />
        </>}
        {ready && error && <NativeText accessibilityRole="alert" selectable>{error}</NativeText>}
      </View>
      {ready && !opening && <View>
        <NavigationRow title="開封履歴" description={`${keywords.filter(word => progress.openings.some(item => item.keywordId === word.id)).length} / ${keywords.length}語`} onPress={() => router.push('/history')} />
        {graphLabEnabled && <View>
          <NavigationRow title={development ? '検証メニューを閉じる' : '検証メニュー'} onPress={() => setDevelopment(!development)} />
          {development && <View style={gacha.tools}>
            <NavigationRow title="知識グラフのデモ" description="5・10・50・100・500件" onPress={() => router.push('/graph-demo')} />
            <Action title={`初期${INITIAL_BONUS + 1}回からやり直す`} secondary disabled={busy} onPress={() => Alert.alert(t('初期状態からやり直しますか？'), t(`この端末の開封履歴と残り回数を初期化します。初回特典${INITIAL_BONUS}回＋当日分1回から確認できます。`), [{text:t('キャンセル'),style:'cancel'},{text:t('初期化する'),style:'destructive',onPress:()=>{setReveal(null);setResultReady(null);void reset();}}])} />
            {__DEV__ && <>
              <Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { setReveal(null); void nextDay(); }} />
            </>}
          </View>}
        </View>}
        <LanguageSelector />
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
