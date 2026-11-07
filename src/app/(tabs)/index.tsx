import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Capsule } from '../../components/Capsule';
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
  const lock = useRef(false);
  const { today, exhausted, remaining } = availability(progress, date);
  async function draw() {
    if (lock.current || !remaining) return;
    lock.current = true;
    try {
      const id = await open();
      if (id) { selectionFeedback(); setReveal({ id, phase: 'opening' }); }
    } finally { lock.current = false; }
  }
  function read(id: string) { setReveal(null); router.push({ pathname: '/word/[id]', params: { id } }); }
  function finish() { setReveal(value => value ? { ...value, phase: 'result' } : null); }
  return <SafeAreaView style={[gacha.screen, { backgroundColor: colors.background }]}>
    <ScrollView contentContainerStyle={gacha.content}>
      <View style={gacha.brand}>
        <NativeText variant="title" accessibilityRole="header">KnowGacha<NativeText variant="title" style={{ color: colors.accent }}>.</NativeText></NativeText>
        <NativeText variant="caption">脳ガチャ — 好奇心の入口</NativeText>
      </View>
      <View style={gacha.header}>
        <NativeText variant="label" accessibilityRole="header">今日の知識</NativeText>
        <NativeText variant="caption">{ready ? remaining ? '未開封' : '開封済み' : '読み込み中'}</NativeText>
      </View>
      <NativeText variant="caption">{date.replaceAll('-', ' / ')}{__DEV__ && progress.dayOffset > 0 ? ' · 開発用日付' : ''}</NativeText>
      {!ready ? <View style={gacha.section}><ActivityIndicator color={colors.accent} /><NativeText>{error ?? '言葉を準備しています…'}</NativeText>{error && <Action title="読み込みを再試行" onPress={retry} />}</View>
        : reveal ? <View style={gacha.section}>
          {reveal.phase === 'opening' ? <><NativeText variant="label">知識をひらいています</NativeText><Capsule opening onFinish={finish} /><Action title="演出をスキップ" secondary onPress={finish} /></>
            : <><Specimen id={reveal.id} /><Action title="Mapで見る" onPress={() => { const id = reveal.id; setReveal(null); router.navigate({ pathname: '/graph', params: { focus: id, fresh: String(Date.now()) } }); }} /><NavigationRow title="解説を読む" onPress={() => read(reveal.id)} /><NavigationRow title="今日の知識へ戻る" onPress={() => setReveal(null)} /></>}
        </View> : <View style={gacha.section}>
          {remaining ? <><NativeText variant="title">まだ知らない、自分に出会う。</NativeText><Capsule /><NativeText>1日1回、新しい言葉との出会いを。</NativeText><Action title="ガチャを回す" loading={busy} onPress={() => { void draw(); }} /></>
            : <><NativeText variant="label">{exhausted ? 'すべての知識と出会いました' : '今日の知識を、もう少し深く'}</NativeText><NativeText>{exhausted ? '試作の教材はすべて開封済みです。Mapからつながりをたどれます。' : '次のガチャは明日。出会った知識はいつでも読み返せます。'}</NativeText>{today && <NavigationRow title="今日の知識を読み返す" onPress={() => read(today.keywordId)} />}<Action title="Mapをひらく" onPress={() => router.navigate('/graph')} /></>}
          {error && <NativeText accessibilityRole="alert" selectable>{error}</NativeText>}
          <NativeText variant="caption">現地日付の翌日に回復 · 再閲覧は回数不要</NativeText>
        </View>}
      <NavigationRow title="開封履歴" description={`${progress.openings.length} / 3語`} onPress={() => router.push('/history')} />
      {graphLabEnabled && !__DEV__ && ready && !reveal && <NavigationRow title="知識グラフのデモ" description="5〜500件" onPress={() => router.push('/graph-demo')} />}
      {__DEV__ && ready && !reveal && <View>
        <NavigationRow title={development ? '開発用操作を閉じる' : '開発用操作'} onPress={() => setDevelopment(!development)} />
        {development && <View style={gacha.section}>
          <NavigationRow title="知識グラフのデモ（5〜500件）" onPress={() => router.push('/graph-demo')} />
          <Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { void nextDay(); }} />
          <Action title="進捗を初期化する" secondary disabled={busy} onPress={() => Alert.alert('進捗を初期化しますか？', 'この端末の開封履歴と開発用日付を消去します。', [{ text: 'キャンセル', style: 'cancel' }, { text: '初期化する', style: 'destructive', onPress: () => { void reset(); } }])} />
        </View>}
      </View>}
      <NativeText variant="caption">PROTOTYPE · 原稿は試作用</NativeText>
    </ScrollView>
  </SafeAreaView>;
}
const gacha = StyleSheet.create({
  screen: { flex: 1 },
  brand: { gap: spacing.xs, paddingVertical: spacing.sm },
  content: { padding: spacing.md, gap: spacing.md, maxWidth: 680, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  section: { gap: spacing.md, paddingVertical: spacing.sm },
});
