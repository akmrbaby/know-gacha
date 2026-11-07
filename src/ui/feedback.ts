import * as Haptics from 'expo-haptics';

// Only call at user-initiated selection commits, never from per-frame handlers.
export function selectionFeedback() {
  if (process.env.EXPO_OS === 'ios' || process.env.EXPO_OS === 'android') {
    void Haptics.selectionAsync().catch(() => {});
  }
}
