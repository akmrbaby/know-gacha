import { useColorScheme, type TextStyle } from 'react-native';

import { palettes } from './colors';
export { palettes } from './colors';
// Compatibility aliases for older presentation helpers.
export const legacyColors = { paper: palettes.light.background, ink: palettes.light.text, muted: palettes.light.secondaryText, accent: palettes.light.accent, card: palettes.light.surface, line: palettes.light.separator };
export type ThemeColors = { [K in keyof typeof palettes.light]: string };
export type ThemeMode = keyof typeof palettes;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const metrics = { controlHeight: 48, iconSize: 24, iconStroke: 2, radius: 12, pressedOpacity: 0.7, disabledOpacity: 0.5 } as const;
export const typography = {
  title: { fontSize: 22, lineHeight: 30, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 28, fontWeight: '400' },
  label: { fontSize: 17, lineHeight: 24, fontWeight: '600' },
  caption: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;
export function useThemeColors(mode?: ThemeMode): ThemeColors {
  const scheme = useColorScheme();
  return palettes[mode ?? (scheme === 'dark' ? 'dark' : 'light')];
}
