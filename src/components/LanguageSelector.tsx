import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { metrics, spacing, useThemeColors } from '../theme';
import { AppIcon } from './native-ui/AppIcon';
import { NativeText } from './native-ui/NativeText';

export function LanguageSelector() {
  const { locale, ready, error, setLocale } = useI18n();
  const colors = useThemeColors();
  return <View style={styles.section}>
    <NativeText variant="caption" accessibilityRole="header">言語</NativeText>
    <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
      {(['ja', 'en'] as const).map((code, index) => {
        const selected = locale === code;
        return <Pressable key={code} accessibilityRole="button" accessibilityLabel={code === 'ja' ? '日本語' : 'English'}
          accessibilityState={{ selected, disabled: !ready }} aria-pressed={selected} disabled={!ready}
          onPress={() => { void setLocale(code); }}
          style={({ pressed }) => [styles.choice, { borderTopWidth: index ? StyleSheet.hairlineWidth : 0, borderColor: colors.separator, opacity: !ready ? metrics.disabledOpacity : pressed ? metrics.pressedOpacity : 1 }]}>
          <Text style={[styles.name, { color: selected ? colors.accent : colors.text }]}>{code === 'ja' ? '日本語' : 'English'}</Text>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.check}>
            {selected && <AppIcon name="check" color={colors.accent} />}
          </View>
        </Pressable>;
      })}
    </View>
    {error && <NativeText accessibilityRole="alert">{error}</NativeText>}
  </View>;
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  group: { borderRadius: metrics.radius, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  choice: { minHeight: metrics.controlHeight, padding: spacing.md, gap: spacing.md, flexDirection: 'row', alignItems: 'center' },
  name: { flex: 1, fontSize: 17, lineHeight: 26 },
  check: { width: metrics.iconSize, alignItems: 'center' },
});
