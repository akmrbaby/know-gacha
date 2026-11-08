import { forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationNodeDatum } from 'd3-force';
import type { GraphView, KnowledgeGraph, Position } from '../knowledge/model';

type Particle = SimulationNodeDatum & { id: string; x: number; y: number };

// Owns mutable physics particles, never the knowledge graph. No timer or renderer is
// created here: the caller schedules ticks only while active on the JS runtime.
// This d3 implementation is not a Reanimated worklet; never call it on the UI runtime.
export function createLayout(graph: KnowledgeGraph, view: GraphView) {
  const simulation = forceSimulation<Particle>([]).stop()
    .alphaDecay(0.035).velocityDecay(0.45)
    .force('charge', forceManyBody<Particle>().strength(-1100))
    .force('collision', forceCollide<Particle>((node) => graph.nodes[node.id]?.kind === 'knowledge' ? 80 : 50).iterations(2));
  let particles = new Map<string, Particle>();
  let held: string | undefined;

  function update(next: GraphView) {
    const nextIds = new Set(next.ids);
    const neighbors = new Map<string, string[]>();
    for (const edge of next.edges) {
      for (const [a, b] of [[edge.sourceId, edge.targetId], [edge.targetId, edge.sourceId]]) {
        const list = neighbors.get(a) ?? []; list.push(b); neighbors.set(a, list);
      }
    }
    const retained = [...particles.values()];
    const center = retained.length ? { x: retained.reduce((sum, node) => sum + node.x, 0) / retained.length, y: retained.reduce((sum, node) => sum + node.y, 0) / retained.length } : { x: 0, y: 0 };
    const nodes = next.ids.map((id, index): Particle => {
      const existing = particles.get(id);
      if (existing) return existing;
      // Prefer a retained neighbor to a fixture coordinate for newly added nodes.
      const neighbor = (neighbors.get(id) ?? []).map((key) => particles.get(key)).find(Boolean);
      const radius = 100 * Math.sqrt(index + 1), angle = index * Math.PI * (3 - Math.sqrt(5));
      const seed = !retained.length && graph.positions[id] ? graph.positions[id] : neighbor ? { x: neighbor.x + 90, y: neighbor.y + 90 } : { x: center.x + Math.cos(angle) * radius, y: center.y + Math.sin(angle) * radius };
      return { id, x: seed?.x ?? 0, y: seed?.y ?? 0, vx: 0, vy: 0 };
    });
    if (held && !nextIds.has(held)) held = undefined;
    particles = new Map(nodes.map((node) => [node.id, node]));
    // Remove old links before replacing nodes: hidden endpoints may no longer exist.
    simulation.force('links', null).nodes(nodes).force('links', forceLink<Particle, { source: string; target: string }>(
      next.edges.filter((edge) => nextIds.has(edge.sourceId) && nextIds.has(edge.targetId))
        .map((edge) => ({ source: edge.sourceId, target: edge.targetId })),
    ).id((node) => node.id).distance(200).strength(0.12));
    simulation.alphaTarget(held ? 0.15 : 0).alpha(0.7);
  }
  function release() {
    if (held) {
      const node = particles.get(held);
      if (node) { node.fx = null; node.fy = null; }
    }
    held = undefined;
    simulation.alphaTarget(0);
  }
  update(view);
  return {
    update,
    get active() { return simulation.alpha() >= simulation.alphaMin() || held !== undefined; },
    tick() {
      if (simulation.alpha() >= simulation.alphaMin() || held) simulation.tick();
    },
    hold(id: string, position: Position) {
      const node = particles.get(id);
      if (!node) return;
      if (held !== id) release();
      held = id;
      node.x = node.fx = position.x; node.y = node.fy = position.y;
      node.vx = node.vy = 0;
      simulation.alphaTarget(0.15).alpha(Math.max(0.3, simulation.alpha()));
    },
    release,
    positions(): Record<string, Position> {
      return Object.fromEntries([...particles].map(([id, node]) => [id, { x: node.x, y: node.y }]));
    },
    stop() { release(); simulation.alpha(0).stop(); },
  };
}
