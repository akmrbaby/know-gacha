import { baseGraph } from './base';
import { graphForAcquired, type Evidence, type GraphRelation, type KnowledgeGraph, type KnowledgeNode } from './model';

const sources = {
  optics: { title: 'Nobel Prize 2009: 光ファイバーとCCD', url: 'https://www.nobelprize.org/prizes/physics/2009/illustrated-information/?print=1' },
  photonics: { title: 'Intel: Integrated Photonics', url: 'https://www.intel.com/content/www/us/en/research/integrated-photonics.html' },
  surrealism: { title: 'MoMA: Surrealism', url: 'https://www.moma.org/collection/terms/surrealism' },
  dada: { title: 'MoMA: Dada', url: 'https://www.moma.org/collection/terms/dada' },
  collage: { title: 'MoMA: Chance Creations', url: 'https://www.moma.org/collection/terms/dada/chance-creations-collage-photomontage-and-assemblage' },
  observation: { title: 'GOV.UK: Contextual research and observation', url: 'https://www.gov.uk/service-manual/user-research/contextual-research-and-observation' },
  design: { title: 'GOV.UK: Understand users and their needs', url: 'https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs' },
};
const extra: KnowledgeNode[] = [
  { id: 'optical-fiber', name: '光ファイバー', category: '技術', summary: '細い繊維の中で光を導き、情報を運ぶ。', detail: '光通信では、光を導く繊維を伝送路として使います。光電融合そのものと同義ではなく、光による情報伝送を支える技術です。', evidence: [sources.optics], color: '#286D73', mark: '↝' },
  { id: 'ccd', name: 'CCD', category: '技術', summary: '光を電子的にとらえる撮像用の半導体回路。', detail: 'CCDは光を電子的な信号として記録する撮像技術です。写真をフィルムだけでなく電子的に記録する道を広げました。すべてのデジタルカメラがCCDを使うわけではありません。', evidence: [sources.optics], color: '#286D73', mark: '▦' },
  { id: 'photography', name: '写真', category: '芸術・技術', summary: '光を記録する仕組みと、表現としての写真。', detail: '写真は光をとらえて像を記録します。ここではCCDによる電子的記録と、MoMAが紹介するマン・レイの写真作品を入口に、技術と芸術の二つの側面をたどります。', evidence: [sources.optics, sources.surrealism], color: '#775B86', mark: '▣' },
  { id: 'dada', name: 'ダダ', category: '芸術・思想', summary: '既存の芸術の秩序を問い、偶然や日用品も表現に取り込む。', detail: '第一次世界大戦期に生まれた芸術・文学の運動です。コラージュやフォトモンタージュ、日用品など、多様な素材と方法を用いました。', evidence: [sources.dada], color: '#775B86', mark: '＋' },
  { id: 'collage', name: 'コラージュ', category: '芸術・思想', summary: '異なる断片を組み合わせて、一つの作品にする。', detail: '紙片などを組み合わせる表現です。MoMAはダダの実践として、ハンス・アルプが偶然を取り入れたコラージュなどを紹介しています。', evidence: [sources.collage], color: '#775B86', mark: '▧' },
  { id: 'user-research', name: 'ユーザーリサーチ', category: '社会・デザイン', summary: '利用する人の行動や状況を調べ、設計の判断に役立てる。', detail: '人々の普段の環境を訪れ、行動を観察する方法があります。実際の道具や周囲の状況も含めて、サービスに必要なことを理解します。エスノグラフィー全体と同じ意味ではありません。', evidence: [sources.observation], color: '#8B592F', mark: '◎' },
  { id: 'user-centered-design', name: 'ユーザー中心設計', category: '社会・デザイン', summary: '使う人の目的と状況を理解することから設計を進める。', detail: 'GOV.UKのサービス基準は、利用者とその課題を理解し、調査や試作を通じて仮説を確かめることを求めています。特定の解決策を先に決めるのではなく、人が達成したいことを起点にします。', evidence: [sources.design], color: '#8B592F', mark: '↗' },
].map((node) => ({ ...node, kind: 'knowledge', provenance: 'sourced' }));
const light: KnowledgeNode = { id: 'light', name: '光', category: '周辺概念', kind: 'concept', summary: '情報の伝送にも、像の記録にも使われる。両者が同じ目的という意味ではありません。', evidence: [sources.optics, sources.photonics], provenance: 'sourced', color: '#286D73', mark: '·' };
function relation(sourceId: string, targetId: string, type: string, label: string, explanation: string, evidence: Evidence[]): GraphRelation {
  return { id: `${sourceId}--${targetId}`, sourceId, targetId, type, label, explanation, evidence, provenance: 'sourced' };
}
const extraRelations = [
  relation('photonics-electronics', 'light', 'uses', '情報伝送に使う', '光電融合は光による情報の入出力と電子回路を組み合わせます。', [sources.photonics]),
  relation('optical-fiber', 'optical-communication', 'supports', '伝送路として支える', '光ファイバーは光通信で光を導く伝送路になります。', [sources.optics]),
  relation('ccd', 'light', 'detects', '記録する光をとらえる', 'CCDは光を電子的にとらえる撮像用の半導体回路です。', [sources.optics]),
  relation('photography', 'light', 'records', '像として記録する', '写真の電子的な記録では、CCDなどの撮像素子が光をとらえます。', [sources.optics]),
  relation('photography', 'ccd', 'uses', '電子的な記録手段の一つ', 'CCDは写真を電子的に記録する技術の一つです。', [sources.optics]),
  relation('surrealism', 'photography', 'medium', '写真作品も含む', 'MoMAはシュルレアリスムの作品としてマン・レイによるアンドレ・ブルトンの写真を紹介しています。写真全体がこの運動に属するという意味ではありません。', [sources.surrealism]),
  relation('dada', 'collage', 'method', '表現方法の一つ', 'MoMAはダダの表現方法としてコラージュを紹介しています。', [sources.dada, sources.collage]),
  relation('dada', 'photography', 'method', '写真の断片も用いる', 'ダダの表現には写真の断片を組み合わせるフォトモンタージュがあります。', [sources.dada]),
  relation('user-research', 'participant-observation', 'method', '現場での観察を用いる', 'ユーザーリサーチにも日常の現場で活動を観察する方法があります。参与の度合いは調査によって異なり、両者を同一視する線ではありません。', [sources.observation]),
  relation('user-research', 'fieldnotes', 'records', '現場での観察を記録する', 'GOV.UKの現場調査の案内では、見聞きしたことをノートに記録します。エスノグラフィーでも記録が分析を支えます。', [sources.observation]),
  relation('user-centered-design', 'user-research', 'informed-by', '利用者の理解を調査で深める', 'GOV.UKのサービス基準は、設計にあたりユーザーリサーチで利用者の必要を理解することを求めます。', [sources.design]),
];
export const demoOrder = [...Object.keys(baseGraph.nodes).filter((id) => baseGraph.nodes[id].kind === 'knowledge'), ...extra.map((node) => node.id)];
const nodes = { ...baseGraph.nodes, ...Object.fromEntries([...extra, light].map((node) => [node.id, node])) };
const positions = { ...baseGraph.positions };
// Fixed coordinates are presentation data, never semantic distance or force simulation.
const extraPositions = [ { x: -520, y: -380 }, { x: -80, y: -410 }, { x: -90, y: 80 }, { x: 190, y: 420 }, { x: 480, y: 440 }, { x: 520, y: 100 }, { x: 700, y: -180 } ];
extra.forEach((node, index) => { positions[node.id] = extraPositions[index]; });
positions.light = { x: -340, y: 0 };
const relations = [...baseGraph.relations, ...extraRelations];
// A deterministic artificial topology: local groups and a few bridges, no factual assertions.
for (let index = 10; index < 500; index++) {
  const id = `fixture-${index + 1}`;
  demoOrder.push(id);
  nodes[id] = { id, name: `架空の知識 ${index + 1}`, category: '規模検証用', kind: 'knowledge',
    summary: '架空の検証用データです。実際の学習内容ではありません。', detail: '点・線の密度と探索の見通しを調べるために生成した短文です。事実を説明する教材ではありません。',
    evidence: [], provenance: 'fixture', color: ['#286D73', '#8B592F', '#775B86'][index % 3], mark: '◇' };
  const column = index % 20, row = Math.floor(index / 20);
  positions[id] = { x: (column - 9.5) * 200, y: 850 + row * 160 };
  const targetId = demoOrder[index % 10 === 0 ? index - 10 : index - 1];
  relations.push({ id: `${id}--${targetId}`, sourceId: id, targetId, type: 'fixture', label: '架空の接続',
    explanation: '規模検証用に生成した接続です。知識の事実関係を表しません。', evidence: [], provenance: 'fixture' });
}
export const demoGraph: KnowledgeGraph = { nodes, positions, relations };
export const demoSizes = [5, 10, 100, 500] as const;
export function demoView(count: number) {
  if (!Number.isInteger(count) || count < 5 || count > 500) throw new Error('Demo count must be 5–500');
  return graphForAcquired(demoGraph, demoOrder.slice(0, count));
}
