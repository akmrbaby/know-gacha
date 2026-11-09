import { View } from 'react-native';
import { Link } from 'expo-router';
import { sourceLanguage } from '../i18n/translate';
import { NativeText } from './native-ui/NativeText';
import { useUI } from './ui';
export function ReferenceLink({title,url}:{title:string;url:string}){
 const {styles}=useUI();const language=sourceLanguage(url);
 return <View style={{gap:4}}><Link href={url} style={[styles.body,{textDecorationLine:'underline',paddingVertical:8}]}>{title} ↗</Link>{language&&<NativeText variant="caption">{language==='ja'?'日本語の資料':'英語の資料'}</NativeText>}</View>;
}
