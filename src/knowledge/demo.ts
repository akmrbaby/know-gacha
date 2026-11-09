import { knowledgeColors } from '../colors';
import { baseGraph } from './base';
import { graphForAcquired, type KnowledgeGraph } from './model';

import { extra, light } from '../data/additional-knowledge';
export const demoOrder = [...Object.keys(baseGraph.nodes).filter((id) => baseGraph.nodes[id].kind === 'knowledge')];
const nodes = { ...baseGraph.nodes, ...Object.fromEntries([...extra, light].map((node) => [node.id, node])) };
const positions = { ...baseGraph.positions };
// Fixed coordinates are presentation data, never semantic distance or force simulation.
const relations = [...baseGraph.relations];
// A deterministic artificial topology: local groups and a few bridges, no factual assertions.
for (let index = 10; index < 500; index++) {
  const id = `fixture-${index + 1}`;
  demoOrder.push(id);
  nodes[id] = { id, name: `架空の知識 ${index + 1}`, category: '規模検証用', kind: 'knowledge',
    summary: '架空の検証用データです。実際の学習内容ではありません。', detail: '点・線の密度と探索の見通しを調べるために生成した短文です。事実を説明する教材ではありません。',
    evidence: [], provenance: 'fixture', color: [knowledgeColors.teal, knowledgeColors.amber, knowledgeColors.violet][index % 3], mark: '◇' };
  const column = index % 20, row = Math.floor(index / 20);
  positions[id] = { x: (column - 9.5) * 200, y: 850 + row * 160 };
  const targetId = demoOrder[index % 10 === 0 ? index - 10 : index - 1];
  relations.push({ id: `${id}--${targetId}`, sourceId: id, targetId, type: 'fixture', label: '架空の接続',
    explanation: '規模検証用に生成した接続です。知識の事実関係を表しません。', evidence: [], provenance: 'fixture' });
}
export const demoGraph: KnowledgeGraph = { nodes, positions, relations };
export const demoSizes = [5, 10, 50, 100, 500] as const;
export function demoView(count: number) {
  if (!Number.isInteger(count) || count < 5 || count > 500) throw new Error('Demo count must be 5–500');
  return graphForAcquired(demoGraph, demoOrder.slice(0, count));
}
