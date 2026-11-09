import { useEffect, useState } from 'react';
import { Animated, AppState, Platform, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { BRAND_BACKGROUND } from '../brand/mark';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useProgress } from '../state/ProgressProvider';
import { BrandMark } from './BrandMark';

// Called before the root layout mounts; the first branded JS frame releases it.
if (Platform.OS !== 'web') void SplashScreen.preventAutoHideAsync().catch(() => {});
function hideNativeSplash() {
  if (Platform.OS !== 'web') void SplashScreen.hideAsync().catch(() => {});
}
export function LaunchIntro() {
  const { ready, error } = useProgress();
  const reduced = useReducedMotion();
  const [progress] = useState(() => new Animated.Value(0));
  const [fade] = useState(() => new Animated.Value(1));
  const [animationDone, setAnimationDone] = useState(false);
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    const deadline = setTimeout(() => setEnded(true), 1800);
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') setEnded(true); });
    return () => { clearTimeout(deadline); subscription.remove(); };
  }, []);
  useEffect(() => {
    if (ended || reduced === null) return;
    if (reduced) {
      const timer = setTimeout(() => setAnimationDone(true), 0);
      return () => clearTimeout(timer);
    }
    const animation = Animated.timing(progress, {toValue:1,duration:400,useNativeDriver:true});
    animation.start(({finished}) => { if (finished) setAnimationDone(true); });
    return () => animation.stop();
  }, [ended, reduced, progress]);
  useEffect(() => {
    if (!(ready && animationDone) && !error) return;
    if (reduced !== false || error) {
      const timer = setTimeout(() => setEnded(true), 0);
      return () => clearTimeout(timer);
    }
    const animation = Animated.timing(fade,{toValue:0,duration:120,useNativeDriver:true});
    animation.start(({finished})=>{if(finished)setEnded(true);});
    return () => animation.stop();
  }, [ready, animationDone, error, reduced, fade]);
  useEffect(() => { if (ended) hideNativeSplash(); }, [ended]);
  if (ended) return null;
  return <View testID="launch-intro" accessibilityLabel="KnowGachaを起動しています" accessible style={styles.overlay} onLayout={hideNativeSplash}>
    <Animated.View style={{opacity:fade}}>
      <BrandMark progress={reduced === true ? undefined : progress} />
    </Animated.View>
  </View>;
}
const styles=StyleSheet.create({overlay:{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:100,backgroundColor:BRAND_BACKGROUND,alignItems:'center',justifyContent:'center'}});
