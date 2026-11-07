import { Pressable, StyleSheet, View } from 'react-native';
import { metrics, spacing, useThemeColors } from '../../theme';
import { AppIcon } from './AppIcon';
import { NativeText } from './NativeText';

export function NavigationRow({ title, description, onPress }: { title: string; description?: string; onPress: () => void }) {
  const colors = useThemeColors();
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, { borderBottomColor: colors.separator, backgroundColor: pressed ? colors.surface : 'transparent' }]}>
    <View style={styles.content}><NativeText variant="label">{title}</NativeText>{description && <NativeText variant="caption">{description}</NativeText>}</View>
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden><AppIcon name="arrow" color={colors.secondaryText} /></View>
  </Pressable>;
}
const styles = StyleSheet.create({
  row: { minHeight: metrics.controlHeight, paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  content: { flex: 1, gap: spacing.xs },
});
