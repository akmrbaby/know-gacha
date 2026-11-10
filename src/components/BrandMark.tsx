import { Animated, View } from 'react-native';
import { BRAND_SIZE } from '../brand/mark';

export function BrandMark({ progress, size = BRAND_SIZE, onLoad, onError }: { progress?: Animated.Value; size?: number; onLoad?: () => void; onError?: () => void }) {
  return <View pointerEvents="none" accessible={false} style={{width:size,height:size}}>
    <Animated.Image testID="brand-mascot" source={require('../../assets/splash-icon.png')} resizeMode="contain" fadeDuration={0} accessible={false}
      onLoad={onLoad} onError={onError} style={{ width:size, height:size, transform:[
        {translateY:progress?.interpolate({inputRange:[0,0.5,1],outputRange:[0,-3,0]}) ?? 0},
        {rotate:progress?.interpolate({inputRange:[0,0.5,1],outputRange:['0deg','-2deg','0deg']}) ?? '0deg'},
      ]}} />
  </View>;
}
