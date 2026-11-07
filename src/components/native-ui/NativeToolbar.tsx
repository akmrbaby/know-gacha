import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { metrics, spacing, useThemeColors, type ThemeMode } from '../../theme';

// This surface owns no map gestures: callers position it outside the canvas.
export function NativeToolbar({ children, mode, style }: {
  children: ReactNode;
  mode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors(mode);
  return <View style={[styles.surface, { backgroundColor: colors.surface }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  surface: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: metrics.radius, borderCurve: 'continuous' },
});
