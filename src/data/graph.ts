import { keywords } from './keywords';
export type RelatedConcept = { id: string; name: string; summary: string; sourceUrl: string };
export type Relation = { id: string; sourceId: string; targetId: string; ownerId: string; label: string; explanation: string; evidence?: { title: string; url: string }[] };
// 試作用原稿。参照先を添付し、公開前に校閲する。
export const relatedConcepts: RelatedConcept[] = [
  { id: 'photography', name: '写真', summary: '調査の記録にも、芸術表現にも用いられる媒体です。利用する分野によって目的や読み取り方が異なります。', sourceUrl: 'https://www.anthroencyclopedia.com/entry/photography' },
  { id: 'optical-communication', name: '光通信', summary: '光に情報を載せて伝える技術。光ファイバー通信などで使われます。', sourceUrl: 'https://flets.com/navigation/column/optical_cable/' },
  { id: 'silicon-photonics', name: 'シリコンフォトニクス', summary: 'シリコンを基盤に、光を扱う小さな回路や部品を作る技術です。', sourceUrl: 'https://www.intel.com/content/www/us/en/research/integrated-photonics.html' },
  { id: 'participant-observation', name: '参与観察', summary: '人々の活動に参加しながら観察し、その場の実践や意味を理解する調査方法です。', sourceUrl: 'https://www.anthroencyclopedia.com/entry/ethnography' },
  { id: 'fieldnotes', name: 'フィールドノート', summary: '現場で見聞きしたことや、調査者の気づき・解釈を記録したノートです。', sourceUrl: 'https://www.anthroencyclopedia.com/entry/ethnography' },
  { id: 'automatism', name: '自動記述', summary: '意識的に文章を整える働きを抑え、浮かぶ言葉を書き留める表現の方法です。', sourceUrl: 'https://www.tate.org.uk/art/art-terms/a/automatism' },
  { id: 'andre-breton', name: 'アンドレ・ブルトン', summary: 'フランスの詩人・作家。シュルレアリスムの運動を主導した人物の一人です。', sourceUrl: 'https://www.tate.org.uk/art/art-terms/s/surrealism' },
];
export const relations: Relation[] = [
  { id: 'ethnography-photography', ownerId: 'ethnography', sourceId: 'ethnography', targetId: 'photography', label: '調査・記録の方法の一つ', explanation: 'エスノグラフィーには写真を用いて生活や行動を記録し、解釈する実践があります。写真は文脈や撮影者の視点を含む資料であり、調査全体を写真だけに置き換えるという意味ではありません。', evidence: [{ title: 'Open Encyclopedia of Anthropology: Photography', url: 'https://www.anthroencyclopedia.com/entry/photography' }] },
  { id: 'surrealism-photography', ownerId: 'surrealism', sourceId: 'surrealism', targetId: 'photography', label: '表現媒体の一つ', explanation: 'シュルレアリスムでは、フォトモンタージュやフォトグラムなどの写真表現も用いられました。調査での写真利用とは目的が異なり、この線は人類学との直接の影響関係を表しません。', evidence: [{ title: 'V&A: Surrealist photography', url: 'https://www.vam.ac.uk/articles/surrealist-photography' }] },
  { id: 'photonics-communication', ownerId: 'photonics-electronics', sourceId: 'photonics-electronics', targetId: 'optical-communication', label: '利用する技術', explanation: '光電融合では、電子回路と光による情報伝送を組み合わせます。光通信の技術が、装置間や装置内部の情報の受け渡しを支えます。' },
  { id: 'photonics-silicon', ownerId: 'photonics-electronics', sourceId: 'photonics-electronics', targetId: 'silicon-photonics', label: '実現を支える技術の一つ', explanation: '光を扱う部品を小さく集積するシリコンフォトニクスは、光と電子回路を近づけるための技術の一つです。光電融合のすべてを指す言葉ではありません。' },
  { id: 'ethnography-observation', ownerId: 'ethnography', sourceId: 'ethnography', targetId: 'participant-observation', label: '主要な調査方法の一つ', explanation: 'エスノグラフィーでは、参与観察を通して人々の生活や活動の文脈を理解します。聞き取りや資料の検討も併せて行われます。' },
  { id: 'ethnography-notes', ownerId: 'ethnography', sourceId: 'ethnography', targetId: 'fieldnotes', label: '調査を記録する手段', explanation: '観察した出来事や会話、調査者の解釈をフィールドノートに記録します。記録を振り返ることが記述や分析につながります。' },
  { id: 'surrealism-automatism', ownerId: 'surrealism', sourceId: 'surrealism', targetId: 'automatism', label: '表現の方法の一つ', explanation: 'シュルレアリスムは夢や無意識に関心を寄せ、自動記述を表現の方法の一つとして実践しました。運動全体がこの方法だけで説明できるわけではありません。' },
  { id: 'breton-surrealism', ownerId: 'surrealism', sourceId: 'andre-breton', targetId: 'surrealism', label: '運動を主導した人物の一人', explanation: 'ブルトンは1924年にシュルレアリスム宣言を発表し、運動を主導しました。シュルレアリスムには多くの作家が関わっています。' },
];
export const specimens: Record<string, { mark: string; color: string; tint: string }> = {
  'photonics-electronics': { mark: '◇', color: '#286D73', tint: '#E5F0EB' },
  ethnography: { mark: '◎', color: '#8B592F', tint: '#F5EBDC' },
  surrealism: { mark: '✳', color: '#775B86', tint: '#EEE7F2' },
};
export type Position = { x: number; y: number };
export const positions: Record<string, Position> = {};
// Fixed, version 2: a spatial atlas; distances have no semantic weight.
const clusterCenters = [{ x: -270, y: -220 }, { x: 300, y: -70 }, { x: -150, y: 340 }];
keywords.forEach((word, index) => {
  const { x, y } = clusterCenters[index];
  positions[word.id] = { x, y };
  relations.filter((edge) => edge.ownerId === word.id && edge.targetId !== 'photography').forEach((edge, i) => {
    const other = edge.sourceId === word.id ? edge.targetId : edge.sourceId;
    positions[other] = { x: x + (i === 0 ? -145 : 145), y: y + (i === 0 ? 155 : 185) };
  });
});
// One shared concept has one stable location, independent of the acquisition order.
positions.photography = { x: 0, y: 40 };
export const conceptName = (id: string) => keywords.find((word) => word.id === id)?.name ?? relatedConcepts.find((word) => word.id === id)?.name ?? '';
export function ownerOf(id: string) { return keywords.some((word) => word.id === id) ? id : relations.find((edge) => edge.sourceId === id || edge.targetId === id)?.ownerId; }
