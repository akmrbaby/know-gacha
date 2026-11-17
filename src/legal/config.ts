import policy from './policy.json';
import type { Locale } from '../i18n/translate';
export const legalLinks=policy.links;
export function publicPolicyUrl(locale:Locale){
  return `https://github.com/akmrbaby/know-gacha/blob/develop/legal/privacy-${locale}.md`;
}
