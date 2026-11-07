import { Tabs } from 'expo-router';
import { AppIcon } from '../../components/native-ui/AppIcon';
import { useThemeColors } from '../../theme';
export default function TabLayout() {
  const colors = useThemeColors();
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.accent, tabBarInactiveTintColor: colors.secondaryText, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.separator } }}>
    <Tabs.Screen name="index" options={{ title: 'Gacha', tabBarIcon: ({ color }) => <AppIcon name="gacha" color={color} /> }} />
    <Tabs.Screen name="graph" options={{ title: 'Map', tabBarIcon: ({ color }) => <AppIcon name="map" color={color} /> }} />
  </Tabs>;
}
