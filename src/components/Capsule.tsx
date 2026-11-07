import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import { colors } from './ui';
import { useReducedMotion } from '../hooks/useReducedMotion';
export function Capsule({ opening = false, onFinish }: { opening?: boolean; onFinish?: () => void }) {
  const reduced = useReducedMotion();
  const [motion] = useState(() => new Animated.Value(0));
  const finish = useRef(onFinish);
  useEffect(() => { finish.current = onFinish; }, [onFinish]);
  useEffect(() => {
    if (!opening || reduced === null) return;
    if (reduced) { finish.current?.(); return; }
    let live = true;
    const animation = Animated.timing(motion, { toValue: 1, duration: 900, useNativeDriver: true });
    animation.start(({ finished }) => { if (finished && live) finish.current?.(); });
    const subscription = AppState.addEventListener('change', (state) => { if (state !== 'active') { live = false; animation.stop(); finish.current?.(); } });
    return () => { live = false; animation.stop(); subscription.remove(); };
  }, [opening, reduced, motion]);
  return <View accessible={false} style={capsule.stage}>
    <View style={capsule.shadow} />
    <Animated.View style={{ transform: [{ rotate: motion.interpolate({ inputRange: [0, 0.15, 0.28, 1], outputRange: ['0deg', '-8deg', '8deg', '0deg'] }) }] }}>
      <Animated.View style={[capsule.top, { opacity: motion.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, -55] }) }] }]} />
      <Animated.View style={[capsule.bottom, { transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, 40] }) }], opacity: motion.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }) }]} />
      <Animated.View style={[capsule.band, { opacity: motion.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 0, 0] }) }]}><Text style={capsule.label}>ひとつの、未知。</Text></Animated.View>
    </Animated.View>
  </View>;
}
const capsule = StyleSheet.create({
  stage: { height: 160, alignItems: 'center', justifyContent: 'center' },
  top: { width: 142, height: 77, borderTopLeftRadius: 80, borderTopRightRadius: 80, backgroundColor: '#E8D9B9', borderWidth: 1, borderColor: '#C8B995' },
  bottom: { width: 142, height: 77, borderBottomLeftRadius: 80, borderBottomRightRadius: 80, backgroundColor: colors.ink, borderWidth: 1, borderColor: colors.ink },
  band: { position: 'absolute', top: 58, left: -12, right: -12, backgroundColor: '#FFFCF5', padding: 10, borderWidth: 1, borderColor: '#D9CEB5', transform: [{ rotate: '-8deg' }] },
  label: { textAlign: 'center', fontSize: 13, letterSpacing: 2, color: colors.ink },
  shadow: { position: 'absolute', bottom: 0, width: 130, height: 12, borderRadius: 70, backgroundColor: '#E3DED1' },
});
