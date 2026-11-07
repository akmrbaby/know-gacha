import { ScrollView, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { baseGraph } from '../knowledge/base';
import type { GraphRelation, KnowledgeGraph } from '../knowledge/model';
import { spacing } from '../theme';
import { AppSheet } from './native-ui/AppSheet';
import { NavigationRow } from './native-ui/NavigationRow';
import { NativeText } from './native-ui/NativeText';
import { Action, useUI } from './ui';

export function MapSheet({ selected, onSelect, onClose, graph = baseGraph, edges, acquiredIds, demo = false, embedded = false }: {
  graph?: KnowledgeGraph; edges: GraphRelation[]; acquiredIds: string[]; demo?: boolean; embedded?: boolean; selected: string; height: number; onSelect: (id: string) => void; onClose: () => void;
}) {
  const { styles } = useUI();
  const insets = useSafeAreaInsets();
  const edge = edges.find(item => item.id === selected), node = graph.nodes[selected];
  const acquired = acquiredIds.includes(selected);
  const reference = edge?.evidence ?? node?.evidence ?? [];
  const connected = edges.filter(item => item.sourceId === selected || item.targetId === selected);
  const name = (id: string) => graph.nodes[id]?.name ?? '';
  const title = edge ? `${name(edge.sourceId)} → ${name(edge.targetId)}` : name(selected);
  const content = <ScrollView key={selected} nestedScrollEnabled style={sheet.scroll} contentContainerStyle={[sheet.content, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
      <NativeText variant="caption">{edge ? 'つながりの理由' : acquired ? `${node?.category} · 取得済み` : '未取得の周辺概念'}</NativeText>
      {edge && <NativeText variant="label">{edge.label}</NativeText>}
      <NativeText selectable>{edge?.explanation ?? node?.summary}</NativeText>
      {acquired && !demo && <Action title="解説を読む" onPress={() => { onClose(); router.push({ pathname: '/word/[id]', params: { id: selected } }); }} />}
      {(edge || connected.length > 0) && <View>
        <NativeText variant="label" accessibilityRole="header">{edge ? 'つながっている知識' : 'この知識のつながり'}</NativeText>
        {edge ? [edge.sourceId, edge.targetId].map(id => <NavigationRow key={id} title={name(id)} onPress={() => onSelect(id)} />)
          : connected.map(item => <NavigationRow key={item.id} title={item.label} description={name(item.sourceId === selected ? item.targetId : item.sourceId)} onPress={() => onSelect(item.id)} />)}
      </View>}
      {demo && acquired && node?.detail && <NativeText selectable>{node.detail}</NativeText>}
      {reference.length > 0 && <View style={sheet.references}>
        <NativeText variant="caption">参考資料</NativeText>
        {reference.map(item => <Link key={item.url} href={item.url} style={[styles.body, sheet.link]}>{item.title} ↗</Link>)}
      </View>}
      <NativeText variant="caption">{demo ? (edge?.provenance ?? node?.provenance) === 'fixture' ? '架空の検証用データ · 学習内容ではありません' : '出典確認済みのデモ原稿 · 公開前の校閲は未実施' : '試作用原稿 · 周辺語の閲覧は回数を消費しません。'}</NativeText>
    </ScrollView>;
  return embedded ? content : <AppSheet title={title} closeLabel="詳細を閉じる" onClose={onClose} testID="map-sheet">{content}</AppSheet>;
}
const sheet = StyleSheet.create({ scroll: { flex: 1 }, content: { padding: spacing.md, gap: spacing.md }, references: { gap: spacing.sm }, link: { paddingVertical: spacing.sm, textDecorationLine: 'underline' } });
