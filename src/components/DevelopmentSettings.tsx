import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../i18n/I18nProvider';
import { useProgress } from '../state/ProgressProvider';
import { INITIAL_BONUS } from '../state/progress';
import { graphLabEnabled } from '../graph/lab';
import { spacing } from '../theme';
import { NavigationRow } from './native-ui/NavigationRow';
import { Action } from './ui';
export function DevelopmentSettings() {
 const {t}=useI18n();
 const {busy,reset,nextDay}=useProgress();
 const [development,setDevelopment]=useState(false);
 if (!graphLabEnabled) return null;
 return (        <View>
          <NavigationRow title={development ? '検証メニューを閉じる' : '検証メニュー'} onPress={() => setDevelopment(!development)} />
          {development && <View style={{paddingHorizontal: spacing.md, gap: spacing.sm}}>
            <NavigationRow title="知識グラフのデモ" description="5・10・50・100・500件" onPress={() => router.push('/graph-demo')} />
            <Action title={`初期${INITIAL_BONUS + 1}回からやり直す`} secondary disabled={busy} onPress={() => Alert.alert(t('初期状態からやり直しますか？'), t(`この端末の開封履歴と残り回数を初期化します。初回特典${INITIAL_BONUS}回＋当日分1回から確認できます。`), [{text:t('キャンセル'),style:'cancel'},{text:t('初期化する'),style:'destructive',onPress:()=>{void reset();}}])} />
            {__DEV__ && <>
              <Action title="翌日扱いにする" secondary disabled={busy} onPress={() => { void nextDay(); }} />
            </>}
          </View>}
        </View>);
}
