import type { Permission, SchedulePort } from './reminders';
export const supported = false;
export async function getPermission(): Promise<Permission> { return { status: 'unsupported', canAskAgain: false }; }
export async function prepareChannel() {}
export async function requestPermission(): Promise<Permission> { return getPermission(); }
export const schedules: SchedulePort = { list: async () => [], cancel: async () => {}, schedule: async () => {} };
export async function dismissReminders() {}
export function observeTaps(_onTap: () => void) { return () => {}; }
