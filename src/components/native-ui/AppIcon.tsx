import { SymbolView } from 'expo-symbols';
import { type ColorValue } from 'react-native';
import { metrics, useThemeColors } from '../../theme';

const symbols = {
  list: { ios: 'list.bullet', android: 'format_list_bulleted', web: 'format_list_bulleted' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  minus: { ios: 'minus', android: 'remove', web: 'remove' },
  fit: { ios: 'arrow.up.left.and.arrow.down.right', android: 'fit_screen', web: 'fit_screen' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  map: { ios: 'point.3.connected.trianglepath.dotted', android: 'hub', web: 'hub' },
  gacha: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
  arrow: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  history: { ios: 'clock', android: 'history', web: 'history' },
  settings: { ios: 'gearshape', android: 'settings', web: 'settings' },
  check: { ios: 'checkmark', android: 'check', web: 'check' },
} as const;
export function AppIcon({ name, color }: { name: keyof typeof symbols; color?: ColorValue | null }) {
  const theme = useThemeColors();
  return <SymbolView name={symbols[name]} tintColor={color ?? theme.text} size={metrics.iconSize} style={{ width: metrics.iconSize, height: metrics.iconSize }} />;
}
