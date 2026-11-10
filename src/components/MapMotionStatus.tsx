import { View } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { spacing } from '../theme';
import { NativeText } from './native-ui/NativeText';

export function MapMotionStatus() {
  const reduced = useReducedMotion();
  return <View style={{ gap: spacing.sm }}>
    <NativeText variant="caption" accessibilityRole="header">Mapの動き</NativeText>
    <NativeText accessibilityLiveRegion="polite">{reduced === null ? '端末の設定を確認しています…' : reduced ? '端末の「視差効果を減らす」設定により、Mapの動きを停止しています。' : '丸い点と名前・線がゆっくり動きます。操作中と詳細表示中は静止します。'}</NativeText>
  </View>;
}
