import ui from './ui-en.json';
import content from './content-en.json';
import { keywords } from '../data/keywords';
import { baseGraph } from '../knowledge/base';
export type Locale = 'ja' | 'en';
export function resolveLocale(languageCode?: string | null): Locale { return languageCode?.toLowerCase().split(/[-_]/)[0] === 'ja' ? 'ja' : 'en'; }
export const english: Record<string,string> = {...ui};
function add(source: unknown, translated: unknown) { if (typeof source === 'string' && typeof translated === 'string') english[source] = translated; }
for (const word of keywords) {
  const entry = content.topics[word.id as keyof typeof content.topics];
  if (!entry) continue;
  for (const key of ['name','category','introduction','summary'] as const) add(word[key],entry[key]);
  word.sections.forEach((section,i) => {add(section.title,entry.sections[i]?.title);add(section.body,entry.sections[i]?.body);});
}
for (const [id,entry] of Object.entries(content.concepts)) {add(baseGraph.nodes[id]?.name,entry.name);add(baseGraph.nodes[id]?.summary,entry.summary);}
for (const [id,entry] of Object.entries(content.connections)) {const edge=baseGraph.relations.find(edge=>edge.id===id);add(edge?.label,entry.label);add(edge?.explanation,entry.explanation);}
const escape = (s:string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fragments = new RegExp(Object.keys(english).filter(key=>/[\u3040-\u30ff\u3400-\u9fff]/.test(key)).sort((a,b)=>b.length-a.length).map(escape).join('|'),'g');
const counted = (n:string,word:string) => `${n} ${word}${n==='1'?'':'s'}`;
const patterns: [RegExp,(...parts:string[])=>string][] = [
 [/^残り(\d+)回、ガチャをひらく$/,n=>`${counted(n,'draw')} left, open Gacha`],
 [/^残り(\d+)回、新しい言葉に出会えます。$/,n=>`${counted(n,'draw')} left to discover something new.`],
 [/^残り(\d+)回$/,n=>`${counted(n,'draw')} left`],
 [/^次の知識をひらく（残り(\d+)回）$/,n=>`Open another (${n} left)`],
 [/^あと(\d+)回ひらけます。$/,n=>`You can open ${n} more.`],
 [/^(\d+) \/ (\d+)語$/,(n,total)=>`${n} / ${total} topics`],
 [/^(\d+)語の知識$/,n=>counted(n,'topic')],
 [/^初期(\d+)回からやり直す$/,n=>`Restart with ${n} draws`],
 [/^この端末の開封履歴と残り回数を初期化します。初回特典(\d+)回＋当日分1回から確認できます。$/,n=>`This resets this device's discoveries and remaining draws. Start with ${n} welcome draws plus one daily draw.`],
 [/^デモ · (\d+)件$/,n=>`Demo · ${n} topics`],
 [/^(\d+)件$/,n=>`${n}`],
 [/^(\d+)件のデモ$/,n=>`${n}-topic demo`],
 [/^つながり (\d+)件$/,n=>counted(n,'connection')],
 [/^(\d+)点$/,n=>counted(n,'node')],
 [/^架空の知識 (\d+)$/,n=>`Synthetic topic ${n}`],
 [/^内容確認用10件＋架空の検証用(\d+)件 · 学習内容ではありません$/,n=>`10 draft topics + ${n} synthetic test topics · Not learning content`],
 [/^取得知識 (\d+) · 周辺概念 (\d+) · 関係 (\d+)$/,(a,b,c)=>`${a} topics · ${b} concepts · ${c} connections`],
 [/^操作した回数：(\d+)$/,n=>`Actions: ${n}`]
];
export function translate(message:string, locale:Locale): string {
  if (locale === 'ja') return message;
  if (english[message]) return english[message];
  for(const [pattern,render] of patterns) {const match=message.match(pattern);if(match)return render(...match.slice(1));}
  return message.replace(fragments,key=>english[key]).replaceAll('、',', ').replaceAll('・',' · ');
}
export function sourceLanguage(url:string):Locale|null {
  try {const host=new URL(url).hostname.replace(/^www\./,'');if(host==='flets.com')return 'ja';if(['nobelprize.org','intel.com','moma.org','gov.uk','tate.org.uk','vam.ac.uk','anthroencyclopedia.com'].some(domain=>host===domain||host.endsWith('.'+domain)))return 'en';} catch {}
  return null;
}
