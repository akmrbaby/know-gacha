import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { metrics, useThemeColors, type ThemeMode } from '../../theme';

export function NativeIconAction({ label, children, onPress, selected, expanded, disabled = false, mode, style }: {
  label: string;
  children: ReactNode;
  onPress: () => void;
  selected?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  mode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useThemeColors(mode);
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ disabled, selected, expanded }} aria-pressed={selected} aria-expanded={expanded} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.control, {
      backgroundColor: colors.surface,
      borderColor: selected ? colors.accent : colors.surface,
      opacity: disabled ? metrics.disabledOpacity : pressed ? metrics.pressedOpacity : 1,
    }, style]}>
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
      {children}
    </View>
  </Pressable>;
}

const styles = StyleSheet.create({
  control: { minWidth: metrics.controlHeight, minHeight: metrics.controlHeight, borderWidth: metrics.iconStroke, borderRadius: metrics.radius, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
});
