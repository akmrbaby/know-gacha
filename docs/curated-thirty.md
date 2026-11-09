# 他学部の視点に出会う30教材（2026-11-09）

## 実装前の設計

対象は、大学卒業後に仕事の知識は必要に応じて調べる一方、専門外の概念に触れる機会が減った30歳前後の社会人。「他学部の授業で新しい概念を知った嬉しさ」を一日一回のガチャで再現する。分野独自の見方、説明後の発見、具体例と限界を持つテーマを採用し、Mapの接続のためだけに一般的な語を抽選対象へ増やさない。

承認済みの30件: 光電融合、エスノグラフィー、シュルレアリスム、CCD、ダダ、ユーザー中心設計（UCD）、アフォーダンス、環世界、予測処理、身体化認知、認知的不協和、エクサプテーション、ニッチ構築、分子進化の中立説、細胞内共生説、散逸構造、相転移、創発、経路依存性、取引費用、贈与論、リミナリティ、社会構築主義、想像の共同体、指標性、言語相対論、パフォーマティヴィティ、パラダイム、ブリコラージュ、リゾーム。

## 内容・画面

新規24教材と、短文だったCCD・ダダ・UCDに、日英で問い／概要／概念／具体例／限界を用意する。既存3教材も保持。原典や大学・学会・公的機関等の解説への参照を添える。独自の説明用の例は実験や研究成果と混同しない。仮説や学説の射程を断定しすぎず、翻訳と公開前校閲を区別する。

各教材をMapで探索できるよう、説明と根拠を持つ関係を追加する。新しい未開封教材は、開封前に本文や関係を露出させない。抽選対象数30と初期付与回数10は別で、付与ルールを維持する。言語切替ボタンの配置変更は別のUI改善として扱う。

## データ・移行

写真・コラージュ・ユーザーリサーチ・光ファイバーは新規抽選から外すが、IDと記事を互換用に保持する。履歴を復元でき、取得済みなら読書・Mapから参照できる。未取得時は周辺概念として表示できる。残数は現在の抽選対象の未取得数で数え、旧教材の取得数を差し引かない。保存形式・キー・権利消費・日付の扱いは変えない。

30教材と互換教材を分離し、検索・履歴は両方、抽選は30教材のみを参照する。デモは5/10/50/100/500件を維持し、最初の30件が実教材、それ以降が架空データになるよう基準数を可変にする。既存の10固定の文言とテストも更新する。

## 受け入れ条件

- 抽選対象は一意な30ID。全件に日英の本文・具体例・限界・参照URLがある。
- 旧10件の進捗を復元し、互換4件を再抽選せず、残り24件を正しく数える。追加付与や履歴削除を行わない。
- Mapのノード・関係・配置・参照が有効で、未取得教材を露出させない。デモ総数は500件。
- 翻訳・保存・抽選・Mapテスト、lint・型チェック、Webで新規記事／旧履歴／30件到達、iOS exportを確認する。実機の確認は別途。

## 教材と参照元

以下は新規・改稿27件の参照先。本文は引用やサイトの翻訳ではなく独自の説明で、具体例は説明用と明示している。学術論文は公開要旨を含めて確認。一部サイトは取得ツールに403やリダイレクト制限を返したため、索引・公開要旨で所在と内容を確認した。リンク先サイトの利用条件や全文公開の範囲は元サイトに従う。

