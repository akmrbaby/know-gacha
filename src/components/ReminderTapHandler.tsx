import { useEffect } from 'react';
import { useRootNavigationState, useRouter } from 'expo-router';
import { observeTaps } from '../notifications/device';

export function ReminderTapHandler() {
  const state = useRootNavigationState();
  const router = useRouter();
  useEffect(() => {
    if (!state?.key) return;
    return observeTaps(() => router.navigate('/gacha'));
  }, [state?.key, router]);
  return null;
}
