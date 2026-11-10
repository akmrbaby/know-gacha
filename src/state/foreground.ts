type AppStateSource = {
  readonly currentState: string | null | undefined;
  addEventListener: (event: 'change', callback: () => void) => { remove: () => void };
};

// useSyncExternalStore checks the snapshot again when subscribing, so an iOS
// activation between render and subscription cannot leave a stale false value.
export function createForegroundStore(source: AppStateSource) {
  return {
    getSnapshot: () => source.currentState === 'active',
    getServerSnapshot: () => false,
    subscribe: (notify: () => void) => {
      const subscription = source.addEventListener('change', notify);
      return () => subscription.remove();
    },
  };
}
