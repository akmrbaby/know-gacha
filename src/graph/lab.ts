import { channel } from 'expo-updates';

// Public build-time flag, never a credential. Production defaults to the normal app.
export const graphLabEnabled = __DEV__ || channel === 'preview' || process.env.EXPO_PUBLIC_GRAPH_LAB === '1';
