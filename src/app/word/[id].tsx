import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Specimen } from '../../components/Specimen';
import { NativeText } from '../../components/native-ui/NativeText';
import { NavigationRow } from '../../components/native-ui/NavigationRow';
import { conceptName, relations } from '../../data/graph';
import { Action, Page } from '../../components/ui';
import { findKeyword } from '../../data/keywords';
import { useProgress } from '../../state/ProgressProvider';
import { spacing } from '../../theme';
export default function Word() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { progress, ready, error, retry } = useProgress();
  const word = findKeyword(id);
  if (!ready) return <Page><NativeText>{error ?? '知識を読み込んでいます…'}</NativeText>{error && <Action title="読み込みを再試行" onPress={retry} />}</Page>;
  if (!word || !progress.openings.some(item => item.keywordId === id)) return <Page><NativeText>まだ開封されていない言葉です。</NativeText><Action title="ホームへ" onPress={() => router.replace('/')} /></Page>;
  return <Page>
    <Stack.Screen options={{ title: word.name }} />
    <Specimen id={word.id} />
    <NativeText selectable>{word.summary}</NativeText>
    {word.sections.map(section => <View key={section.title} style={{ gap: spacing.sm }}><NativeText variant="label" accessibilityRole="header">{section.title}</NativeText><NativeText selectable>{section.body}</NativeText></View>)}
    <View>
      <NativeText variant="label" accessibilityRole="header">この言葉のつながり</NativeText>
      {relations.filter(edge => edge.ownerId === word.id).map(edge => <NavigationRow key={edge.id} title={conceptName(edge.sourceId === word.id ? edge.targetId : edge.sourceId)} description={edge.label} onPress={() => router.navigate({ pathname: '/graph', params: { focus: edge.id, fresh: String(Date.now()) } })} />)}
    </View>
    {word.evidence && <View style={{gap:spacing.sm}}><NativeText variant="label">参考資料</NativeText>{word.evidence.map(item => <NativeText key={item.url} selectable>{item.title}{'\n'}{item.url}</NativeText>)}</View>}
    <NativeText variant="caption">試作用原稿 · 公開用の校閲・出典確認は未実施です。</NativeText>
    <NavigationRow title="地図でつながりを見る" onPress={() => router.navigate({ pathname: '/graph', params: { focus: word.id, fresh: String(Date.now()) } })} />
    <NavigationRow title="開封履歴" onPress={() => router.push('/history')} />
  </Page>;
}
