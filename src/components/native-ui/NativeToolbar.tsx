import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { metrics, spacing, useThemeColors, type ThemeMode } from '../../theme';
import { useReduceTransparency } from '../../hooks/useReduceTransparency';

// Placed outside the canvas gesture detector; body text uses opaque surfaces.
export function NativeToolbar({ children, mode, style }: {
  children: ReactNode; mode?: ThemeMode; style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors(mode);
  const reduced = useReduceTransparency();
  const glass = process.env.EXPO_OS === 'ios' && !reduced && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  return <View style={[styles.surface, !glass && { backgroundColor: colors.surface }, style]}>
    {glass && <GlassView pointerEvents="none" colorScheme={mode ?? 'auto'} glassEffectStyle="regular" style={StyleSheet.absoluteFill} />}
    {children}
  </View>;
}
const styles = StyleSheet.create({
  surface: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, padding: spacing.xs, borderRadius: metrics.radius, borderCurve: 'continuous', overflow: 'hidden' },
});
