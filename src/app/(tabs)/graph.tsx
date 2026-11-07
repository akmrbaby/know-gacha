import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Action, Card, Page, colors, styles } from '../../components/ui';
import { GraphCanvas } from '../../components/GraphCanvas';
import { conceptName, ownerOf, relatedConcepts, relations, visibleGraph } from '../../data/graph';
import { findKeyword } from '../../data/keywords';
import { useProgress } from '../../state/ProgressProvider';

export default function GraphScreen() {
  const { progress, ready } = useProgress();
  const { focus, fresh } = useLocalSearchParams<{ focus?: string; fresh?: string }>();
  const graph = visibleGraph(progress.openings.map((item) => item.keywordId));
  const requested = typeof focus === 'string' ? focus : '';
  const valid = graph.ids.includes(requested) || graph.edges.some((edge) => edge.id === requested);
  const initial = valid ? requested : progress.openings.at(-1)?.keywordId ?? '';
  if (!ready || !initial) return <Page><Text style={styles.eyebrow}>YOUR CURIOSITY ATLAS</Text><Text style={styles.title}>ここから、小さな地図。</Text><Card><Text style={styles.body}>最初の一語を開くと、ここに言葉とつながりが生まれます。</Text><Action title="今日の一語へ" onPress={() => router.navigate('/')} /></Card></Page>;
  // Remount only for an explicit navigation request or changed collection, not for ordinary selection.
  return <Atlas key={`${initial}:${fresh ?? ''}:${graph.ids.join(',')}`} initial={initial} graph={graph} />;
}
function Atlas({ initial, graph }: { initial: string; graph: ReturnType<typeof visibleGraph> }) {
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [selected, setSelected] = useState(initial);
  const [focus, setFocus] = useState(() => relations.find((edge) => edge.id === initial)?.ownerId ?? ownerOf(initial)!);
  const [cameraVersion, setCameraVersion] = useState(0);
  const edge = graph.edges.find((item) => item.id === selected);
  const word = findKeyword(selected);
  const related = relatedConcepts.find((item) => item.id === selected);
  const reference = related ?? (edge ? relatedConcepts.find((item) => item.id === edge.sourceId || item.id === edge.targetId) : undefined);
  const connected = graph.edges.filter((item) => item.sourceId === selected || item.targetId === selected);
  function choose(id: string, center = false) {
    setSelected(id);
    if (center) { setFocus(relations.find((item) => item.id === id)?.ownerId ?? id); setCameraVersion((value) => value + 1); }
  }
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.paper }} edges={['left', 'right']}>
    <View style={{ paddingHorizontal: 20, paddingVertical: 12, gap: 10 }}>
      <Text style={styles.eyebrow}>出会った言葉と、そのまわり</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={{ flex: 1 }}><Action title={mode === 'map' ? '● 地図' : '地図'} secondary={mode !== 'map'} onPress={() => setMode('map')} /></View>
        <View style={{ flex: 1 }}><Action title={mode === 'list' ? '● 一覧' : '一覧'} secondary={mode !== 'list'} onPress={() => setMode('list')} /></View>
      </View>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 0, gap: 16 }}>
      {mode === 'map' ? <GraphCanvas key={`${focus}:${cameraVersion}`} ids={graph.ids} edges={graph.edges} focusId={focus} selected={selected} onSelect={(id) => choose(id)} /> : graph.ids.filter((id) => findKeyword(id)).map((id) => <Card key={id}>
        <Action title={`${conceptName(id)} · 開封済み`} secondary onPress={() => choose(id, true)} />
        {graph.edges.filter((item) => item.ownerId === id).map((item) => <View key={item.id} style={{ gap: 8 }}><Text style={styles.small}>{conceptName(item.sourceId)} → {conceptName(item.targetId)}</Text><Action title={item.label} secondary onPress={() => choose(item.id, true)} /><Action title={`${conceptName(item.sourceId === id ? item.targetId : item.sourceId)} · 周辺語`} secondary onPress={() => choose(item.sourceId === id ? item.targetId : item.sourceId, true)} /></View>)}
      </Card>)}
    </ScrollView>
    <View style={{ maxHeight: '34%', minHeight: 170, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 20, paddingVertical: 14 }}>
      <ScrollView contentContainerStyle={{ gap: 12 }} accessibilityLiveRegion="polite">
        <Text style={styles.eyebrow}>{edge ? '言葉をつなぐ理由' : word ? '開封済み教材' : '周辺語 · いつでも読めます'}</Text>
        <Text accessibilityRole="header" style={styles.heading}>{edge ? `${conceptName(edge.sourceId)} → ${conceptName(edge.targetId)}` : conceptName(selected) || '言葉や線を選んでみましょう'}</Text>
        {edge && <Text style={styles.small}>{edge.label}</Text>}
        <Text selectable style={styles.body}>{edge?.explanation ?? word?.introduction ?? related?.summary ?? '地図や一覧から選ぶと、ここに説明が表示されます。'}</Text>
        {word && <Action title="解説を読む →" onPress={() => router.push({ pathname: '/word/[id]', params: { id: word.id } })} />}
        {edge && <View style={{ gap: 8 }}><Action title={`${conceptName(edge.sourceId)}を見る`} secondary onPress={() => choose(edge.sourceId, true)} /><Action title={`${conceptName(edge.targetId)}を見る`} secondary onPress={() => choose(edge.targetId, true)} /></View>}
        {connected.map((item) => <Action key={item.id} title={`つながり：${item.label}`} secondary onPress={() => choose(item.id)} />)}
        {reference && <Link href={reference.sourceUrl} style={[styles.small, { textDecorationLine: 'underline' }]}>参考資料を開く ↗</Link>}
        <Action title="選択を解除" secondary onPress={() => setSelected('')} />
        <Text style={styles.small}>周辺語・関係の説明は試作用原稿です。公開用の校閲は未実施です。</Text>
      </ScrollView>
    </View>
  </SafeAreaView>;
}
