// Public build-time flag, never a credential. Production defaults to the normal app.
export const graphLabEnabled = __DEV__ || process.env.EXPO_PUBLIC_GRAPH_LAB === '1';
