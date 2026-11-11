import { findKeyword, keywords } from '../data/keywords';
// Trial setting: 9 welcome draws + the first daily draw = 10.
export const INITIAL_BONUS = 9;
export type Opening = { keywordId: string; date: string; openedAt: string; grant: 'daily' | 'welcome' };
export type Progress = { version: 3; startedOn: string; initialBonus: number; openings: Opening[]; dayOffset: number };
export const STORAGE_KEY = 'knowgacha.progress.v1';
export function localDate(now = new Date(), offset = 0): string {
  const date = new Date(now); date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export const emptyProgress = (initialBonus = INITIAL_BONUS, startedOn = localDate()): Progress => ({ version: 3, startedOn, initialBonus, openings: [], dayOffset: 0 });
function grantDate(progress:Progress,date:string){return progress.openings.reduce((latest,item)=>item.date>latest?item.date:latest,date>progress.startedOn?date:progress.startedOn);}
function dayNumber(date:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid date');
  const at=Date.parse(`${date}T00:00:00Z`);
  if(!Number.isFinite(at) || new Date(at).toISOString().slice(0,10)!==date)throw new Error('Invalid date');
  return at/86400000;
}
export function allowance(progress: Progress, date: string) {
  // A backward clock/time-zone change does not revoke previously spent grants.
  const earned=dayNumber(grantDate(progress,date))-dayNumber(progress.startedOn)+1;
  const daily=Math.max(0,earned-progress.openings.filter(item=>item.grant==='daily').length);
  const bonus=progress.initialBonus-progress.openings.filter(item=>item.grant==='welcome').length;
  return {daily,bonus,total:daily+bonus};
}
export function restoreProgress(raw: string | null, now = new Date()): Progress {
  if (raw === null) return emptyProgress(INITIAL_BONUS,localDate(now));
  const value = JSON.parse(raw);
  if (!value || ![1,2,3].includes(value.version) || !Number.isSafeInteger(value.dayOffset) || value.dayOffset < 0 || !Array.isArray(value.openings)) throw new Error('Invalid progress');
  const bonus=value.version===1?INITIAL_BONUS:value.initialBonus;
  if(!Number.isSafeInteger(bonus)||bonus<0)throw new Error('Invalid initial bonus');
  const ids=new Set<string>(),legacyDates=new Set<string>();
  const openings:Opening[]=value.openings.map((item:Opening)=>{
    const grant=value.version===1?'daily':item?.grant;
    if(!item || !findKeyword(item.keywordId) || !Number.isFinite(Date.parse(item.openedAt)) || ids.has(item.keywordId) || !['daily','welcome'].includes(grant))throw new Error('Invalid opening');
    dayNumber(item.date);
    if(value.version<3 && grant==='daily' && legacyDates.has(item.date))throw new Error('Duplicate legacy daily draw');
    if(grant==='daily')legacyDates.add(item.date);
    ids.add(item.keywordId);return {keywordId:item.keywordId,date:item.date,openedAt:item.openedAt,grant};
  });
  const startedOn=value.version===3?value.startedOn:openings.reduce((first,item)=>item.date<first?item.date:first,localDate(now));
  dayNumber(startedOn);
  if(openings.some(item=>item.date<startedOn))throw new Error('Opening before daily grants started');
  if(openings.filter(item=>item.grant==='welcome').length>bonus)throw new Error('Overspent welcome bonus');
  // Validate cumulative spending at every recorded day, allowing multiple saved daily grants on one day.
  const sorted=openings.filter(item=>item.grant==='daily').sort((a,b)=>a.date.localeCompare(b.date));
  sorted.forEach((item,i)=>{if(i+1>dayNumber(item.date)-dayNumber(startedOn)+1)throw new Error('Overspent daily grants');});
  return {version:3,startedOn,initialBonus:bonus,openings,dayOffset:value.dayOffset};
}
export function openForDate(progress: Progress, date: string, random = Math.random, now = new Date()): Progress {
  const balance=allowance(progress,date);
  if(balance.total<=0)return progress;
  const remaining=keywords.filter(word=>!progress.openings.some(item=>item.keywordId===word.id));
  if(!remaining.length)return progress;
  const word=remaining[Math.floor(random()*remaining.length)];
  return {...progress,openings:[...progress.openings,{keywordId:word.id,date:grantDate(progress,date),openedAt:now.toISOString(),grant:balance.daily?'daily':'welcome'}]};
}

export async function loadSavedProgress(storage:{getItem:(key:string)=>Promise<string|null>;setItem:(key:string,value:string)=>Promise<void>},now=new Date()){
  const raw=await storage.getItem(STORAGE_KEY);
  const progress=restoreProgress(raw,now);
  if(raw===null || JSON.parse(raw).version!==3)await storage.setItem(STORAGE_KEY,JSON.stringify(progress));
  return progress;
}
