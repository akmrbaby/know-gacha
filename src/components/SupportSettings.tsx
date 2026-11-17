import { router } from 'expo-router';
import { View } from 'react-native';
import { NavigationRow } from './native-ui/NavigationRow';
import { NativeText } from './native-ui/NativeText';
import { ExternalAction } from './ExternalAction';
import { legalLinks } from '../legal/config';
import { spacing } from '../theme';

export function SupportSettings(){
  return <View style={{gap:spacing.sm}} testID="support-settings">
    <NativeText variant="caption" accessibilityRole="header">サポートとプライバシー</NativeText>
    <NavigationRow title="プライバシーポリシー" onPress={()=>router.push('/privacy')}/>
    <NavigationRow title="お問い合わせ" onPress={()=>router.push('/contact')}/>
    <ExternalAction title="Apple標準利用許諾契約" url={legalLinks.appleEula}/>
  </View>;
}
