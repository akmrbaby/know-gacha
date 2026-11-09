import { Text } from '../../i18n/Text';
import { type TextProps } from 'react-native';
import { typography, useThemeColors, type ThemeMode } from '../../theme';

export function NativeText({ variant = 'body', mode, style, ...props }: TextProps & {
  variant?: keyof typeof typography;
  mode?: ThemeMode;
}) {
  const colors = useThemeColors(mode);
  return <Text {...props} style={[typography[variant], { color: variant === 'caption' ? colors.secondaryText : colors.text }, style]} />;
}
