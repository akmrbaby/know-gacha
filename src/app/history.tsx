import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { NativeText } from '../components/native-ui/NativeText';
import { NavigationRow } from '../components/native-ui/NavigationRow';
import { Action, Page } from '../components/ui';
import { findKeyword } from '../data/keywords';
import { translate } from '../i18n/translate';
import { useI18n } from '../i18n/I18nProvider';
import { useProgress } from '../state/ProgressProvider';
import { spacing, useThemeColors } from '../theme';
export default function History() {
  const { progress, date, ready, error, retry } = useProgress();
  const {t}=useI18n();
  const colors=useThemeColors();
  const [query,setQuery]=useState('');
  const search=query.trim().toLocaleLowerCase();
  const items=[...progress.openings].reverse().filter(item=>{
    const word=findKeyword(item.keywordId)!;
    return [word.name,word.category,translate(word.name,'en'),translate(word.category,'en')].some(text=>text.toLocaleLowerCase().includes(search));
  });
  return <Page>
    {!ready ? <><NativeText>{error ?? '記録を読み込んでいます…'}</NativeText>{error && <Action title="読み込みを再試行" onPress={retry} />}</>
      : !progress.openings.length ? <><NativeText>まだ開封した知識はありません。</NativeText><Action title="今日の知識をひらく" onPress={() => router.replace('/')} /></>
        : <>
          <TextInput accessibilityLabel={t('知識を検索')} placeholder={t('語や分野で検索')} placeholderTextColor={colors.secondaryText} value={query} onChangeText={setQuery} autoCorrect={false} style={{color:colors.text,backgroundColor:colors.surface,borderColor:colors.separator,borderWidth:1,borderRadius:14,padding:16,fontSize:16,minHeight:52}} clearButtonMode="while-editing" />
          {!items.length && <><NativeText>一致する知識がありません。</NativeText><Action title="検索をクリア" secondary onPress={()=>setQuery('')}/></>}
          {items.map((item,i)=>{
            const word=findKeyword(item.keywordId)!;
            return <View key={item.keywordId} style={{gap:spacing.sm}}>
              {(i===0 || items[i-1].date!==item.date) && <NativeText variant="caption">{item.date===date?'今日':item.date}</NativeText>}
              <NavigationRow title={word.name} description={word.category} onPress={()=>router.push({pathname:'/word/[id]',params:{id:word.id}})}/>
              <NativeText numberOfLines={2} variant="caption">{word.introduction}</NativeText>
            </View>;
          })}
        </>}
  </Page>;
}
