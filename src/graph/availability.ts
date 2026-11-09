import { keywords } from '../data/keywords';
import { allowance, type Progress } from '../state/progress';
export function availability(progress: Progress, date: string) {
  const today = progress.openings.findLast(item => item.date === date);
  const unread = keywords.filter(word => !progress.openings.some(item => item.keywordId === word.id)).length;
  const balance = allowance(progress, date);
  return { today, exhausted: unread <= 0, remaining: Math.min(unread, balance.total), ...balance };
}
