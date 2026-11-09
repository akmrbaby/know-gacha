import { findKeyword, keywords } from '../data/keywords';
// Trial setting: 9 welcome draws + today's draw = 10. Set to 2 for future initial 3.
export const INITIAL_BONUS = 9;
export type Opening = { keywordId: string; date: string; openedAt: string; grant: 'daily' | 'welcome' };
export type Progress = { version: 2; initialBonus: number; openings: Opening[]; dayOffset: number };
export const emptyProgress = (initialBonus = INITIAL_BONUS): Progress => ({ version: 2, initialBonus, openings: [], dayOffset: 0 });
// Keep the key so existing installations migrate without losing their history.
export const STORAGE_KEY = 'knowgacha.progress.v1';
export function localDate(now = new Date(), offset = 0): string {
  const date = new Date(now); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function allowance(progress: Progress, date: string) {
  const daily = progress.openings.some(item => item.date === date && item.grant === 'daily') ? 0 : 1;
  const bonus = progress.initialBonus - progress.openings.filter(item => item.grant === 'welcome').length;
  return { daily, bonus, total: daily + bonus };
}
export function restoreProgress(raw: string | null): Progress {
  if (raw === null) return emptyProgress();
  const value = JSON.parse(raw);
  if (!value || ![1,2].includes(value.version) || !Number.isSafeInteger(value.dayOffset) || value.dayOffset < 0 || !Array.isArray(value.openings)) throw new Error('Invalid progress');
  const bonus = value.version === 1 ? INITIAL_BONUS : value.initialBonus;
  if (!Number.isSafeInteger(bonus) || bonus < 0) throw new Error('Invalid initial bonus');
  const ids = new Set<string>(), dailyDates = new Set<string>();
  const openings: Opening[] = value.openings.map((item: Opening) => {
    const grant = value.version === 1 ? 'daily' : item?.grant;
    if (!item || !findKeyword(item.keywordId) || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Date.parse(item.openedAt)) || ids.has(item.keywordId) || !['daily','welcome'].includes(grant) || (grant === 'daily' && dailyDates.has(item.date))) throw new Error('Invalid opening');
    ids.add(item.keywordId); if (grant === 'daily') dailyDates.add(item.date);
    return {keywordId: item.keywordId, date: item.date, openedAt: item.openedAt, grant};
  });
  if (openings.filter(item=>item.grant === 'welcome').length > bonus) throw new Error('Overspent welcome bonus');
  return {version:2, initialBonus:bonus, dayOffset:value.dayOffset, openings};
}
export function openForDate(progress: Progress, date: string, random = Math.random, now = new Date()): Progress {
  const balance = allowance(progress,date);
  if (balance.total <= 0) return progress;
  const remaining = keywords.filter(word=>!progress.openings.some(item=>item.keywordId === word.id));
  if (!remaining.length) return progress;
  const word = remaining[Math.floor(random()*remaining.length)];
  return {...progress, openings:[...progress.openings, {keywordId:word.id,date,openedAt:now.toISOString(),grant:balance.daily ? 'daily' : 'welcome'}]};
}
