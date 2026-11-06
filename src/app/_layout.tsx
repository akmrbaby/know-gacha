import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../components/ui';
import { ProgressProvider } from '../state/ProgressProvider';
export default function Layout() {
    return <ProgressProvider><StatusBar style="dark"/><Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false, contentStyle: { backgroundColor: colors.paper } }}><Stack.Screen name="index" options={{ title: '今日の一語' }}/><Stack.Screen name="history" options={{ title: '開封履歴' }}/><Stack.Screen name="word/[id]" options={{ title: '言葉のノート' }}/></Stack></ProgressProvider>;
}
