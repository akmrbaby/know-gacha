import { I18nProvider, useI18n } from '../i18n/I18nProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { LaunchIntro } from '../components/LaunchIntro';
import { ProgressProvider } from '../state/ProgressProvider';
function Navigation() {
  const {t,locale}=useI18n();
  const colors = useThemeColors();
  const dark = useColorScheme() === 'dark';
  const reduced = useReducedMotion();
  const navigation = dark ? DarkTheme : DefaultTheme;
  return <GestureHandlerRootView style={{ flex: 1 }}><ThemeProvider value={{ ...navigation, colors: { ...navigation.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.separator } }}>
    <ProgressProvider><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerBackTitle: t('戻る'), headerBackButtonDisplayMode: locale === 'en' ? 'minimal' : 'default', animation: reduced === false ? 'default' : 'none', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ title: t('ホーム'), headerShown: false }} />
      <Stack.Screen name="history" options={{ title: t('開封履歴') }} />
      <Stack.Screen name="word/[id]" options={{ title: t('言葉のノート') }} />
    </Stack><LaunchIntro /></ProgressProvider>
  </ThemeProvider></GestureHandlerRootView>;
}

export default function Layout(){return <I18nProvider><Navigation /></I18nProvider>;}
