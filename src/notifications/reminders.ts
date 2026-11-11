import { keywords } from '../data/keywords';
import { localDate, type Progress } from '../state/progress';
import type { Locale } from '../i18n/translate';

export const REMINDER_KEY = 'knowgacha.reminders.v1';
export const REMINDER_PREFIX = 'knowgacha.daily.v1:';
export const TEST_ID = 'knowgacha.reminder-test.v1';
export const HORIZON_DAYS = 30;
export type ReminderSettings = { version: 1; enabled: boolean; hour: number; minute: number };
export type Permission = { status: 'unknown' | 'undetermined' | 'granted' | 'denied' | 'unsupported'; canAskAgain: boolean };
export type Notice = { id: string; at: number; signature: string; title: string; body: string; kind: 'daily-reminder' | 'reminder-test' };
export type PendingNotice = { id: string; signature?: unknown };
export type SchedulePort = { list: () => Promise<PendingNotice[]>; cancel: (id: string) => Promise<void>; schedule: (notice: Notice) => Promise<void> };
export const defaultReminders = (): ReminderSettings => ({ version: 1, enabled: true, hour: 8, minute: 0 });

export function restoreReminders(raw: string | null): ReminderSettings {
  if (raw === null) return defaultReminders();
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || typeof value.enabled !== 'boolean' || !Number.isInteger(value.hour) || value.hour < 0 || value.hour > 23 || !Number.isInteger(value.minute) || value.minute < 0 || value.minute > 59) throw new Error('Invalid reminder settings');
  return { version: 1, enabled: value.enabled, hour: value.hour, minute: value.minute };
}

export function hasUnreadTopics(progress: Progress): boolean {
  const opened = new Set(progress.openings.map(item => item.keywordId));
  return keywords.some(word => !opened.has(word.id));
}

export function planReminders(settings: ReminderSettings, progress: Progress, locale: Locale, now = new Date()): Notice[] {
  if (!settings.enabled || !hasUnreadTopics(progress)) return [];
  const openedDates = new Set(progress.openings.map(item => item.date));
  const notices: Notice[] = [];
  for (let day = 0; day < HORIZON_DAYS; day++) {
    // Construct each local date separately so DST does not shift subsequent days.
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, settings.hour, settings.minute, 0, 0);
    const date = localDate(at);
    if (at.getTime() <= now.getTime() || openedDates.has(date)) continue;
    notices.push({ id: REMINDER_PREFIX + date, at: at.getTime(), signature: `2:${locale}:${at.getTime()}`, kind: 'daily-reminder',
      title: locale === 'ja' ? '今日も、知らなかった世界へ' : 'A new perspective awaits today',
      body: locale === 'ja' ? '新しい言葉との出会いが待っています。ガチャをひらいてみませんか。' : 'A new word is waiting. Open Gacha and discover a different field.' });
  }
  return notices;
}

export function testNotice(locale: Locale, now = new Date()): Notice {
  return { id: TEST_ID, at: now.getTime() + 5000, signature: 'test', kind: 'reminder-test',
    title: locale === 'ja' ? 'KnowGachaのテスト通知' : 'KnowGacha test notification',
    body: locale === 'ja' ? '通知が届きました。毎日の新しい出会いをお知らせします。' : 'Notifications are working. We will remind you of your daily discovery.' };
}

export function isReminder(id: string): boolean { return id.startsWith(REMINDER_PREFIX); }
export function isOurNotice(id: string): boolean { return isReminder(id) || id === TEST_ID; }

export async function reconcileReminders(port: SchedulePort, desired: Notice[], cancelTest = false) {
  const pending = await port.list();
  const wanted = new Map(desired.map(notice => [notice.id, notice]));
  for (const old of pending) {
    if ((isReminder(old.id) && (!wanted.has(old.id) || wanted.get(old.id)?.signature !== old.signature)) || (cancelTest && old.id === TEST_ID)) await port.cancel(old.id);
  }
  const existing = new Map(pending.map(notice => [notice.id, notice.signature]));
  for (const notice of desired) if (existing.get(notice.id) !== notice.signature) await port.schedule(notice);
}

// Continue after failures; every job reads current state when it reaches the queue.
export function createReminderQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return <T>(job: () => Promise<T>): Promise<T> => {
    const result = tail.then(job);
    tail = result.catch(() => undefined);
    return result;
  };
}

// Reminders and badge reservations share the OS scheduling budget.
export const notificationQueue = createReminderQueue();
