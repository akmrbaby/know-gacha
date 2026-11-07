import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Capsule } from '../../components/Capsule';
import { Specimen } from '../../components/Specimen';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { Action, Card, Page, styles } from '../../components/ui';
import { keywords } from '../../data/keywords';
import { useProgress } from '../../state/ProgressProvider';
export default function Home() {
    const { progress, date, ready, busy, error, retry, open, nextDay, reset } = useProgress();
    const [reveal, setReveal] = useState<{ id: string; phase: 'opening' | 'result' } | null>(null);
    const openingLock = useRef(false);
    const today = progress.openings.find((item) => item.date === date);
    const complete = progress.openings.length === keywords.length;
    async function openToday() {
        if (openingLock.current) return;
        openingLock.current = true;
        try {
            if (today) { router.push({ pathname: '/word/[id]', params: { id: today.keywordId } }); return; }
            const id = await open();
            if (id) setReveal({ id, phase: 'opening' });
        } finally { openingLock.current = false; }
    }
    function finishReveal() { setReveal((value) => value ? { ...value, phase: 'result' } : null); }
    if (reveal) return <Page>
      <Text style={styles.eyebrow}>A NEW PAGE IN YOUR COLLECTION</Text>
      {reveal.phase === 'opening' ? <Card>
        <Text style={styles.heading}>今日の扉が、ひらきます。</Text>
        <Capsule opening onFinish={finishReveal} />
        <Action title="演出をスキップ" secondary onPress={finishReveal} />
      </Card> : <Card>
        <Text style={styles.small}>今日、出会ったのは</Text>
        <Specimen id={reveal.id} />
        <Action title="解説を読む →" onPress={() => { const id = reveal.id; setReveal(null); router.push({ pathname: '/word/[id]', params: { id } }); }} />
        <Action title="地図で見る" secondary onPress={() => { const id = reveal.id; setReveal(null); router.navigate({ pathname: '/graph', params: { focus: id, fresh: String(Date.now()) } }); }} />
        <Action title="今日へ戻る" secondary onPress={() => setReveal(null)} />
      </Card>}
    </Page>;
    return <Page>
    <View style={{ gap: 8 }}><Text style={styles.eyebrow}>A LITTLE CURIOSITY, EVERY DAY</Text><Text style={styles.title}>KnowGacha</Text><Text style={styles.heading}>― 脳ガチャ ―</Text></View>
    <Text style={styles.body}>一日一つ、名前しか知らなかった世界を知る。</Text>
    {!ready ? <Card><ActivityIndicator />{!error && <Text style={styles.small}>言葉のノートを準備しています…</Text>}{error && <><Text accessibilityRole="alert" style={styles.body}>{error}</Text><Action title="読み込みを再試行" onPress={retry}/></>}</Card> : <>
      <Card>
        <Text style={styles.eyebrow}>{date.replaceAll('-', ' / ')}{__DEV__ && progress.dayOffset > 0 ? ' 〈開発用日付〉' : ''}</Text>
        {today ? <Specimen id={today.keywordId} /> : !complete ? <Capsule /> : <Text style={[styles.title, { textAlign: 'center' }]}>◇ ◎ ✳</Text>}
        {!today && <Text style={styles.heading}>{complete ? '三つの扉が、開きました。' : '今日は、どんな世界に出会う？'}</Text>}
        <Text style={styles.small}>{today ? '今日の一語は開封済みです。何度でも読み返せます。' : complete ? '試作教材は全3語です。開封履歴から、気になる言葉をもう一度。' : '技術、社会、芸術。未開封の言葉から一つをお届けします。'}</Text>
        {(!complete || today) && <Action title={busy ? '保存しています…' : today ? '今日の一語を読み返す' : '今日の一語を開く'} disabled={busy} onPress={() => { void openToday(); }}/>}
      </Card>
      {error && <Text accessibilityRole="alert" style={styles.body}>{error}</Text>}
      <View style={{ gap: 12 }}><Action title="知識の地図へ →" secondary onPress={() => router.navigate('/graph')} /><Text style={styles.small}>開いた言葉　{progress.openings.length} / {keywords.length}</Text><Action title="開封履歴を見る →" secondary onPress={() => router.push('/history')}/></View>
      {__DEV__ && <Card><Text style={styles.small}>開発用 · 日付の経過を試す</Text><Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { setReveal(null); void nextDay(); }}/><Action title="進捗を初期化する" secondary disabled={busy} onPress={() => Alert.alert('進捗を初期化しますか？', '開封履歴と開発用の日付を、この端末から消去します。', [{ text: 'キャンセル', style: 'cancel' }, { text: '初期化する', style: 'destructive', onPress: () => { setReveal(null); void reset(); } }])}/></Card>}
    </>}
    <Text style={styles.small}>PROTOTYPE · 全3語の原稿は試作用です。{'\n'}公開用の校閲・出典確認は未実施です。</Text>
  </Page>;
}
