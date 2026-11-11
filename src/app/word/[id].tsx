import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useI18n } from '../../i18n/I18nProvider';
import { ReferenceLink } from '../../components/ReferenceLink';
import { Capsule } from '../../components/Capsule';
import { baseGraph } from '../../knowledge/base';
import { Specimen } from '../../components/Specimen';
import { NativeText } from '../../components/native-ui/NativeText';
import { NavigationRow } from '../../components/native-ui/NavigationRow';
import { conceptName, relations } from '../../data/graph';
import { Action, Page } from '../../components/ui';
import { findKeyword } from '../../data/keywords';
import { availability } from '../../graph/availability';
import { useProgress } from '../../state/ProgressProvider';
import { spacing } from '../../theme';

export default function Word() {
  const { id, opening } = useLocalSearchParams<{ id: string; opening?: string }>();
  return <Article key={`${id}:${opening ?? ''}`} id={id} opening={!!opening} />;
}
function Article({id,opening}:{id:string;opening:boolean}) {
  const {t}=useI18n();
  const { progress, date, ready, busy, error, retry, open } = useProgress();
  const [animating,setAnimating]=useState(opening);
  const [canDraw,setCanDraw]=useState(false);
  const lock=useRef(false);
  const word=findKeyword(id);
  const {remaining,exhausted}=availability(progress,date);
  useEffect(()=>{
    if(animating)return;
    const timer=setTimeout(()=>setCanDraw(true),350);
    return()=>clearTimeout(timer);
  },[animating]);
  function finish(){setAnimating(false);if(word)AccessibilityInfo.announceForAccessibility(t(word.name));}
  async function draw(){
    if(lock.current || !canDraw || busy || !remaining)return;
    lock.current=true;
    try {const next=await open();if(next)router.navigate({pathname:'/',params:{focus:'',reveal:next,fresh:String(Date.now())}});}
    finally{lock.current=false;}
  }
  if (!ready) return <Page><NativeText>{error ?? '知識を読み込んでいます…'}</NativeText>{error && <Action title="読み込みを再試行" onPress={retry} />}</Page>;
  if (!word || !progress.openings.some(item => item.keywordId === id)) return <Page><NativeText>まだ開封されていない言葉です。</NativeText><Action title="ホームへ" onPress={() => router.replace('/')} /></Page>;
  return <>
    <Stack.Screen options={{title:t(opening ? '今日の知識' : '言葉のノート'), ...(opening ? {headerLeft:()=> <Action title="Mapへ" secondary onPress={()=>router.navigate('/')} />} : {})}} />
    {animating ? <Page><View testID="discovery-opening" style={{alignItems:'center',paddingVertical:spacing.xl,gap:spacing.lg}}><Capsule opening onFinish={finish}/><NativeText>知識をひらいています</NativeText><Action title="演出をスキップ" secondary onPress={finish}/></View></Page> : <Page>
      <View testID="knowledge-article" style={{gap:spacing.lg}}>
        <Specimen id={word.id} compact />
        <NativeText selectable>{word.summary}</NativeText>
        {word.sections.map(section => <View key={section.title} style={{ gap: spacing.sm }}><NativeText variant="label" accessibilityRole="header">{section.title}</NativeText><NativeText selectable>{section.body}</NativeText></View>)}
        <View>
          <NativeText variant="label" accessibilityRole="header">この言葉のつながり</NativeText>
          {relations.filter(edge => edge.ownerId === word.id).filter(edge=>{
            const other=edge.sourceId===id?edge.targetId:edge.sourceId;
            return baseGraph.nodes[other]?.kind==='concept' || progress.openings.some(item=>item.keywordId===other);
          }).map(edge => <NavigationRow key={edge.id} title={conceptName(edge.sourceId === word.id ? edge.targetId : edge.sourceId)} description={edge.label} onPress={() => router.navigate({ pathname: '/', params: { reveal:'', focus: edge.id, fresh: String(Date.now()) } })} />)}
        </View>
        <View style={{gap:spacing.sm}}><NativeText variant="label">参考資料</NativeText>{baseGraph.nodes[word.id].evidence.map(item => <ReferenceLink key={item.url} title={item.title} url={item.url} />)}</View>
        <NativeText variant="caption">試作用原稿 · 公開用の校閲・出典確認は未実施です。</NativeText>
        <Action title="Mapで見る" onPress={() => router.navigate({ pathname: '/', params: { reveal:'', focus: word.id, fresh: String(Date.now()) } })} />
        {!exhausted && remaining>0 && <Action title={`ガチャをひく（あと${remaining}回）`} secondary disabled={!canDraw} loading={busy} onPress={()=>{void draw();}}/>}
        {error && <NativeText accessibilityRole="alert">{error}</NativeText>}
      </View>
    </Page>}
  </>;
}
