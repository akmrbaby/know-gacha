import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { useThemeColors } from '../theme';
import { NativeText } from './native-ui/NativeText';
export function LanguageSelector(){
 const {locale,ready,error,setLocale}=useI18n();const colors=useThemeColors();
 return <View style={{gap:8}}>
  <View style={styles.row}><NativeText variant="caption">言語</NativeText>
   {(['ja','en'] as const).map(code=><Pressable key={code} accessibilityRole="button" accessibilityLabel={code==='ja'?'日本語':'English'} accessibilityState={{selected:locale===code,disabled:!ready}} disabled={!ready} onPress={()=>{void setLocale(code);}} style={[styles.choice,{backgroundColor:locale===code?colors.text:colors.surface,borderColor:colors.separator}]}>
    <Text style={{color:locale===code?colors.background:colors.text,fontSize:15,fontWeight:'600'}}>{code==='ja'?'日本語':'English'}</Text>
   </Pressable>)}
  </View>
  {error&&<NativeText accessibilityRole="alert">{error}</NativeText>}
 </View>;
}
const styles=StyleSheet.create({row:{flexDirection:'row',flexWrap:'wrap',gap:8,alignItems:'center'},choice:{minHeight:44,paddingHorizontal:16,justifyContent:'center',borderRadius:22,borderWidth:StyleSheet.hairlineWidth}});
