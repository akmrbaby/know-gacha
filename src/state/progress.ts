import { findKeyword, keywords } from '../data/keywords';
export type Opening = {
    keywordId: string;
    date: string;
    openedAt: string;
};
export type Progress = {
    version: 1;
    openings: Opening[];
    dayOffset: number;
};
export const emptyProgress = (): Progress => ({ version: 1, openings: [], dayOffset: 0 });
export const STORAGE_KEY = 'knowgacha.progress.v1';
export function localDate(now = new Date(), offset = 0): string {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function restoreProgress(raw: string | null): Progress {
    if (raw === null)
        return emptyProgress();
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object')
        throw new Error('Invalid progress');
    const data = value as Partial<Progress>;
    if (data.version !== 1 || !Number.isSafeInteger(data.dayOffset) || data.dayOffset! < 0 || !Array.isArray(data.openings))
        throw new Error('Invalid progress');
    const ids = new Set<string>();
    const dates = new Set<string>();
    for (const item of data.openings) {
        if (!item || !findKeyword(item.keywordId) || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Date.parse(item.openedAt)) || ids.has(item.keywordId) || dates.has(item.date))
            throw new Error('Invalid opening');
        ids.add(item.keywordId);
        dates.add(item.date);
    }
    return data as Progress;
}
export function openForDate(progress: Progress, date: string, random = Math.random, now = new Date()): Progress {
    if (progress.openings.some((item) => item.date === date))
        return progress;
    const remaining = keywords.filter((word) => !progress.openings.some((item) => item.keywordId === word.id));
    if (!remaining.length)
        return progress;
    const word = remaining[Math.floor(random() * remaining.length)];
    return { ...progress, openings: [...progress.openings, { keywordId: word.id, date, openedAt: now.toISOString() }] };
}
