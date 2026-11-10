import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { spacing, useThemeColors } from '../theme';
import { Action } from './ui';

export function ReminderTimeInput({ hour, minute, onSave, onCancel }: { hour: number; minute: number; onSave: (hour: number, minute: number) => void; onCancel: () => void }) {
  const { locale, t } = useI18n();
  const colors = useThemeColors();
  const [value, setValue] = useState(() => new Date(2000, 0, 15, hour, minute));
  const android = Platform.OS === 'android';
  return <View style={{ gap: spacing.sm }}>
    <DateTimePicker value={value} mode="time" display={android ? 'default' : 'spinner'} locale={locale === 'ja' ? 'ja_JP' : 'en_US'} accentColor={colors.accent}
      positiveButton={{ label: t('保存する') }} negativeButton={{ label: t('キャンセル') }} onDismiss={onCancel}
      onValueChange={(_event, date) => { if (android) onSave(date.getHours(), date.getMinutes()); else setValue(date); }} />
    {!android && <><Action title="保存する" onPress={() => onSave(value.getHours(), value.getMinutes())} /><Action secondary title="キャンセル" onPress={onCancel} /></>}
  </View>;
}
