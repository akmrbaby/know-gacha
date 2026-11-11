import { useState } from 'react';
import { Linking, Switch, View } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { supported } from '../notifications/badge-device';
import { useBadges } from '../state/BadgeProvider';
import { useProgress } from '../state/ProgressProvider';
import { badgeCounts } from '../notifications/badges';
import { spacing, useThemeColors } from '../theme';
import { NativeText } from './native-ui/NativeText';
import { Action } from './ui';
export function BadgeSettings(){
  const {t}=useI18n(),colors=useThemeColors();
  const {enabled,ready,busy,error,permission,configure,retry}=useBadges();
  const {progress,date,ready:progressReady}=useProgress();
  const [linkError,setLinkError]=useState(false);
  return <View style={{gap:spacing.sm}} testID="badge-settings">
    <NativeText variant="caption" accessibilityRole="header">アイコンの残り回数</NativeText>
    {!supported?<NativeText>残り回数のバッジはiPhone・iPadのアプリで利用できます。</NativeText>:<>
      <View style={{flexDirection:'row',alignItems:'center',gap:spacing.md,padding:spacing.md,backgroundColor:colors.surface,borderRadius:12}}>
        <NativeText style={{flex:1}}>アイコンに残り回数を表示</NativeText>
        <Switch accessibilityLabel={t('アイコンに残り回数を表示')} value={enabled} disabled={!ready||busy} trackColor={{true:colors.accent}} onValueChange={value=>{void configure(value);}} />
      </View>
      <NativeText variant="caption">当日分と初回特典の合計を表示します。0回ならバッジを消します。通知の許可が必要です。</NativeText>
      {enabled && permission.status==='granted' && progressReady && <NativeText accessibilityLiveRegion="polite">{`現在の残り回数：${badgeCounts(progress,date).current}回`}</NativeText>}
      <NativeText variant="caption">翌日分は音や本文のない予約で更新します。端末の状態によって反映が遅れる場合があります。</NativeText>
      {permission.status==='denied' && <Action title="端末の通知設定を開く" secondary onPress={()=>{setLinkError(false);void Linking.openSettings().catch(()=>setLinkError(true));}}/>}
      {linkError && <NativeText accessibilityRole="alert">端末の設定を開けませんでした。設定アプリから通知を確認してください。</NativeText>}
    </>}
    {error && <><NativeText accessibilityRole="alert">{error}</NativeText><Action title="もう一度試す" secondary disabled={busy} onPress={retry}/></>}
  </View>;
}
