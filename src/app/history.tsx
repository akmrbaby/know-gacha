import { router } from 'expo-router';
import { Text } from 'react-native';
import { Action, Card, Page, styles } from '../components/ui';
import { findKeyword } from '../data/keywords';
import { useProgress } from '../state/ProgressProvider';
export default function History() {
    const { progress, ready } = useProgress();
    return <Page><Text style={styles.eyebrow}>YOUR LITTLE COLLECTION</Text><Text style={styles.title}>出会った言葉</Text><Text style={styles.small}>開封した解説は、いつでもここから。</Text>
    {!ready ? <Text style={styles.body}>ホームで記録を読み込んでください。</Text> : !progress.openings.length ? <Card><Text style={styles.heading}>まだ、まっさらなノート。</Text><Text style={styles.body}>今日の一語を開くと、ここに言葉が並びます。</Text><Action title="ホームへ" onPress={() => router.replace('/')}/></Card> : [...progress.openings].reverse().map((item) => {
            const word = findKeyword(item.keywordId)!;
            return <Card key={item.keywordId}><Text style={styles.small}>{item.date} 開封 · {word.category}</Text><Text style={styles.heading}>{word.name}</Text><Text style={styles.body}>{word.introduction}</Text><Action title="解説を読む →" secondary onPress={() => router.push({ pathname: '/word/[id]', params: { id: word.id } })}/></Card>;
        })}
  </Page>;
}
