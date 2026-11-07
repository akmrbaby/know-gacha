import { useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { legacyColors, metrics, palettes, spacing, typography, useThemeColors, type ThemeColors } from '../theme';
import { NativeAction } from './native-ui/NativeAction';
export const colors = legacyColors;
function makeStyles(theme: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    page: { padding: spacing.md, gap: spacing.lg, width: '100%', maxWidth: 680, alignSelf: 'center', paddingBottom: spacing.xl },
    eyebrow: { ...typography.caption, fontWeight: '600', color: theme.accent },
    title: { ...typography.title, color: theme.text },
    heading: { ...typography.label, color: theme.text },
    body: { ...typography.body, lineHeight: 29, color: theme.text },
    small: { ...typography.caption, lineHeight: 24, color: theme.secondaryText },
    card: { backgroundColor: theme.surface, borderRadius: metrics.radius, borderCurve: 'continuous', padding: spacing.md, gap: spacing.md },
  });
}
export const styles = makeStyles(palettes.light);
export function useUI() {
  const theme = useThemeColors();
  return useMemo(() => ({ theme, styles: makeStyles(theme) }), [theme]);
}
export function Page({ children }: { children: ReactNode }) {
  const { styles } = useUI();
  return <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.page}>{children}</ScrollView></SafeAreaView>;
}
export function Action({ title, onPress, disabled = false, secondary = false, loading = false }: {
  title: string; onPress: () => void; disabled?: boolean; secondary?: boolean; loading?: boolean;
}) {
  return <NativeAction title={title} onPress={onPress} disabled={disabled} loading={loading} variant={secondary ? 'secondary' : 'primary'} />;
}
export function Card({ children }: { children: ReactNode }) {
  const { styles } = useUI();
  return <View style={styles.card}>{children}</View>;
}
