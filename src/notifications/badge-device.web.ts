import type { BadgePort } from './badges';
import type { Permission } from './reminders';
export const supported=false;
export async function getPermission():Promise<Permission>{return {status:'unsupported',canAskAgain:false};}
export const requestBadgePermission=getPermission;
export const badges:BadgePort={permission:getPermission,setCount:async()=>{},rollover:async()=>{}};
