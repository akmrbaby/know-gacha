import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import * as device from '../notifications/device';
import { notificationQueue, defaultReminders, planReminders, reconcileReminders, REMINDER_KEY, restoreReminders, testNotice, type Permission, type ReminderSettings } from '../notifications/reminders';
import { useProgress } from './ProgressProvider';

type State = { settings: ReminderSettings; ready: boolean; busy: boolean; error: string | null; tested: boolean; permission: Permission;
  configure: (next: ReminderSettings) => Promise<void>; retry: () => void; test: () => Promise<void> };
const Context = createContext<State | null>(null);
export function ReminderProvider({ children }: { children: ReactNode }) {
  const { progress, ready: progressReady, date } = useProgress();
  const { locale, ready: localeReady } = useI18n();
  const [settings, setSettings] = useState(defaultReminders);
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [tested, setTested] = useState(false);
  const [permission, setPermission] = useState<Permission>({ status: device.supported ? 'unknown' : 'unsupported', canAskAgain: false });
  const [error, setError] = useState<string | null>(null);
  const current = useRef({ settings, progress, locale, ready, progressReady, localeReady });
  useLayoutEffect(() => { current.current = { settings, progress, locale, ready, progressReady, localeReady }; }, [settings, progress, locale, ready, progressReady, localeReady]);
  const queue = useRef(notificationQueue);
  const locked = useRef(false);
  const load = useCallback(() => {
    return AsyncStorage.getItem(REMINDER_KEY).then(raw => {
      const restored = restoreReminders(raw);
      setSettings(restored); setReady(true); setError(null);
    }).catch(() => { setError('通知設定を読み込めませんでした。保存済みの設定は変更していません。'); });
  }, []);
  useEffect(() => { void load(); }, [load]);

  const synchronize = useCallback(async () => {
    const state = current.current;
    if (!device.supported || !state.ready || !state.localeReady) return;
    if (!state.settings.enabled) {
      await reconcileReminders(device.schedules, [], true);
      await device.dismissReminders();
      setPermission(await device.getPermission()); setError(null);
      return;
    }
    const allowed = await device.getPermission();
    setPermission(allowed);
    // An explicit opt-out or revoked permission must work even if progress fails to load.
    if (state.settings.enabled && allowed.status === 'granted' && !state.progressReady) return;
    const enabled = state.settings.enabled && allowed.status === 'granted';
    if (enabled) await device.prepareChannel(state.locale);
    await reconcileReminders(device.schedules, enabled ? planReminders(state.settings, state.progress, state.locale) : [], !enabled);
    await device.dismissReminders();
    setError(null);
  }, []);
  const refresh = useCallback(() => {
    void queue.current(synchronize).catch(() => setError('通知を設定できませんでした。もう一度お試しください。'));
  }, [synchronize]);
  useEffect(() => { refresh(); }, [ready, progressReady, localeReady, progress, locale, date, refresh]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => subscription.remove();
  }, [refresh]);

  async function configure(next: ReminderSettings) {
    if (!device.supported || !ready || locked.current) return;
    locked.current = true; setBusy(true); setError(null); setTested(false);
    try {
      await queue.current(async () => {
        if (next.enabled) {
          await device.prepareChannel(current.current.locale);
          let allowed = await device.getPermission();
          if (allowed.status !== 'granted' && allowed.canAskAgain) allowed = await device.requestPermission();
          setPermission(allowed);
          if (allowed.status !== 'granted') { setError('通知が許可されていません。端末の設定から許可できます。'); return; }
        }
        // Do not schedule an opt-in that could not be saved.
        await AsyncStorage.setItem(REMINDER_KEY, JSON.stringify(next));
        current.current = { ...current.current, settings: next };
        setSettings(next);
        await synchronize();
      });
    } catch { setError('通知設定の保存または予約に失敗しました。もう一度お試しください。'); }
    finally { locked.current = false; setBusy(false); }
  }
  async function test() {
    if (!device.supported || !ready || locked.current) return;
    locked.current = true; setBusy(true); setError(null); setTested(false);
    try {
      await queue.current(async () => {
        const allowed = await device.getPermission(); setPermission(allowed);
        if (!current.current.settings.enabled || allowed.status !== 'granted') throw new Error('Not enabled');
        await device.schedules.schedule(testNotice(current.current.locale));
        setTested(true);
      });
    } catch { setError('テスト通知を予約できませんでした。通知の許可を確認してください。'); }
    finally { locked.current = false; setBusy(false); }
  }
  return <Context.Provider value={{ settings, ready, busy, error, tested, permission, configure, retry: () => { if (ready) refresh(); else void load(); }, test }}>{children}</Context.Provider>;
}
export function useReminders() {
  const value = useContext(Context);
  if (!value) throw new Error('ReminderProvider missing');
  return value;
}
