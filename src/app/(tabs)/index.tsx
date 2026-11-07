import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Capsule } from '../../components/Capsule';
import { Specimen } from '../../components/Specimen';
import { Action, colors, styles } from '../../components/ui';
import { graphLabEnabled } from '../../graph/lab';
import { availability } from '../../graph/availability';
import { useProgress } from '../../state/ProgressProvider';
export default function Gacha() {
  const { progress, date, ready, busy, error, retry, open, nextDay, reset } = useProgress();
  const [reveal, setReveal] = useState<{ id: string; phase: 'opening' | 'result' } | null>(null);
  const lock = useRef(false);
  const { today, exhausted, remaining } = availability(progress, date);
  async function draw() {
    if (lock.current || !remaining) return;
    lock.current = true;
    try { const id = await open(); if (id) setReveal({ id, phase: 'opening' }); }
    finally { lock.current = false; }
  }
  function read(id: string) { setReveal(null); router.push({ pathname: '/word/[id]', params: { id } }); }
  function finish() { setReveal((value) => value ? { ...value, phase: 'result' } : null); }
  return <GachaPage>
    <View style={gacha.header}><View><Text style={gacha.brand}>KnowGacha<Text style={{ color: colors.accent }}>.</Text></Text><Text style={styles.small}>脳ガチャ — 好奇心の入口</Text></View><View style={gacha.counter}><Text style={gacha.counterLabel}>残り</Text><Text style={gacha.counterValue}>{ready ? remaining : '—'}<Text style={{ fontSize: 13 }}> 回</Text></Text></View></View>
    {!ready ? <View style={gacha.hero}><ActivityIndicator /><Text style={styles.body}>{error ?? '言葉を準備しています…'}</Text>{error && <Action title="読み込みを再試行" onPress={retry} />}</View> : reveal ? <View style={gacha.hero}>
      {reveal.phase === 'opening' ? <><Text style={styles.eyebrow}>A LITTLE SURPRISE</Text><Text style={gacha.headline}>未知が、ひらく。</Text><Capsule opening onFinish={finish} /><Action title="演出をスキップ" secondary onPress={finish} /></> : <><Text style={styles.eyebrow}>今日、あなたが出会ったのは</Text><View style={gacha.result}><Specimen id={reveal.id} /></View><Action title="解説を読む →" onPress={() => read(reveal.id)} /><Action title="Mapで見る" secondary onPress={() => { const id = reveal.id; setReveal(null); router.navigate({ pathname: '/graph', params: { focus: id, fresh: String(Date.now()) } }); }} /><Pressable accessibilityRole="button" style={gacha.textButton} onPress={() => setReveal(null)}><Text style={styles.small}>Gachaへ戻る</Text></Pressable></>}
    </View> : <View style={gacha.hero}>
      <Text style={styles.eyebrow}>{date.replaceAll('-', ' / ')}{__DEV__ && progress.dayOffset > 0 ? ' · 開発用日付' : ''}</Text>
      <Text style={gacha.headline}>{remaining ? 'まだ知らない、\n自分に出会う。' : exhausted ? '知るほどに、\n世界は広がる。' : '今日の発見を、\nもう少し深く。'}</Text>
      {remaining ? <View style={{ paddingVertical: 25, transform: [{ scale: 1.25 }] }}><Capsule /></View> : <View style={gacha.collected}><Text style={{ fontSize: 48, color: '#738A77' }}>◇  ◎  ✳</Text><Text style={styles.small}>{progress.openings.length}語の知識が、Mapに加わりました。</Text></View>}
      <Text style={[styles.body, { textAlign: 'center' }]}>{remaining ? 'ひとつの言葉から、\n新しい世界をのぞいてみませんか。' : exhausted ? '試作の教材はすべて開封済みです。\nMapから、気になる知識をもう一度。' : '次のガチャは明日。\n出会った知識は、いつでも読み返せます。'}</Text>
      {remaining > 0 && <Action title={busy ? '保存しています…' : 'ガチャを回す'} disabled={busy} onPress={() => { void draw(); }} />}
      {today && <Action title="今日の知識を読み返す →" onPress={() => read(today.keywordId)} />}
      {!remaining && <Action title="Mapをひらく" secondary onPress={() => router.navigate('/graph')} />}
      {error && <Text accessibilityRole="alert" style={styles.body}>{error}</Text>}
      <Text style={[styles.small, { textAlign: 'center' }]}>1日1回 · 現地日付の翌日に回復 · 再閲覧は回数不要</Text>
    </View>}
    <View style={gacha.footer}><Pressable accessibilityRole="button" style={gacha.textButton} onPress={() => router.push('/history')}><Text style={styles.small}>開封した知識　{progress.openings.length} / 3　→</Text></Pressable><Text style={[styles.small, { fontSize: 11 }]}>PROTOTYPE · 原稿は試作用</Text></View>
    {graphLabEnabled && !__DEV__ && ready && !reveal && <Action title="知識グラフのデモ（5〜500件）" secondary onPress={() => router.push('/graph-demo')} />}
    {__DEV__ && ready && !reveal && <View style={gacha.dev}><Text style={styles.small}>開発用</Text><Action title="知識グラフのデモ（5〜500件）" secondary onPress={() => router.push('/graph-demo')} /><Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { void nextDay(); }} /><Action title="進捗を初期化する" secondary disabled={busy} onPress={() => Alert.alert('進捗を初期化しますか？', 'この端末の開封履歴と開発用日付を消去します。', [{ text: 'キャンセル', style: 'cancel' }, { text: '初期化する', style: 'destructive', onPress: () => { void reset(); } }])} /></View>}
  </GachaPage>;
}
function GachaPage({ children }: { children: ReactNode }) { return <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['top', 'left', 'right']}><ScrollView contentContainerStyle={{ padding: 24, paddingTop: 14, gap: 24, flexGrow: 1, maxWidth: 680, width: '100%', alignSelf: 'center' }}>{children}</ScrollView></SafeAreaView>; }
const gacha = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 16 },
  brand: { fontSize: 23, fontWeight: '800', letterSpacing: -0.8, color: colors.ink },
  counter: { minWidth: 72, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#E9EDDF', alignItems: 'center' },
  counterLabel: { fontSize: 10, color: colors.muted }, counterValue: { fontSize: 24, fontWeight: '700', color: colors.ink },
  hero: { flex: 1, justifyContent: 'center', gap: 22, paddingVertical: 20 },
  headline: { fontSize: 34, lineHeight: 48, fontWeight: '700', letterSpacing: -0.5, textAlign: 'center', color: colors.ink },
  result: { backgroundColor: colors.card, padding: 24, borderRadius: 26, borderWidth: 1, borderColor: colors.line },
  collected: { minHeight: 170, alignItems: 'center', justifyContent: 'center', gap: 16 },
  footer: { alignItems: 'center', gap: 6, paddingBottom: 12 },
  textButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  dev: { borderTopWidth: 1, borderTopColor: colors.line, gap: 12, paddingTop: 16, paddingBottom: 24 },
});
