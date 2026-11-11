import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { graphLabEnabled } from '../graph/lab';
import { AppState } from 'react-native';
import { emptyProgress, localDate, openForDate, loadSavedProgress, STORAGE_KEY, type Progress } from './progress';
type State = {
    progress: Progress;
    date: string;
    ready: boolean;
    busy: boolean;
    error: string | null;
    retry: () => void;
    open: () => Promise<string | undefined>;
    nextDay: () => Promise<void>;
    reset: () => Promise<void>;
};
const Context = createContext<State | null>(null);
export function ProgressProvider({ children }: {
    children: ReactNode;
}) {
    const [progress, setProgress] = useState(emptyProgress);
    const current = useRef(progress);
    const lock = useRef(false);
    const [ready, setReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clock, setClock] = useState(() => new Date());
    const offset = __DEV__ ? progress.dayOffset : 0;
    const date = localDate(clock, offset);
    const load = useCallback(() => {
        return loadSavedProgress(AsyncStorage).then((restored) => {
            current.current = restored;
            setProgress(restored);
            setError(null);
            setReady(true);
        }).catch(() => {
            setError('記録を読み込めませんでした。保存済みデータは変更していません。もう一度お試しください。');
        });
    }, []);
    useEffect(() => { void load(); }, [load]);
    useEffect(() => {
        const refresh = () => {
            const now = new Date();
            setClock((previous) => localDate(previous) === localDate(now) ? previous : now);
        };
        const timer = setInterval(refresh, 1000);
        const subscription = AppState.addEventListener('change', (state) => { if (state === 'active')
            refresh(); });
        return () => { clearInterval(timer); subscription.remove(); };
    }, []);
    async function change(update: (value: Progress) => Progress): Promise<Progress | undefined> {
        if (lock.current || !ready)
            return;
        lock.current = true;
        setBusy(true);
        setError(null);
        try {
            const next = update(current.current);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            current.current = next;
            setProgress(next);
            setClock(new Date());
            return next;
        }
        catch {
            setError('保存できませんでした。進捗は変更していません。もう一度お試しください。');
        }
        finally {
            lock.current = false;
            setBusy(false);
        }
    }
    async function open() {
        const today = localDate(new Date(), __DEV__ ? current.current.dayOffset : 0);
        const currentBefore = current.current;
        const countBefore = currentBefore.openings.length;
        const next = await change((value) => openForDate(value, today));
        return next && next !== currentBefore && next.openings.length > countBefore ? next.openings.at(-1)?.keywordId : undefined;
    }
    async function nextDay() { if (__DEV__)
        await change((value) => ({ ...value, dayOffset: value.dayOffset + 1 })); }
    async function reset() { if (graphLabEnabled)
        await change(() => emptyProgress()); }
    return <Context.Provider value={{ progress, date, ready, busy, error, retry: () => { setError(null); void load(); }, open, nextDay, reset }}>{children}</Context.Provider>;
}
export function useProgress() {
    const value = useContext(Context);
    if (!value)
        throw new Error('ProgressProvider is missing');
    return value;
}
