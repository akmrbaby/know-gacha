import { keywords } from '../data/keywords';
import { allowance, localDate, type Progress } from '../state/progress';
import type { Permission } from './reminders';
export const BADGE_KEY = 'knowgacha.badge.v1';
export const BADGE_ID = 'knowgacha.badge-rollover.v1';
export type BadgeSettings = {version:1;enabled:boolean};
export const defaultBadge = ():BadgeSettings => ({version:1,enabled:true});
export function restoreBadge(raw:string|null):BadgeSettings {
  if(raw===null)return defaultBadge();
  const value=JSON.parse(raw);
  if(value?.version!==1 || typeof value.enabled!=='boolean')throw new Error('Invalid badge settings');
  return {version:1,enabled:value.enabled};
}
export function badgeCounts(progress:Progress,date:string){
  const acquired=new Set(progress.openings.map(item=>item.keywordId));
  const unread=keywords.filter(word=>!acquired.has(word.id)).length;
  const {total}=allowance(progress,date);
  return {current:Math.min(unread,total),next:Math.min(unread,total+1)};
}
export type BadgeUpdate={id:string;at:number;count:number;signature:string};
export function planBadges(progress:Progress,date:string,now=new Date()):BadgeUpdate[]{
  const result:BadgeUpdate[]=[];
  let previous=badgeCounts(progress,date).current;
  const unread=keywords.filter(word=>!progress.openings.some(item=>item.keywordId===word.id)).length;
  for(let day=1;day<=30 && previous<unread;day++){
    const at=new Date(now.getFullYear(),now.getMonth(),now.getDate()+day,0,0,0,0);
    const projected=localDate(new Date(`${date}T12:00:00`),day);
    const count=badgeCounts(progress,projected).current;
    if(count!==previous)result.push({id:`${BADGE_ID}:${localDate(at)}`,at:at.getTime(),count,signature:`2:${at.getTime()}:${count}`});
    previous=count;
  }
  return result;
}
export type BadgePort = {
  permission:()=>Promise<Permission>;
  setCount:(count:number)=>Promise<void>;
  rollover:(updates:BadgeUpdate[])=>Promise<void>;
};
export async function syncBadge(port:BadgePort,enabled:boolean,progress:Progress|null,date:string,now=new Date()){
  const permission=await port.permission();
  if(!enabled || permission.status!=='granted'){
    await port.rollover([]);await port.setCount(0);return permission;
  }
  // Never publish empty/default progress if the saved acquisition ledger failed to load.
  if(!progress)return permission;
  const counts=badgeCounts(progress,date);
  // Retire the old rollover first, so a failed reschedule never retains an older count.
  await port.rollover(planBadges(progress,date,now));
  await port.setCount(counts.current);
  return permission;
}
