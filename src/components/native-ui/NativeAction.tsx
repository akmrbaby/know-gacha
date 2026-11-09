import { useI18n } from '../../i18n/I18nProvider';
import { ActivityIndicator, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { metrics, spacing, useThemeColors, type ThemeMode } from '../../theme';
import { NativeText } from './NativeText';

export function NativeAction({ title, onPress, variant = 'primary', disabled = false, loading = false, mode, style }: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  mode?: ThemeMode;
  style?: StyleProp<ViewStyle>;
}) {
  const {t}=useI18n();
  const colors = useThemeColors(mode);
  const unavailable = disabled || loading;
  const foreground = variant === 'primary' ? colors.onAccent : colors.text;
  return <Pressable accessibilityRole="button" accessibilityLabel={t(title)}
    accessibilityState={{ disabled: unavailable, busy: loading }} aria-busy={loading} disabled={unavailable} onPress={onPress}
    style={({ pressed }) => [styles.control, { backgroundColor: variant === 'primary' ? colors.accent : colors.surface, opacity: disabled ? metrics.disabledOpacity : pressed ? metrics.pressedOpacity : 1 }, style]}>
    {loading && <ActivityIndicator color={foreground} />}
    <NativeText mode={mode} variant="label" style={{ color: foreground, textAlign: 'center', flexShrink: 1 }}>{title}</NativeText>
  </Pressable>;
}
const styles = StyleSheet.create({
  control: { minHeight: metrics.controlHeight, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm, borderRadius: metrics.radius, borderCurve: 'continuous', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});
