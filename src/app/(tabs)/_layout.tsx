import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { colors } from '../../components/ui';
export default function TabLayout() {
  return <Tabs screenOptions={{ headerShown: false, headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false, tabBarActiveTintColor: colors.ink, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.line }, tabBarLabelStyle: { fontSize: 12 } }}>
    <Tabs.Screen name="index" options={{ title: 'Gacha', tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>▤</Text> }} />
    <Tabs.Screen name="graph" options={{ title: 'Map', tabBarIcon: ({ color }) => <Text style={{ fontSize: 24, color }}>⌘</Text> }} />
  </Tabs>;
}
