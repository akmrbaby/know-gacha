import { useEffect, useId, useRef, useState } from 'react';
import { Animated, AppState, Image, StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, Image as SvgImage, Path } from 'react-native-svg';
import { useThemeColors } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const MASCOT = require('../../assets/gacha-mascot.png');
const SIZE = 184;
// Complementary clips follow the curved join of the approved 512px artwork.
const TOP = 'M0 0H512V246H450Q256 282 62 246H0Z';
const BOTTOM = 'M0 246H62Q256 282 450 246H512V512H0Z';

function MascotHalf({ part }: { part: 'top' | 'bottom' }) {
  const id = `capsule-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return <Svg width={SIZE} height={SIZE} viewBox="0 0 512 512">
    <Defs><ClipPath id={id}><Path d={part === 'top' ? TOP : BOTTOM} /></ClipPath></Defs>
    <SvgImage href={MASCOT} width={512} height={512} clipPath={`url(#${id})`} />
  </Svg>;
}

export function Capsule({ opening = false, onFinish }: { opening?: boolean; onFinish?: () => void }) {
  const theme = useThemeColors();
  const reduced = useReducedMotion();
  const [motion] = useState(() => new Animated.Value(0));
  // SVG Image onLoad is not emitted on Android's bitmap-cache path. The
  // ordinary Image warms the same asset before the clipped layers appear.
  const [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  const finish = useRef(onFinish), completed = useRef(false);
  useEffect(() => { finish.current = onFinish; }, [onFinish]);
  useEffect(() => {
    if (!opening) { completed.current = false; motion.setValue(0); return; }
    if (reduced === null || completed.current) return;
    let live = true;
    let animation: Animated.CompositeAnimation | undefined;
    let deadline: ReturnType<typeof setTimeout> | undefined;
    function complete() {
      if (!live || completed.current) return;
      completed.current = true;
      finish.current?.();
    }
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') { animation?.stop(); complete(); }
    });
    if (reduced || failed || AppState.currentState === 'background' || AppState.currentState === 'inactive') complete();
    else if (!ready) deadline = setTimeout(complete, 800);
    else {
      motion.setValue(0);
      animation = Animated.timing(motion, { toValue: 1, duration: 900, useNativeDriver: true });
      animation.start(({ finished }) => { if (finished) complete(); });
    }
    return () => { live = false; clearTimeout(deadline); animation?.stop(); subscription.remove(); };
  }, [opening, reduced, ready, failed, motion]);

  const halves = motion.interpolate({ inputRange: [0, 0.30, 0.34, 0.76, 1], outputRange: [0, 0, 1, 1, 0] });
  return <View testID="gacha-capsule" pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={capsule.stage}>
    <Animated.View style={[capsule.shadow, { opacity: motion.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0.6, 0] }) }]}>
      <Svg width={124} height={10}><Ellipse cx={62} cy={5} rx={62} ry={5} fill={theme.capsuleShadow} /></Svg>
    </Animated.View>
    <Animated.View style={[capsule.figure, { transform: [
      { rotate: motion.interpolate({ inputRange: [0, 0.10, 0.21, 0.31, 0.38, 1], outputRange: ['0deg', '-6deg', '6deg', '-3deg', '0deg', '0deg'] }) },
      { translateY: motion.interpolate({ inputRange: [0, 0.1, 0.21, 0.31, 0.38, 1], outputRange: [0, -2, 0, -2, 0, 0] }) },
    ] }]}>
      <Animated.View testID="capsule-glow" style={[capsule.glow, { opacity: motion.interpolate({ inputRange: [0, 0.38, 0.60, 0.84, 1], outputRange: [0, 0, 1, 0.8, 0] }), transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.4, 1], outputRange: [4, 4, -8] }) }] }]}>
        {[6, 9, 6].map((size, i) => <View key={i} style={{ width: size, height: size, borderRadius: size, backgroundColor: theme.accent, marginTop: i === 1 ? -8 : 0 }} />)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: motion.interpolate({ inputRange: [0, 0.30, 0.34, 1], outputRange: [1, 1, 0, 0] }) }]}>
        <Image testID="capsule-body" source={MASCOT} resizeMode="contain" fadeDuration={0} accessible={false} style={capsule.figure}
          onLoad={() => setReady(true)} onError={() => setFailed(true)} />
      </Animated.View>
      <Animated.View testID="capsule-top" style={[StyleSheet.absoluteFill, { opacity: halves, transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.38, 0.8, 1], outputRange: [0, 0, -22, -22] }) }] }]}>
        <MascotHalf part="top" />
      </Animated.View>
      <Animated.View testID="capsule-bottom" style={[StyleSheet.absoluteFill, { opacity: halves, transform: [{ translateY: motion.interpolate({ inputRange: [0, 0.38, 0.8, 1], outputRange: [0, 0, 10, 10] }) }] }]}>
        <MascotHalf part="bottom" />
      </Animated.View>
    </Animated.View>
  </View>;
}
const capsule = StyleSheet.create({
  stage: { height: 208, alignItems: 'center', justifyContent: 'center' },
  figure: { width: SIZE, height: SIZE },
  glow: { position: 'absolute', left: 0, right: 0, top: SIZE / 2 + 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  shadow: { position: 'absolute', bottom: 18, width: 124, height: 10 },
});
