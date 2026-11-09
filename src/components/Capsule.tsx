import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';
export function Capsule({ opening = false, onFinish }: { opening?: boolean; onFinish?: () => void }) {
  const theme = useThemeColors();
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
    <View style={[capsule.shadow,{backgroundColor:theme.capsuleShadow}]} />
    <Animated.View style={{ transform: [{ rotate: motion.interpolate({ inputRange: [0, 0.15, 0.28, 1], outputRange: ['0deg', '-8deg', '8deg', '0deg'] }) }] }}>
      <Animated.View style={[capsule.top, { backgroundColor:theme.capsuleTop, borderColor:theme.capsuleBorder, opacity: motion.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }), transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, -55] }) }] }]} />
      <Animated.View style={[capsule.bottom, { backgroundColor:theme.capsuleBottom, borderColor:theme.capsuleBottom, transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0, 40] }) }], opacity: motion.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }) }]} />
      <Animated.View style={[capsule.band, { backgroundColor:theme.capsuleBand, borderColor:theme.capsuleBorder, opacity: motion.interpolate({ inputRange: [0, 0.35, 1], outputRange: [1, 0, 0] }) }]}><Text style={[capsule.label,{color:theme.capsuleInk}]}>ひとつの、未知。</Text></Animated.View>
    </Animated.View>
  </View>;
}
const capsule = StyleSheet.create({
  stage: { height: 160, alignItems: 'center', justifyContent: 'center' },
  top: { width: 142, height: 77, borderTopLeftRadius: 80, borderTopRightRadius: 80, borderWidth: 1 },
  bottom: { width: 142, height: 77, borderBottomLeftRadius: 80, borderBottomRightRadius: 80, borderWidth: 1 },
  band: { position: 'absolute', top: 58, left: -12, right: -12, padding: 10, borderWidth: 1, transform: [{ rotate: '-8deg' }] },
  label: { textAlign: 'center', fontSize: 13, letterSpacing: 2 },
  shadow: { position: 'absolute', bottom: 0, width: 130, height: 12, borderRadius: 70 },
});
