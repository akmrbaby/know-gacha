import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';
import { isOurNotice, isReminder, type Notice, type Permission, type SchedulePort } from './reminders';
import type { Locale } from '../i18n/translate';

export const supported = true;
const CHANNEL = 'daily-discovery';

// Normal reminders are unnecessary while the app is already open.
Notifications.setNotificationHandler({ handleNotification: async notification => {
  const show = notification.request.content.data?.kind === 'reminder-test' && isOurNotice(notification.request.identifier);
  return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: false, shouldSetBadge: false };
} });

export function normalizePermission(value: Notifications.NotificationPermissionsStatus): Permission {
  const ios = value.ios?.status;
  const granted = ios === undefined ? value.granted : [IosAuthorizationStatus.AUTHORIZED, IosAuthorizationStatus.PROVISIONAL, IosAuthorizationStatus.EPHEMERAL].includes(ios);
  return { status: granted ? 'granted' : value.status === 'undetermined' || ios === IosAuthorizationStatus.NOT_DETERMINED ? 'undetermined' : 'denied', canAskAgain: value.canAskAgain };
}
export async function getPermission(): Promise<Permission> { return normalizePermission(await Notifications.getPermissionsAsync()); }
export async function prepareChannel(locale: Locale) {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(CHANNEL, { name: locale === 'ja' ? '毎日のリマインダー' : 'Daily reminders', importance: AndroidImportance.DEFAULT, sound: 'default' });
}
export async function requestPermission(): Promise<Permission> {
  return normalizePermission(await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: true } }));
}
export const schedules: SchedulePort = {
  list: async () => (await Notifications.getAllScheduledNotificationsAsync()).map(item => ({ id: item.identifier, signature: item.content.data?.signature })),
  cancel: id => Notifications.cancelScheduledNotificationAsync(id),
  schedule: async (notice: Notice) => {
    await Notifications.scheduleNotificationAsync({ identifier: notice.id,
      content: { title: notice.title, body: notice.body, sound: 'default', data: { kind: notice.kind, signature: notice.signature } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(notice.at), channelId: CHANNEL, delivery: 'bestEffort' } });
  },
};
export async function dismissReminders() {
  for (const notification of await Notifications.getPresentedNotificationsAsync()) {
    if (isReminder(notification.request.identifier)) await Notifications.dismissNotificationAsync(notification.request.identifier);
  }
}
export function observeTaps(onTap: () => void): () => void {
  let last = '';
  function handle(response: Notifications.NotificationResponse | null) {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const request = response.notification.request;
    if (!isOurNotice(request.identifier) || !['daily-reminder', 'reminder-test'].includes(String(request.content.data?.kind))) return;
    const key = `${request.identifier}:${response.notification.date}`;
    if (last === key) return;
    last = key;
    onTap();
    Notifications.clearLastNotificationResponse();
  }
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  handle(Notifications.getLastNotificationResponse());
  return () => subscription.remove();
}
