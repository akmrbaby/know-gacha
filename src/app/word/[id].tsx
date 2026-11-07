import { router, useLocalSearchParams } from 'expo-router';
import { Specimen } from '../../components/Specimen';
import { conceptName, relations } from '../../data/graph';
import { Text, View } from 'react-native';
import { Action, Card, Page, styles } from '../../components/ui';
import { findKeyword } from '../../data/keywords';
import { useProgress } from '../../state/ProgressProvider';
export default function Word() {
    const { id } = useLocalSearchParams<{
        id: string;
    }>();
    const { progress, ready } = useProgress();
    const word = findKeyword(id);
    if (!ready || !word || !progress.openings.some((item) => item.keywordId === id))
        return <Page><Text style={styles.heading}>まだ開封されていない言葉です。</Text><Action title="ホームへ" onPress={() => router.replace('/')}/></Page>;
    return <Page>
    <Specimen id={word.id} />
    <Card><Text style={styles.eyebrow}>まずは、ひとくち。</Text><Text selectable style={styles.body}>{word.summary}</Text></Card>
    <Card><Text style={styles.heading}>この言葉のまわり</Text>{relations.filter((edge) => edge.ownerId === word.id).map((edge) => <View key={edge.id} style={{ gap: 8 }}><Text style={styles.small}>{edge.label}</Text><Action title={`${conceptName(edge.sourceId === word.id ? edge.targetId : edge.sourceId)} →`} secondary onPress={() => router.navigate({ pathname: '/graph', params: { focus: edge.id, fresh: String(Date.now()) } })} /></View>)}</Card>
    <Text style={styles.heading}>もう少し、奥へ。</Text>
    {word.sections.map((section, index) => <View key={section.title} style={{ gap: 12 }}><Text style={styles.small}>0{index + 1}</Text><Text style={styles.heading}>{section.title}</Text><Text selectable style={styles.body}>{section.body}</Text></View>)}
    <Card><Text style={styles.small}>試作用原稿 · v0.1{'\n'}読書体験を検証するための原稿です。公開用の校閲・出典確認は未実施です。</Text></Card>
    <Action title="地図でつながりを見る" secondary onPress={() => router.navigate({ pathname: '/graph', params: { focus: word.id, fresh: String(Date.now()) } })} />
    <Action title="開封履歴へ" secondary onPress={() => router.push('/history')}/>
  </Page>;
}
