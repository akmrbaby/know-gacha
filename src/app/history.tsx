import { router } from 'expo-router';
import { NativeText } from '../components/native-ui/NativeText';
import { NavigationRow } from '../components/native-ui/NavigationRow';
import { Action, Page } from '../components/ui';
import { findKeyword } from '../data/keywords';
import { useProgress } from '../state/ProgressProvider';
export default function History() {
  const { progress, ready, error, retry } = useProgress();
  return <Page>
    {!ready ? <><NativeText>{error ?? '記録を読み込んでいます…'}</NativeText>{error && <Action title="読み込みを再試行" onPress={retry} />}</>
      : !progress.openings.length ? <><NativeText>まだ開封した知識はありません。</NativeText><Action title="今日の知識をひらく" onPress={() => router.replace('/')} /></>
        : <><NativeText variant="caption">開封した解説は、いつでも読み返せます。</NativeText>{[...progress.openings].reverse().map(item => {
          const word = findKeyword(item.keywordId)!;
          return <NavigationRow key={item.keywordId} title={word.name} description={`${item.date} · ${word.category}`} onPress={() => router.push({ pathname: '/word/[id]', params: { id: word.id } })} />;
        })}</>}
  </Page>;
}
