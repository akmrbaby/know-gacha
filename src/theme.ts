import { useColorScheme, type TextStyle } from 'react-native';
import { colors } from './components/ui';

export const palettes = {
  light: { background: colors.paper, surface: colors.card, text: colors.ink, secondaryText: colors.muted, accent: colors.accent, separator: colors.line, onAccent: colors.card },
  dark: { background: '#171D1A', surface: '#222D27', text: '#F2F3EC', secondaryText: '#B4BFB5', accent: '#EFAD90', separator: '#46554A', onAccent: '#281B14' },
} as const;
export type ThemeColors = { [K in keyof typeof palettes.light]: string };
export type ThemeMode = keyof typeof palettes;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const metrics = { controlHeight: 48, iconSize: 24, iconStroke: 2, radius: 12, pressedOpacity: 0.7, disabledOpacity: 0.5 } as const;
export const typography = {
  title: { fontSize: 22, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  label: { fontSize: 17, fontWeight: '600' },
  caption: { fontSize: 15, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
export function useThemeColors(mode?: ThemeMode): ThemeColors {
  const scheme = useColorScheme();
  return palettes[mode ?? (scheme === 'dark' ? 'dark' : 'light')];
}
