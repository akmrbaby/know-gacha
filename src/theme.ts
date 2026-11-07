import { useColorScheme, type TextStyle } from 'react-native';

// Kept as aliases for the graph lab and capsule artwork during migration.
export const legacyColors = { paper: '#F6F2E9', ink: '#263E36', muted: '#626B61', accent: '#9B4B31', card: '#FFFCF5', line: '#DDD9CC' };
export const palettes = {
  light: { background: legacyColors.paper, surface: legacyColors.card, text: legacyColors.ink, secondaryText: legacyColors.muted, accent: legacyColors.accent, separator: legacyColors.line, onAccent: legacyColors.card, map: '#F0F3EB', dot: '#CCD5CC', edge: '#587565', scrim: '#18362C55' },
  dark: { background: '#171D1A', surface: '#222D27', text: '#F2F3EC', secondaryText: '#B4BFB5', accent: '#EFAD90', separator: '#46554A', onAccent: '#281B14', map: '#18231D', dot: '#46554A', edge: '#A0B5A7', scrim: '#00000077' },
} as const;
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
