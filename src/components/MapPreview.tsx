import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation } from '../knowledge/model';
import { spacing, useThemeColors } from '../theme';
import { Action } from './ui';
import { NativeText } from './native-ui/NativeText';
import { NativeIconAction } from './native-ui/NativeIconAction';
import { AppIcon } from './native-ui/AppIcon';
import { NavigationRow } from './native-ui/NavigationRow';

export function MapPreview({ selected, edges, height, onSelect, onClose, onExpand, onCenter }: {
  selected: string; edges: GraphRelation[]; height: number; onSelect: (id: string) => void; onClose: () => void; onExpand: () => void; onCenter: () => void;
}) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const edge = edges.find(item => item.id === selected), node = baseGraph.nodes[selected];
  const name = (id: string) => baseGraph.nodes[id]?.name ?? '';
  const title = edge ? `${name(edge.sourceId)} → ${name(edge.targetId)}` : name(selected);
  const neighbors = edge ? [edge.sourceId, edge.targetId] : [...new Set(edges.filter(item => item.sourceId === selected || item.targetId === selected).map(item => item.sourceId === selected ? item.targetId : item.sourceId))];
  const swipe = usePanGesture({ minDistance: 18, onDeactivate: event => {
    if (!event.canceled && event.translationY < -30) scheduleOnRN(onExpand);
  }});
  return <View testID="map-preview" style={[styles.preview, { bottom:Math.max(spacing.sm,insets.bottom), backgroundColor: colors.surface, borderColor: colors.separator, maxHeight: Math.max(180, Math.min(320, height * 0.34)) }]}>
    <GestureDetector gesture={swipe}>
      <View testID="map-preview-handle" style={styles.handleArea}>
        <View style={[styles.handle, { backgroundColor: colors.separator }]} />
        <View style={styles.header}>
          <NativeText variant="label" accessibilityRole="header" numberOfLines={2} style={{flex:1}}>{title}</NativeText>
          <NativeIconAction label="選択を解除" onPress={onClose}><AppIcon name="close" /></NativeIconAction>
        </View>
      </View>
    </GestureDetector>
    <ScrollView nestedScrollEnabled contentContainerStyle={styles.content}>
      <NativeText numberOfLines={2}>{edge ? edge.label : node?.summary}</NativeText>
      <View style={styles.actions}>
        <View style={{flex:1}}><Action title="読む" onPress={onExpand} /></View>
        <View style={{flex:1}}><Action title="中央に表示" secondary onPress={onCenter} /></View>
      </View>
      {neighbors.length > 0 && <View>
        <NativeText variant="caption">{edge ? 'つながっている知識' : `つながり ${neighbors.length}件`}</NativeText>
        {neighbors.slice(0,2).map(id => <NavigationRow key={id} title={name(id)} onPress={() => onSelect(id)} />)}
        {neighbors.length > 2 && <NavigationRow title="すべてのつながりを見る" onPress={onExpand} />}
      </View>}
    </ScrollView>
  </View>;
}
const styles = StyleSheet.create({
  preview: { position:'absolute', bottom:spacing.sm, left:spacing.md, right:spacing.md, borderRadius:20, borderWidth:StyleSheet.hairlineWidth, overflow:'hidden' },
  handleArea:{paddingTop:spacing.sm,paddingHorizontal:spacing.md},
  handle:{width:36,height:4,borderRadius:2,alignSelf:'center'},
  header:{flexDirection:'row',alignItems:'center',gap:spacing.sm},
  content:{padding:spacing.md,paddingTop:0,gap:spacing.sm},
  actions:{flexDirection:'row',gap:spacing.sm},
});
