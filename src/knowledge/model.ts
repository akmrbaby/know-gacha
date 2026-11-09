export type Evidence = { title: string; url: string };
export type KnowledgeNode = {
  id: string; name: string; category: string; kind: 'knowledge' | 'concept';
  // A former draw candidate can still be present in an existing acquisition ledger.
  archived?: boolean;
  summary: string; detail?: string; evidence: Evidence[];
  provenance: 'sourced' | 'fixture';
  color: string; mark: string;
};
export type GraphRelation = {
  id: string; sourceId: string; targetId: string; type: string;
  label: string; explanation: string; evidence: Evidence[];
  provenance: 'sourced' | 'fixture';
};
export type Position = { x: number; y: number };
export type KnowledgeGraph = {
  nodes: Record<string, KnowledgeNode>;
  relations: GraphRelation[];
  positions: Record<string, Position>;
};
export type GraphView = { ids: string[]; edges: GraphRelation[] };

// Acquiring content is separate from its graph definition. Unknown IDs never unlock anything.
export function graphForAcquired(graph: KnowledgeGraph, acquiredIds: readonly string[]): GraphView {
  const acquired = new Set(acquiredIds.filter((id) => graph.nodes[id]?.kind === 'knowledge' || graph.nodes[id]?.archived));
  const ids = new Set(acquired);
  const edges = graph.relations.filter((edge) => {
    const a = graph.nodes[edge.sourceId], b = graph.nodes[edge.targetId];
    if (!a || !b) return false;
    if (a.kind === 'knowledge' && b.kind === 'knowledge') return acquired.has(a.id) && acquired.has(b.id);
    return (acquired.has(a.id) && b.kind === 'concept') || (acquired.has(b.id) && a.kind === 'concept');
  });
  for (const edge of edges) { ids.add(edge.sourceId); ids.add(edge.targetId); }
  return { ids: [...ids], edges };
}

export function neighborhood(view: GraphView, selected: string): GraphView {
  const selectedEdge = view.edges.find((edge) => edge.id === selected);
  const anchors = new Set(selectedEdge ? [selectedEdge.sourceId, selectedEdge.targetId] : [selected]);
  const edges = view.edges.filter((edge) => anchors.has(edge.sourceId) || anchors.has(edge.targetId));
  const ids = new Set(view.ids.filter((id) => anchors.has(id)));
  for (const edge of edges) { ids.add(edge.sourceId); ids.add(edge.targetId); }
  return { ids: [...ids], edges };
}

export function graphCounts(graph: KnowledgeGraph, view: GraphView) {
  return { acquired: view.ids.filter((id) => graph.nodes[id].kind === 'knowledge').length,
    concepts: view.ids.filter((id) => graph.nodes[id].kind === 'concept').length, relations: view.edges.length };
}
