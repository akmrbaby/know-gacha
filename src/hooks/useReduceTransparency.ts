import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
export function useReduceTransparency() {
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (process.env.EXPO_OS !== 'ios') return;
    let live = true;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(value => { if (live) setReduced(value); }).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduced);
    return () => { live = false; subscription.remove(); };
  }, []);
  return reduced;
}
