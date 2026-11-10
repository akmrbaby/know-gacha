import { useEffect, useRef } from 'react';
import { useRootNavigationState, useRouter, usePathname } from 'expo-router';
import { observeTaps } from '../notifications/device';

export function ReminderTapHandler() {
  const state = useRootNavigationState();
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  useEffect(() => { currentPath.current = pathname; }, [pathname]);
  useEffect(() => {
    if (!state?.key) return;
    return observeTaps(() => { if (!currentPath.current.startsWith('/word/')) router.navigate('/'); });
  }, [state?.key, router]);
  return null;
}
