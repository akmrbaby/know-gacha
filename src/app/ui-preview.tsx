import { useI18n } from '../i18n/I18nProvider';
import { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { NativeAction } from '../components/native-ui/NativeAction';
import { NativeIconAction } from '../components/native-ui/NativeIconAction';
import { NativeText } from '../components/native-ui/NativeText';
import { NativeToolbar } from '../components/native-ui/NativeToolbar';
import { metrics, spacing, typography, useThemeColors, type ThemeMode } from '../theme';

const words = ['セレンディピティ', '認知バイアス', '創発'];

export default function UiPreview() {
  const {t}=useI18n();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [count, setCount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useState(false);
  const colors = useThemeColors(mode);
  const matches = words.filter((word) => t(word).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
    <Stack.Screen options={{ headerShown: false }} />
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <NativeAction mode={mode} title="戻る" variant="secondary" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} />
      <NativeText mode={mode} variant="title" accessibilityRole="header">知識のUI</NativeText>
      <NativeText mode={mode}>知識とそのつながりを、落ち着いて読める画面へ。</NativeText>
      <NativeAction mode={mode} variant="secondary" title={mode === 'light' ? '暗い配色で確認' : '明るい配色で確認'} onPress={() => setMode(mode === 'light' ? 'dark' : 'light')} />
      <View style={styles.section}>
        <NativeText mode={mode} variant="label">探索の操作バー</NativeText>
        <NativeToolbar mode={mode}>
          <NativeIconAction mode={mode} label={searching ? '検索を閉じる' : '知識を検索'} expanded={searching} onPress={() => { setSearching(!searching); setQuery(''); }}>
            <PreviewIcon name="search" color={colors.text} />
          </NativeIconAction>
          <NativeIconAction mode={mode} label={saved ? '保存を解除' : '知識を保存'} selected={saved} onPress={() => setSaved(!saved)}>
            <PreviewIcon name="bookmark" color={saved ? colors.accent : colors.text} />
          </NativeIconAction>
          <NativeIconAction mode={mode} label="検索条件をクリア" disabled={!query} onPress={() => setQuery('')}>
            <PreviewIcon name="close" color={colors.text} />
          </NativeIconAction>
        </NativeToolbar>
        {searching && <TextInput accessibilityLabel={t('検索する言葉')} value={query} onChangeText={setQuery}
          placeholder={t('言葉を入力')} placeholderTextColor={colors.secondaryText} selectionColor={colors.accent}
          returnKeyType="search" style={[styles.input, { color: colors.text, borderColor: colors.separator, backgroundColor: colors.surface }]} />}
        <NativeText mode={mode} selectable accessibilityLiveRegion="polite">{matches.length ? matches.join('・') : '一致する言葉はありません'}</NativeText>
        <NativeText mode={mode} variant="caption" accessibilityLiveRegion="polite">{saved ? '確認用の知識を保存しました' : '確認用の知識は未保存です'}</NativeText>
      </View>
      <View style={styles.section}>
        <NativeText mode={mode} variant="label">操作の優先度</NativeText>
        <NativeAction mode={mode} title="今日の知識をひらく" onPress={() => setCount((value) => value + 1)} />
        <NativeAction mode={mode} title="関連する知識を読む" variant="secondary" onPress={() => setCount((value) => value + 1)} />
        <NativeText mode={mode} variant="caption" accessibilityLiveRegion="polite">操作した回数：{count}</NativeText>
      </View>
      <View style={styles.section}>
        <NativeText mode={mode} variant="label">操作できない状態</NativeText>
        <NativeAction mode={mode} title="今日は開封済み" disabled onPress={() => setCount(count + 1)} />
        <NativeAction mode={mode} title="保存しています" loading onPress={() => setCount(count + 1)} />
      </View>
      <NativeText mode={mode}>長い言葉も、読みやすい大きさで。OSの文字サイズを大きくして、折り返しと操作のしやすさを確認できます。</NativeText>
      <NativeText mode={mode} variant="caption">この画面の操作は開封履歴を変更しません。</NativeText>
    </ScrollView>
  </SafeAreaView>;
}

// Temporary neutral SVGs let the preview use existing dependencies only.
function PreviewIcon({ name, color }: { name: 'search' | 'bookmark' | 'close'; color: string }) {
  return <Svg width={metrics.iconSize} height={metrics.iconSize} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={metrics.iconStroke} strokeLinecap="round" strokeLinejoin="round">
    {name === 'search' ? <><Circle cx="10" cy="10" r="6" /><Path d="M15 15 21 21" /></> : <Path d={name === 'bookmark' ? 'M6 3H18V21L12 17L6 21Z' : 'M6 6 18 18M18 6 6 18'} />}
  </Svg>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.lg },
  section: { gap: spacing.sm },
  input: { ...typography.body, minHeight: metrics.controlHeight, padding: spacing.sm, borderWidth: StyleSheet.hairlineWidth, borderRadius: metrics.radius, borderCurve: 'continuous' },
});
