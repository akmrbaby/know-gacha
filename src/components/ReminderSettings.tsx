import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { supported } from '../notifications/device';
import { hasUnreadTopics } from '../notifications/reminders';
import { useProgress } from '../state/ProgressProvider';
import { useReminders } from '../state/ReminderProvider';
import { metrics, spacing, useThemeColors } from '../theme';
import { NativeText } from './native-ui/NativeText';
import { ReminderTimeInput } from './ReminderTimeInput';
import { Action } from './ui';

export function ReminderSettings() {
  const { t, locale } = useI18n();
  const colors = useThemeColors();
  const { progress, ready: progressReady } = useProgress();
  const { settings, ready, busy, permission, error, tested, configure, retry, test } = useReminders();
  const [editing, setEditing] = useState(false), [linkError, setLinkError] = useState(false);
  const unavailable = !ready || busy;
  const denied = permission.status === 'denied';
  const time = new Date(Date.UTC(2000, 0, 1, settings.hour, settings.minute)).toLocaleTimeString(locale === 'ja' ? 'ja-JP' : 'en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  const status = !ready ? '通知設定を読み込んでいます…' : !settings.enabled ? 'リマインダーはオフです。' : permission.status === 'unknown' ? '端末の通知設定を確認しています…' : permission.status === 'undetermined' ? '通知の許可が必要です。' : denied ? '端末で通知が許可されていません。' : !progressReady ? '記録の読み込みを待っています。通知はまだ更新されていません。' : !hasUnreadTopics(progress) ? '今ある知識はすべて開封済みです。新しい知識が追加されるまで通知を休みます。' : '開封していない日に、一日一回お知らせします。';
  return <View style={{ gap: spacing.sm }} testID="reminder-settings">
    <NativeText variant="caption" accessibilityRole="header">毎日のリマインダー</NativeText>
    {!supported ? <NativeText>通知はインストールした端末アプリで利用できます。</NativeText> : <>
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.separator }]}>
        <View style={styles.row}>
          <NativeText style={{ flex: 1 }}>ガチャを思い出す通知</NativeText>
          <Switch accessibilityLabel={t('ガチャを思い出す通知')} value={settings.enabled} disabled={unavailable} trackColor={{ true: colors.accent }} onValueChange={enabled => { setEditing(false); void configure({ ...settings, enabled }); }} />
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={t('通知時刻を変更')} accessibilityState={{ disabled: unavailable }} disabled={unavailable}
          onPress={() => setEditing(true)} style={[styles.row, { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.separator, opacity: unavailable ? metrics.disabledOpacity : 1 }]}>
          <NativeText style={{ flex: 1 }}>通知時刻</NativeText><NativeText style={{ color: colors.accent }}>{time}</NativeText>
        </Pressable>
      </View>
      {editing && <ReminderTimeInput hour={settings.hour} minute={settings.minute} onCancel={() => setEditing(false)} onSave={(hour, minute) => { setEditing(false); void configure({ ...settings, hour, minute }); }} />}
      <NativeText variant="caption" accessibilityLiveRegion="polite">{status}</NativeText>
      <NativeText variant="caption">端末の時刻で通知します。集中モードや省電力設定により、遅れることがあります。</NativeText>
      {denied && <Action secondary title="端末の通知設定を開く" onPress={() => { setLinkError(false); void Linking.openSettings().catch(() => setLinkError(true)); }} />}
      {settings.enabled && permission.status === 'undetermined' && <Action title="通知を許可する" disabled={unavailable} onPress={() => { void configure(settings); }} />}
      {settings.enabled && permission.status === 'granted' && <Action secondary title="5秒後にテスト通知" disabled={unavailable} loading={busy} onPress={() => { void test(); }} />}
      {tested && <NativeText accessibilityLiveRegion="polite">5秒後にテスト通知を送ります。届かない場合は端末の通知設定を確認してください。</NativeText>}
      {linkError && <NativeText accessibilityRole="alert">端末の設定を開けませんでした。設定アプリから通知を確認してください。</NativeText>}
    </>}
    {error && <><NativeText accessibilityRole="alert">{error}</NativeText><Action secondary title="もう一度試す" disabled={busy} onPress={retry} /></>}
  </View>;
}
const styles = StyleSheet.create({
  group: { borderRadius: metrics.radius, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { minHeight: metrics.controlHeight, padding: spacing.md, gap: spacing.md, flexDirection: 'row', alignItems: 'center' },
});
