import { relatedConcepts, relations, positions, specimens, ownerOf } from '../data/graph';
import { keywords } from '../data/keywords';
import type { KnowledgeGraph, KnowledgeNode } from './model';

// Adapter keeps the original three-word Gacha and saved IDs intact.
const nodes: Record<string, KnowledgeNode> = {};
for (const word of keywords) {
  const look = specimens[word.id];
  nodes[word.id] = { id: word.id, name: word.name, category: word.category, kind: 'knowledge', summary: word.introduction,
    detail: [word.summary, ...word.sections.map((section) => `${section.title}\n${section.body}`)].join('\n\n'),
    evidence: relatedConcepts.filter((concept) => relations.some((edge) => edge.ownerId === word.id && (edge.sourceId === concept.id || edge.targetId === concept.id))).map((concept) => ({ title: concept.name, url: concept.sourceUrl })),
    provenance: 'sourced', color: look.color, mark: look.mark };
}
for (const concept of relatedConcepts) {
  const look = specimens[ownerOf(concept.id)!];
  nodes[concept.id] = { id: concept.id, name: concept.name, category: '周辺概念', kind: 'concept', summary: concept.summary,
    evidence: [{ title: concept.name, url: concept.sourceUrl }], provenance: 'sourced', color: look.color, mark: '·' };
}
for (const node of Object.values(nodes)) node.evidence = [...new Map(node.evidence.map((item) => [item.url, item])).values()];
export const baseGraph: KnowledgeGraph = {
  nodes, positions,
  relations: relations.map((edge) => ({ id: edge.id, sourceId: edge.sourceId, targetId: edge.targetId,
    type: ({ 'photonics-communication': 'uses', 'photonics-silicon': 'enabled-by', 'ethnography-observation': 'method', 'ethnography-notes': 'records', 'surrealism-automatism': 'method', 'breton-surrealism': 'led-by' }[edge.id] ?? 'context'), label: edge.label, explanation: edge.explanation, provenance: 'sourced',
    evidence: nodes[edge.sourceId].kind === 'concept' ? nodes[edge.sourceId].evidence : nodes[edge.targetId].evidence })),
};
