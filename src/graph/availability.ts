import { keywords } from '../data/keywords';
import { type Progress } from '../state/progress';
// Keep the existing daily grant rule until a different allowance is agreed.
export function availability(progress: Progress, date: string) {
  const today = progress.openings.find((item) => item.date === date);
  const exhausted = progress.openings.length >= keywords.length;
  return { today, exhausted, remaining: today || exhausted ? 0 : 1 };
}