| 教材 | 主な参照元 |
| --- | --- |
| CCD | [Nobel Prize: The 2009 Physics Prize](https://www.nobelprize.org/prizes/physics/2009/illustrated-information/?print=1) |
| ダダ | [MoMA: Dada](https://www.moma.org/collection/terms/dada) |
| ユーザー中心設計（UCD） | [GOV.UK: Understand users and their needs](https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs) |
| アフォーダンス | [OECS: Affordances](https://oecs.mit.edu/pub/984ungzu) |
| 環世界 | [University of Minnesota Press: Surface Encounters](https://manifold.umn.edu/read/a1d6deae-b96b-4bb9-8217-f41acf52f21c/section/17356e75-9cb7-4204-ab18-0710db5385b3) |
| 予測処理 | [Sprevak & Smith: Introduction to Predictive Processing](https://doi.org/10.1111/tops.12704) |
| 身体化認知 | [Stanford Encyclopedia: Embodied Cognition](https://plato.stanford.edu/entries/embodied-cognition/) |
| 認知的不協和 | [APA Dictionary: Cognitive dissonance](https://dictionary.apa.org/cognitive-dissonance) |
| エクサプテーション | [Gould & Vrba: Exaptation—a Missing Term](https://doi.org/10.1017/S0094837300004310) |
| ニッチ構築 | [An introduction to niche construction theory](https://pmc.ncbi.nlm.nih.gov/articles/PMC4922671/) |
| 分子進化の中立説 | [Nature Education: Neutral Theory](https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/) |
| 細胞内共生説 | [OpenStax Biology 2e: Eukaryotic Origins](https://openstax.org/books/biology-2e/pages/23-1-eukaryotic-origins) |
| 散逸構造 | [Nobel Prize: Ilya Prigogine](https://www.nobelprize.org/prizes/chemistry/1977/prigogine/facts/) |
| 相転移 | [Stanford: Introduction to Statistical Mechanics](https://web.stanford.edu/~peastman/statmech/phasetransitions.html) |
| 創発 | [Stanford Encyclopedia: Emergent Properties](https://plato.stanford.edu/entries/properties-emergent/) |
| 経路依存性 | [EH.net Encyclopedia: Path Dependence](https://eh.net/encyclopedia/path-dependence/) |
| 取引費用 | [Nobel Prize: Ronald Coase](https://www.nobelprize.org/prizes/economic-sciences/1991/coase/facts/) |
| 贈与論 | [Open Encyclopedia of Anthropology: Gifts](https://www.anthroencyclopedia.com/entry/gifts) |
| リミナリティ | [The Future of Indeterminacy: Liminality](https://indeterminacy.ac.uk/dictionary/liminality/) |
| 社会構築主義 | [Stanford Encyclopedia: Social Construction](https://plato.stanford.edu/entries/social-construction-naturalistic/) |
| 想像の共同体 | [Verso: Benedict Anderson, Imagined Communities](https://www.versobooks.com/products/1126-imagined-communities) |
| 指標性 | [Stanford Encyclopedia: Indexicals](https://plato.stanford.edu/entries/indexicals/) |
| 言語相対論 | [Annual Review of Anthropology: Linguistic Relativity](https://www.annualreviews.org/content/journals/10.1146/annurev.anthro.26.1.291) |
| パフォーマティヴィティ | [Stanford Encyclopedia: Speech Acts](https://plato.stanford.edu/entries/speech-acts/) |
| パラダイム | [Stanford Encyclopedia: Thomas Kuhn](https://plato.stanford.edu/entries/thomas-kuhn/) |
| ブリコラージュ | [Yale: Bricolage and Cultural Software](https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0) |
| リゾーム | [Routledge Encyclopedia: Gilles Deleuze](https://www.rep.routledge.com/articles/biographical/deleuze-gilles-1925-95/v-1) |

## 実装・検証記録

- 抽選対象30件・互換4件を分離。新規24件とCCD・ダダ・UCDの改稿3件に日英3節の本文を追加し、既存3件も含め全30件が3節の教材になった。
- Mapへ8周辺概念・31関係を追加。定義全体は30教材＋19周辺概念（互換4件を含む）の49ノード・49関係。開封状態に応じて表示を絞る。互換教材の取得記録だけを特別に受け入れ、通常の周辺概念は取得扱いにしない。
- 残数とGachaの進捗割合は抽選対象の取得数から計算する。旧10件を全取得した場合は6/30と表示し、履歴には従来の全10件を残す。追加24件の取得後は30/30、履歴は34件となる。
- デモは実教材30件＋架空470件へ更新。説明文も実教材数から計算し、5/10/50/100/500件の切り替えを保持する。
- lint・型チェック・Nodeテスト8ファイルが成功。全IDの一意性、30件の本文・参照URL・日英対応、旧10件の復元と24件追加、権利の不変、完了後の追加消費防止、Mapの開示範囲・全ノード配置・500件デモを検証。
- Webで旧10件から、翌日分を24回消費して新しい24件だけが出ること、旧履歴が同一のまま34件となることを確認。全件取得後の再起動、旧「写真」の読書、新規「アフォーダンス」の英語全文・参照リンク、Map一覧を確認。
- 新規端末の初期10回・保存失敗・連打・再読み込み、日英切り替え・設定保存失敗・資料言語、詳細シートのhalf/full・小画面／文字拡大での末尾表示もWebで成功。iOS exportが成功。
- iPhoneでの新教材表示と読み心地、原稿の公開前校閲は未実施。ネイティブ依存・設定の変更はなく、1.0.2の互換ビルドへ通常のpreview更新で届けられる。
