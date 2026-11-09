import { router } from 'expo-router';
import { AppIcon } from './native-ui/AppIcon';
import { NativeIconAction } from './native-ui/NativeIconAction';

export function SettingsAction() {
  return <NativeIconAction label="設定を開く" onPress={() => router.push('/settings')}>
    <AppIcon name="settings" />
  </NativeIconAction>;
}
