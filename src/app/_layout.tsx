import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { useThemeColors } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { LaunchIntro } from '../components/LaunchIntro';
import { ProgressProvider } from '../state/ProgressProvider';
export default function Layout() {
  const colors = useThemeColors();
  const dark = useColorScheme() === 'dark';
  const reduced = useReducedMotion();
  const navigation = dark ? DarkTheme : DefaultTheme;
  return <GestureHandlerRootView style={{ flex: 1 }}><ThemeProvider value={{ ...navigation, colors: { ...navigation.colors, background: colors.background, card: colors.surface, text: colors.text, primary: colors.accent, border: colors.separator } }}>
    <ProgressProvider><StatusBar style={dark ? 'light' : 'dark'} /><Stack screenOptions={{ headerBackTitle: '戻る', headerBackButtonDisplayMode: 'default', animation: reduced === false ? 'default' : 'none', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" options={{ title: 'ホーム', headerShown: false }} />
      <Stack.Screen name="history" options={{ title: '開封履歴' }} />
      <Stack.Screen name="word/[id]" options={{ title: '言葉のノート' }} />
    </Stack><LaunchIntro /></ProgressProvider>
  </ThemeProvider></GestureHandlerRootView>;
}
