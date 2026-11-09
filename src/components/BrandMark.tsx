import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { BRAND_CORAL, BRAND_IVORY, BRAND_MINT, BRAND_NODES, CAPSULE_BOTTOM, CAPSULE_TOP, CONNECTION } from '../brand/mark';

export function BrandMark({ progress, size = 256 }: { progress?: Animated.Value; size?: number }) {
  return <View pointerEvents="none" accessible={false} style={{width:size,height:size}}>
    <Svg viewBox="0 0 1280 1280" width={size} height={size} style={StyleSheet.absoluteFill}>
      <Path d={CAPSULE_TOP} fill={BRAND_IVORY} /><Path d={CAPSULE_BOTTOM} fill={BRAND_MINT} />
    </Svg>
    <Animated.View style={[StyleSheet.absoluteFill,{opacity:progress?.interpolate({inputRange:[0,0.35,0.6,1],outputRange:[0,0,1,1]}) ?? 1}]}>
      <Svg viewBox="0 0 1280 1280" width={size} height={size}><Path d={CONNECTION} stroke={BRAND_IVORY} strokeWidth={18} fill="none" /></Svg>
    </Animated.View>
    {BRAND_NODES.map((node,i)=><Animated.View key={i} style={[StyleSheet.absoluteFill,{opacity:progress?.interpolate({inputRange:[0,0.15+i*0.15,0.35+i*0.15,1],outputRange:[0,0,1,1]}) ?? 1}]}>
      <Svg viewBox="0 0 1280 1280" width={size} height={size}><Circle cx={node.x} cy={node.y} r={node.r} fill={i===2?BRAND_CORAL:BRAND_IVORY} /></Svg>
    </Animated.View>)}
  </View>;
}
