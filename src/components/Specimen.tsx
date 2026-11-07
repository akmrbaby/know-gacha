import { Text, View } from 'react-native';
import { specimens } from '../data/graph';
import { findKeyword } from '../data/keywords';
import { useUI } from './ui';
export function Specimen({ id }: { id: string }) {
  const { styles, theme } = useUI();
  const word = findKeyword(id)!;
  const look = specimens[id];
  return <View style={{ gap: 14 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text accessible={false} style={{ fontSize: 36, color: look.color }}>{look.mark}</Text>
      <Text style={[styles.eyebrow, { color: theme.accent }]}>{word.category} · COLLECTION</Text>
    </View>
    <Text accessibilityRole="header" style={styles.title}>{word.name}</Text>
    <Text style={styles.body}>{word.introduction}</Text>
  </View>;
}
