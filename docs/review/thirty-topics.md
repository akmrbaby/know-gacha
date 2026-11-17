# 30語の校閲用原稿（日英）

状態：**校閲待ち**。現行の抽選対象30語を、アプリと同じ順序で掲載しています。旧履歴互換用の4語は対象外です。本文を変更せず抽出した原稿で、校閲済みの宣言ではありません。

想定読者：専門外の概念に触れる機会が減った、30歳前後の高学歴の社会人。他学部の授業で新しい見方を知った嬉しさを、一日一語の発見で再現します。

確認する観点は、定義と限界の正確さ、具体例の適切さ、専門外の人に伝わるか、既知の語でも発見があるか、日英の意味の一致、参考資料との対応です。

修正指示は「語名／該当箇所／修正内容」の形で会話や別のメモへ残してください。このファイルは`npm run content:review`で再生成されるため、直接書き込んだメモは再生成で消えます。

## 目次

1. [光電融合](#topic-photonics-electronics)
2. [エスノグラフィー](#topic-ethnography)
3. [シュルレアリスム](#topic-surrealism)
4. [CCD](#topic-ccd)
5. [ダダ](#topic-dada)
6. [ユーザー中心設計（UCD）](#topic-user-centered-design)
7. [アフォーダンス](#topic-affordance)
8. [環世界](#topic-umwelt)
9. [予測処理](#topic-predictive-processing)
10. [身体化認知](#topic-embodied-cognition)
11. [認知的不協和](#topic-cognitive-dissonance)
12. [エクサプテーション](#topic-exaptation)
13. [ニッチ構築](#topic-niche-construction)
14. [分子進化の中立説](#topic-neutral-theory)
15. [細胞内共生説](#topic-endosymbiosis)
16. [散逸構造](#topic-dissipative-structures)
17. [相転移](#topic-phase-transition)
18. [創発](#topic-emergence)
19. [経路依存性](#topic-path-dependence)
20. [取引費用](#topic-transaction-costs)
21. [贈与論](#topic-gift-exchange)
22. [リミナリティ](#topic-liminality)
23. [社会構築主義](#topic-social-construction)
24. [想像の共同体](#topic-imagined-communities)
25. [指標性](#topic-indexicality)
26. [言語相対論](#topic-linguistic-relativity)
27. [パフォーマティヴィティ](#topic-performativity)
28. [パラダイム](#topic-paradigm)
29. [ブリコラージュ](#topic-bricolage)
30. [リゾーム](#topic-rhizome)

<a id="topic-photonics-electronics"></a>

## 01. 光電融合

ID: `photonics-electronics`

### 日本語

分野：技術

**導入・問い**

計算する電気と、情報を運ぶ光。その得意技を組み合わせたら？

**概要**

光電融合は、光の技術と電子回路の技術を組み合わせる考え方です。電子回路は計算や制御を得意とし、光は多くの情報を運ぶ手段として使われます。両者を近づけることで、情報処理を支える通信の速度や消費電力の改善を目指します。

#### なぜ、光を使うのか

データセンターでは、計算するだけでなく、装置や半導体の間で膨大なデータを移動させます。電気で高速に信号を運ぶと、配線の損失や発熱などが課題になります。光通信の技術を装置の内部へ近づけることが、その解決策の一つです。

#### 光と電気の受け渡し

たとえば電子回路で作った信号を光の信号に変え、光ファイバーなどで運び、受信側で電気に戻します。この変換を担う部品と電子回路を近くに配置したり、一体的に作ったりすることが研究・開発されています。

#### すべてが光になるわけではない

光電融合は、すべての計算を光へ置き換えることと同じではありません。変換にもエネルギーや部品が必要です。どこまで光で運び、どこを電気で処理するか。その分担が大切です。

### English

**Integrated photonics and electronics** · Technology

**Introduction**

Electronics computes; light carries information. What happens when their strengths meet?

**Summary**

Integrating photonics and electronics brings optical technology together with electronic circuits. Electronics is well suited to computation and control, while light can carry large amounts of information. Bringing them closer aims to improve the speed and energy efficiency of communication within information systems.

#### Why use light?

Data centers do more than compute: they move enormous amounts of data between devices and chips. High-speed electrical connections face challenges including transmission losses and heat. Bringing optical communication inside devices is one approach to these problems.

#### Passing information between light and electronics

For example, a signal produced by an electronic circuit can be converted into light, sent through an optical fiber, and converted back into an electrical signal at the receiver. Research and development aim to place the components that perform these conversions close to electronic circuits, or integrate them together.

#### Not every calculation becomes optical

Integrating photonics and electronics does not mean replacing all computation with light. Conversion also requires energy and components. Deciding where to transmit information optically and where to process it electronically is an essential part of the design.

### 参考資料（アプリに掲載する参照先）

- [光通信](https://flets.com/navigation/column/optical_cable/)
- [Intel: Integrated Photonics](https://www.intel.com/content/www/us/en/research/integrated-photonics.html)
- [光](https://www.nobelprize.org/prizes/physics/2009/illustrated-information/?print=1)

<a id="topic-ethnography"></a>

## 02. エスノグラフィー

ID: `ethnography`

### 日本語

分野：社会・文化

**導入・問い**

「何をしているか」の奥にある、その人たちの当たり前を知る。

**概要**

エスノグラフィーは、人々の生活や活動の場に関わり、観察や対話を通して、その行動や意味を文脈ごと理解し、記述する営みです。文化人類学で発展し、今では組織やデザインの研究などでも用いられています。

#### 日常の中へ入る

質問票への回答だけでは、普段の振る舞いや暗黙のルールは見えにくいことがあります。研究者は一定の時間を現場で過ごし、活動に参加しながら観察する「参与観察」や、聞き取り、記録の検討などを組み合わせます。

#### 一杯のお茶から見えること

たとえば職場のお茶の時間。一見ただの休憩でも、仕事の相談や新人への助言が交わされているかもしれません。これは説明のための架空の例ですが、行動を数えるだけでなく、その場でどんな意味を持つかを問う視点を示しています。

#### 観察者の視点も問い直す

観察したことが、そのまま唯一の真実になるわけではありません。誰と関わったか、研究者がどう解釈したかによって記述は変わります。同意やプライバシーへの配慮と、自分の立場を振り返る姿勢が欠かせません。

### English

**Ethnography** · Society & culture

**Introduction**

Look beyond what people do to understand what feels ordinary to them.

**Summary**

Ethnography involves engaging with people's lives and activities, using observation and dialogue to understand and describe actions and meanings in context. It developed in cultural anthropology and is now also used in fields such as organizational and design research.

#### Entering everyday life

Questionnaire answers alone may not reveal everyday behavior or unspoken rules. Researchers spend time in the field, combining participant observation—observing while taking part in activities—with interviews and the examination of records and other materials.

#### What a cup of tea can reveal

Consider a workplace tea break. What looks like a simple pause may also be a chance to discuss work or offer advice to a newcomer. This is a fictional illustration: it shows how ethnography asks what an action means in its setting, rather than only counting how often it happens.

#### Questioning the observer's perspective

An observation does not automatically become the only truth. An account depends on whom the researcher engaged with and how they interpreted events. Consent, privacy, and reflection on the researcher's own position are essential.

### 参考資料（アプリに掲載する参照先）

- [Open Encyclopedia of Anthropology: Photography](https://www.anthroencyclopedia.com/entry/photography)
- [フィールドノート](https://www.anthroencyclopedia.com/entry/ethnography)

<a id="topic-surrealism"></a>

## 03. シュルレアリスム

ID: `surrealism`

### 日本語

分野：芸術・思想

**導入・問い**

夢の中の不思議さで、見慣れた現実を揺さぶる。

**概要**

シュルレアリスム（超現実主義）は、夢や無意識に注目し、理性や慣習だけに縛られない表現を探った芸術・文学の運動です。1924年のアンドレ・ブルトンによる宣言は、その重要な節目となりました。

#### 奇妙な絵だけではない

現実にはありそうにない組み合わせを描く絵画がよく知られていますが、詩や文章、写真、映画などにも広がりました。単なる奇抜さではなく、普段当然だと思っている現実の捉え方を問い直す試みでもありました。

#### 考える前に書いてみる

代表的な実践に、自動記述があります。文章を論理的に整えようとする意識をできるだけ抑え、浮かぶ言葉を記していく方法です。無意識への関心が背景にありますが、書かれた内容を科学的な心の測定結果とみなすものではありません。

#### 見慣れたものの、新しい出会い

日用品が思いがけない場所にあるだけで、その意味が違って見えることがあります。シュルレアリスムは、こうした出会いやずれを通じて、日常の秩序の外側にある可能性を探りました。作品ごと、作家ごとに方法や考え方は異なります。

### English

**Surrealism** · Art & ideas

**Introduction**

Let the strangeness of dreams unsettle familiar reality.

**Summary**

Surrealism is an artistic and literary movement that explored dreams and the unconscious, seeking expression beyond the limits of reason and convention. André Breton's 1924 Surrealist Manifesto was an important milestone.

#### More than strange paintings

Surrealism is known for paintings that combine things in seemingly impossible ways, but it also spread into poetry, writing, photography, and film. Beyond novelty, it questioned ways of seeing reality that are usually taken for granted.

#### Writing before conscious editing

One practice was automatic writing: letting words emerge while holding back the impulse to organize them logically or polish the language. It reflected an interest in the unconscious, but the resulting writing should not be treated as a scientific measurement of the mind.

#### New encounters between familiar things

An everyday object can take on a different meaning when it appears somewhere unexpected. Surrealism used such encounters and displacements to explore possibilities beyond ordinary arrangements. Methods varied across works and artists.

### 参考資料（アプリに掲載する参照先）

- [写真](https://www.anthroencyclopedia.com/entry/photography)
- [自動記述](https://www.tate.org.uk/art/art-terms/a/automatism)
- [アンドレ・ブルトン](https://www.tate.org.uk/art/art-terms/s/surrealism)
- [V&A: Surrealist photography](https://www.vam.ac.uk/articles/surrealist-photography)

<a id="topic-ccd"></a>

## 04. CCD

ID: `ccd`

### 日本語

分野：半導体・撮像技術

**導入・問い**

光を、保存できる画像へ変えるには？

**概要**

CCDは、受けた光に応じた電荷を蓄え、順に転送して読み出す半導体技術です。光の分布を電気の信号へ変えることで、画像を電子的に記録できます。

#### 概念をつかむ

撮像用CCDでは、光によって生じた電荷を画素ごとに集めます。電圧を制御して電荷を隣へ送る仕組みが、離れた場所の明暗を一枚の画像として読み出せるようにします。

#### 身近な場面で考える

説明用に、雨の量を量る容器が格子状に並び、中身を順番に受け渡して一か所で量る場面を想像してください。集める場所と読み出す場所を分ける仕組みが見えてきます。

#### どこまで説明できる？

画質は画素数だけで決まらず、ノイズや光学系にも左右されます。現在の撮像素子にはCMOSも広く使われ、CCDがすべてのデジタルカメラに入っているわけではありません。

### English

**CCD** · Semiconductors and imaging

**Introduction**

How can light become a stored image?

**Summary**

A CCD collects light-generated charge and transfers it for readout, turning a pattern of light into electrical signals.

#### Understanding the concept

In an imaging CCD, pixels collect charge generated by light. Controlled voltages move those charges toward a readout circuit.

#### A concrete example

Imagine a grid of rain collectors passing their contents along to one measuring station. This analogy separates collection from readout.

#### Scope and limits

Image quality also depends on noise and optics. CMOS sensors are widely used too; digital cameras do not all contain CCDs.

### 参考資料（アプリに掲載する参照先）

- [Nobel Prize 2009: 光ファイバーとCCD](https://www.nobelprize.org/prizes/physics/2009/illustrated-information/?print=1)

<a id="topic-dada"></a>

## 05. ダダ

ID: `dada`

### 日本語

分野：芸術・思想

**導入・問い**

作品を作るだけでなく、「芸術」の決め方を揺さぶる。

**概要**

ダダは第一次世界大戦期に生まれた芸術・文学の運動です。偶然や既製品、断片の組み合わせを用い、芸術と日常の境界や既存の価値観を問い直しました。

#### 概念をつかむ

戦争への反応を背景に、作家たちは絵画や彫刻の慣習に収まらない表現を探りました。作品の美しさだけでなく、選ぶ行為や展示の文脈も問いの対象になります。

#### 身近な場面で考える

美術館に日用品が置かれたら、誰が、どの文脈でそれを作品と呼ぶのでしょう。説明用のこの問いは、物そのものから、作品を成立させる制度へ目を向けさせます。

#### どこまで説明できる？

ダダの作家に共通の一つの様式があったわけではありません。「何でも適当に作ればダダ」という意味でもなく、地域や作家ごとの歴史を読む必要があります。

### English

**Dada** · Art and ideas

**Introduction**

What if art questions how art itself is defined?

**Summary**

Dada was an art and literary movement that questioned established values through chance, fragments, and ordinary objects.

#### Understanding the concept

Against the background of World War I, artists challenged conventions of making and exhibiting art.

#### A concrete example

Consider an everyday object displayed in a museum: what makes it a work? The question shifts attention toward context and institutions.

#### Scope and limits

Dada had no single uniform style. Arbitrary making alone does not explain its diverse historical practices.

### 参考資料（アプリに掲載する参照先）

- [MoMA: Dada](https://www.moma.org/collection/terms/dada)
- [写真](https://www.anthroencyclopedia.com/entry/photography)
- [MoMA: Chance Creations](https://www.moma.org/collection/terms/dada/chance-creations-collage-photomontage-and-assemblage)

<a id="topic-user-centered-design"></a>

## 06. ユーザー中心設計（UCD）

ID: `user-centered-design`

### 日本語

分野：デザイン

**導入・問い**

設計を、使う人の目的と状況から組み立てる。

**概要**

ユーザー中心設計は、利用者の目的や利用状況を理解し、設計と評価を繰り返す考え方です。要望を集めるだけでなく、実際に目的を達成できるかを確かめます。

#### 概念をつかむ

作り手の想定だけで決めず、利用場面を調べ、試作品を人に使ってもらい、結果を設計へ戻します。調査と評価は完成後の確認だけでなく、設計の途中に組み込みます。

#### 身近な場面で考える

説明用に、券売機で迷う人を考えます。ボタンを増やす前に、目的地の探し方や、荷物を持った状態での操作を観察すると、必要な改善が変わるかもしれません。

#### どこまで説明できる？

UCDはユーザー中心設計、HCDは人間中心設計の略で、近い領域で使われます。利用者の声をそのまま実装する方法や、売上だけを最適化する方法と同じではありません。

### English

**User-centered design (UCD)** · Design

**Introduction**

What changes when design starts with the people using it?

**Summary**

User-centered design iterates between understanding users, designing, and evaluating whether people can achieve their goals.

#### Understanding the concept

Research and evaluation belong throughout design, rather than only at the end. Prototypes help test assumptions about use.

#### A concrete example

For a ticket machine, observing destination searches and hands occupied by luggage may suggest changes that a feature request misses.

#### Scope and limits

UCD and human-centered design (HCD) are closely related terms. Neither simply means implementing every request or optimizing sales alone.

### 参考資料（アプリに掲載する参照先）

- [GOV.UK: Understand users and their needs](https://www.gov.uk/service-manual/service-standard/point-1-understand-user-needs)

<a id="topic-affordance"></a>

## 07. アフォーダンス

ID: `affordance`

### 日本語

分野：生態心理学

**導入・問い**

環境は、生き物にどんな行為の可能性を与える？

**概要**

アフォーダンスは、環境と行為者の関係から生じる行為の可能性です。ギブソンの生態心理学で発展し、物の形だけでなく、身体の大きさや能力との関係に注目します。

#### 概念をつかむ

同じ段差でも、またげるか、座れるかは身体によって変わります。環境を「何でできているか」に加えて、「この生き物に何ができるか」から捉える視点です。

#### 身近な場面で考える

説明用に、大人には上れる階段が、幼児には高い壁のようになる場面を考えてください。階段の寸法が同じでも、行為の可能性は同じになりません。

#### どこまで説明できる？

デザインでは気づきやすさも重視されますが、行為の可能性と、それを知らせる手がかりは区別できます。「押したくなる形」だけに意味を狭めないことが大切です。

### English

**Affordance** · Ecological psychology

**Introduction**

What possibilities for action does an environment offer?

**Summary**

An affordance is a possibility for action arising in the relationship between an environment and an agent.

#### Understanding the concept

The same step can afford sitting or climbing differently for different bodies. The unit of analysis is the relationship.

#### A concrete example

Imagine a stair climbable by an adult but too high for a toddler. Identical dimensions need not offer identical actions.

#### Scope and limits

An available action and a cue making it noticeable can differ. Affordance is broader than a shape that looks clickable.

### 参考資料（アプリに掲載する参照先）

- [OECS: Affordances](https://oecs.mit.edu/pub/984ungzu)
- [University of Minnesota Press: Surface Encounters](https://manifold.umn.edu/read/a1d6deae-b96b-4bb9-8217-f41acf52f21c/section/17356e75-9cb7-4204-ab18-0710db5385b3)

<a id="topic-umwelt"></a>

## 08. 環世界

ID: `umwelt`

### 日本語

分野：生物学・哲学

**導入・問い**

同じ場所でも、生き物ごとに違う世界を生きている？

**概要**

環世界は、ある生物にとって知覚や行為を通じて意味を持つ世界を捉える概念です。ユクスキュルは、人間の感覚を基準にすべての動物を理解する見方を問い直しました。

#### 概念をつかむ

周囲の物理的環境が同じでも、感覚器や行動によって、重要な手がかりは異なります。生物を理解するには、その生物にとって何が意味を持つかを問います。

#### 身近な場面で考える

説明用に、人と犬が同じ道を歩く場面を考えます。人が看板に注目する横で、犬はにおいを手がかりに立ち止まるかもしれません。同じ道が別の意味を帯びます。

#### どこまで説明できる？

動物の主観を人間がそのまま体験できるという主張ではありません。比喩や擬人化だけで済ませず、感覚や行動についての観察と結びつけて考えます。

### English

**Umwelt** · Biology and philosophy

**Introduction**

Can different creatures inhabit different worlds in one place?

**Summary**

Umwelt describes a living being’s meaningful world of perception and action, associated with Jakob von Uexküll.

#### Understanding the concept

Organisms attend and respond to different cues. Understanding one requires asking what matters within its perceptual and practical world.

#### A concrete example

Imagine walking with a dog: you attend to signs while it stops at scents. A shared street can carry different meanings.

#### Scope and limits

We cannot directly inhabit another animal’s experience. The concept invites careful observation, not unrestricted anthropomorphism.

### 参考資料（アプリに掲載する参照先）

- [University of Minnesota Press: Surface Encounters](https://manifold.umn.edu/read/a1d6deae-b96b-4bb9-8217-f41acf52f21c/section/17356e75-9cb7-4204-ab18-0710db5385b3)
- [知覚と行為](https://oecs.mit.edu/pub/984ungzu)

<a id="topic-predictive-processing"></a>

## 09. 予測処理

ID: `predictive-processing`

### 日本語

分野：認知科学

**導入・問い**

脳は、世界を予測しながら知覚している？

**概要**

予測処理は、感覚入力についての予測と、そのずれを用いて知覚や学習を説明する研究枠組みです。予測と入力の往復から、脳の働きを捉える視点です。

#### 概念をつかむ

予測と入力の違いが、内部モデルを更新する手がかりになります。何を強く信頼するかという重み付けも重要で、単に「思い込みが現実になる」という説明ではありません。

#### 身近な場面で考える

説明用に、混雑した店で聞き慣れた注文を聞き取る場面を想像します。文脈からの予想と実際の音を合わせると、曖昧な音の理解が変わることがあります。

#### どこまで説明できる？

予測処理には複数のモデルがあり、脳のすべてを説明し終えた定説ではありません。説明例と、特定の神経回路で検証された結果は区別する必要があります。

### English

**Predictive processing** · Cognitive science

**Introduction**

Does the brain perceive by predicting?

**Summary**

Predictive processing explains perception and learning through predictions about sensory input and the errors those predictions generate.

#### Understanding the concept

Prediction errors can update models. How uncertainty is weighted matters; the account is more specific than saying belief creates reality.

#### A concrete example

Imagine hearing a familiar order in a noisy café. Contextual expectations can help interpret an ambiguous sound.

#### Scope and limits

This is a family of models, not a completed theory of everything the brain does. Illustrations do not establish a neural mechanism.

### 参考資料（アプリに掲載する参照先）

- [Sprevak & Smith: Introduction to Predictive Processing](https://doi.org/10.1111/tops.12704)
- [知覚と行為](https://oecs.mit.edu/pub/984ungzu)
- [Stanford Encyclopedia: Embodied Cognition](https://plato.stanford.edu/entries/embodied-cognition/)

<a id="topic-embodied-cognition"></a>

## 10. 身体化認知

ID: `embodied-cognition`

### 日本語

分野：認知科学

**導入・問い**

考えることに、身体や周囲の環境はどう関わる？

**概要**

身体化認知は、認知における身体の役割を重視する研究のまとまりです。脳内の記号処理に加え、感覚・運動や環境との相互作用から思考を理解します。

#### 概念をつかむ

身体の形や動きは、情報を受け取る入口にとどまらず、課題の解き方にも関わりえます。ただし、どこまで身体が認知を構成するかについては立場が分かれます。

#### 身近な場面で考える

説明用に、家具の配置を頭だけで考える場合と、模型を手で動かす場合を比べます。手を動かしながら比較できることが、課題の解き方を変えます。

#### どこまで説明できる？

身体化認知から「体を動かせば必ず賢くなる」とは言えません。個別の課題・身体・環境を指定し、どんな寄与があるかを検討する必要があります。

### English

**Embodied cognition** · Cognitive science

**Introduction**

How do bodies and environments participate in thinking?

**Summary**

Embodied cognition is a research program emphasizing the roles of bodies and environmental interaction in cognition.

#### Understanding the concept

Bodies can shape how tasks are solved. Researchers disagree about whether bodily contributions merely support cognition or partly constitute it.

#### A concrete example

Imagine arranging furniture mentally versus moving small models. Acting on the models changes how comparisons can be made.

#### Scope and limits

It does not imply that movement always improves thinking. Claims need a specified task, body, environment, and evidence.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Embodied Cognition](https://plato.stanford.edu/entries/embodied-cognition/)
- [OECS: Affordances](https://oecs.mit.edu/pub/984ungzu)

<a id="topic-cognitive-dissonance"></a>

## 11. 認知的不協和

ID: `cognitive-dissonance`

### 日本語

分野：社会心理学

**導入・問い**

行動と信念が食い違うと、人はどう折り合いをつける？

**概要**

認知的不協和は、関連する認知や行動の不一致から生じる不快な状態を指します。フェスティンガーの理論は、その不一致を減らそうとする動機に注目しました。

#### 概念をつかむ

不一致を減らすには、行動を変えるほか、解釈や態度を変える道もあります。行動の理由をあとから組み替える可能性に気づくと、自分の説明も点検できます。

#### 身近な場面で考える

説明用に、節約すると決めたのに高い買い物をした場面を考えます。「長く使うから得だ」と捉え直す場合も、次の出費を減らす場合もありえます。

#### どこまで説明できる？

矛盾した発言をすべてこの概念で診断することはできません。不快さや態度変化には複数の説明があり、相手の内面を決めつける道具にはなりません。

### English

**Cognitive dissonance** · Social psychology

**Introduction**

What happens when actions and beliefs conflict?

**Summary**

Cognitive dissonance is an uncomfortable state associated with inconsistency among relevant cognitions or behavior.

#### Understanding the concept

People may reduce dissonance by changing behavior or revising attitudes and interpretations, rather than always choosing one route.

#### A concrete example

Imagine making an expensive purchase after deciding to save. One might reinterpret its value or change later spending.

#### Scope and limits

Contradictory remarks alone do not diagnose dissonance. Other explanations exist, and another person’s mental state cannot simply be inferred.

### 参考資料（アプリに掲載する参照先）

- [APA Dictionary: Cognitive dissonance](https://dictionary.apa.org/cognitive-dissonance)
- [制度と規範](https://plato.stanford.edu/entries/social-construction-naturalistic/)

<a id="topic-exaptation"></a>

## 12. エクサプテーション

ID: `exaptation`

### 日本語

分野：進化生物学

**導入・問い**

今の役割は、最初からそのために生まれたもの？

**概要**

エクサプテーションは、現在の用途のために進化したわけではない特徴が、その用途に利用されることを捉える概念です。グールドとヴルバが提案しました。

#### 概念をつかむ

別の役割に選択された特徴が転用される場合も、もともと適応的でなかった特徴が利用される場合も含みます。現在の機能と、起源を分けて問うことが重要です。

#### 身近な場面で考える

羽毛が飛行以前にも存在したことは、この問いを考える入口になります。現在飛ぶために役立つことだけから、羽毛の起源の役割を逆算することはできません。

#### どこまで説明できる？

転用の歴史は、化石や比較研究などで確かめる必要があります。意外な使い方を見つけるだけで、生物進化の具体的な歴史まで証明できるわけではありません。

### English

**Exaptation** · Evolutionary biology

**Introduction**

Did a trait originate for the role it plays today?

**Summary**

Exaptation describes a trait used for a role for which it was not originally selected.

#### Understanding the concept

A feature may be co-opted from another selected function or from a nonadaptive origin. Present usefulness and historical origin are distinct questions.

#### A concrete example

Feathers predating flight provide an entry point: their current aerodynamic use alone cannot establish their original role.

#### Scope and limits

A history of co-option needs comparative or fossil evidence. An imaginative alternative use does not prove an evolutionary account.

### 参考資料（アプリに掲載する参照先）

- [Gould & Vrba: Exaptation—a Missing Term](https://doi.org/10.1017/S0094837300004310)
- [進化の過程](https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/)

<a id="topic-niche-construction"></a>

## 13. ニッチ構築

ID: `niche-construction`

### 日本語

分野：進化生態学

**導入・問い**

生物は、自分が進化する環境そのものも変える。

**概要**

ニッチ構築は、生物が環境を変え、それが自身や他の生物の選択環境へ影響する過程です。適応する側と環境の側を、一方向ではなく相互作用として見ます。

#### 概念をつかむ

環境の変化が世代を越えて残ると、子孫は遺伝子だけでなく変えられた条件も受け継ぎます。このような生態学的継承が、進化の進み方に関わりえます。

#### 身近な場面で考える

ビーバーのダムは、水の流れや周囲の生息条件を変えます。動物が既存の場所に適応するだけでなく、活動によって他の生物にも関わる場所を作る例です。

#### どこまで説明できる？

環境を変える行動が、必ず進化的変化を生むとは限りません。生態系への影響と、その後の遺伝的な変化は区別して調べる必要があります。

### English

**Niche construction** · Evolutionary ecology

**Introduction**

Can organisms change the environments in which they evolve?

**Summary**

Niche construction concerns organisms modifying environments and thereby affecting selection on themselves or other organisms.

#### Understanding the concept

Persistent environmental modifications can create ecological inheritance, influencing conditions encountered by later generations.

#### A concrete example

A beaver dam changes water flow and habitat conditions. Organismal activity alters conditions for more than its builder.

#### Scope and limits

Environmental modification does not automatically demonstrate evolutionary change. Ecological effects and subsequent genetic change require distinct evidence.

### 参考資料（アプリに掲載する参照先）

- [An introduction to niche construction theory](https://pmc.ncbi.nlm.nih.gov/articles/PMC4922671/)
- [進化の過程](https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/)

<a id="topic-neutral-theory"></a>

## 14. 分子進化の中立説

ID: `neutral-theory`

### 日本語

分野：進化生物学

**導入・問い**

進化には、自然選択に加えて偶然がどう関わる？

**概要**

木村資生の中立説は、分子レベルの進化的変化の多くを、選択上ほぼ中立な変異の遺伝的浮動で説明します。有利な変化だけに注目する見方を広げました。

#### 概念をつかむ

遺伝的浮動では、子孫へ受け渡される変異の割合が偶然によって変わります。適応度に差がなくても、ある変異が集団に広まったり、消えたりします。

#### 身近な場面で考える

説明用に、同じ当たりやすさの二色の玉を袋から取り、次の袋を作る操作を繰り返すとします。優劣がなくても、一方の色が増えることがあります。

#### どこまで説明できる？

中立説は、自然選択や適応の存在を否定しません。また、すべての変異が中立という主張でもなく、どの変化がどの程度中立かを調べる必要があります。

### English

**Neutral theory of molecular evolution** · Evolutionary biology

**Introduction**

How does chance contribute to molecular evolution?

**Summary**

Motoo Kimura’s neutral theory emphasizes genetic drift of selectively neutral changes in molecular evolution.

#### Understanding the concept

Random sampling across generations can change variant frequencies even without a selective advantage.

#### A concrete example

Imagine repeatedly sampling equally likely colored beads to fill the next bag. One color can spread without being superior.

#### Scope and limits

The theory does not deny adaptation or claim that every mutation is neutral. Its scope concerns patterns of molecular change.

### 参考資料（アプリに掲載する参照先）

- [Nature Education: Neutral Theory](https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/)

<a id="topic-endosymbiosis"></a>

## 15. 細胞内共生説

ID: `endosymbiosis`

### 日本語

分野：進化生物学

**導入・問い**

私たちの細胞の中に、別の生物だったものがいる？

**概要**

細胞内共生説は、ミトコンドリアや葉緑体の起源を、細胞の内部に取り込まれた細菌との共生から説明します。細胞の進化を、統合の歴史として見る視点です。

#### 概念をつかむ

独自のDNAや二重の膜、細菌との系統的な近さなどが、その起源を考える手がかりです。現在の細胞小器官は、長い進化の中で宿主と強く依存し合っています。

#### 身近な場面で考える

私たちが使うエネルギーに関わるミトコンドリアにも、この歴史があります。一つの細胞を眺めるとき、その中に複数の系統の出会いを読むことができます。

#### どこまで説明できる？

すべての細胞内構造がこの仕組みで生まれたわけではありません。また、取り込まれた瞬間の細部や真核細胞の成立過程には、現在も研究上の論点があります。

### English

**Endosymbiotic theory** · Evolutionary biology

**Introduction**

Do our cells contain descendants of once-independent organisms?

**Summary**

Endosymbiotic theory explains the bacterial ancestry of mitochondria and chloroplasts through integration within host cells.

#### Understanding the concept

Their DNA, membranes, and evolutionary relationships provide evidence. Modern organelles have become deeply integrated with their hosts.

#### A concrete example

Mitochondria involved in cellular energy carry this history. A cell can be understood partly through the integration of lineages.

#### Scope and limits

Not every cellular structure has this origin. Details of early integration and eukaryotic origins remain active research questions.

### 参考資料（アプリに掲載する参照先）

- [OpenStax Biology 2e: Eukaryotic Origins](https://openstax.org/books/biology-2e/pages/23-1-eukaryotic-origins)
- [進化の過程](https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/)

<a id="topic-dissipative-structures"></a>

## 16. 散逸構造

ID: `dissipative-structures`

### 日本語

分野：非平衡熱力学

**導入・問い**

エネルギーが流れ続けることで、秩序が生まれる？

**概要**

散逸構造は、平衡から離れた開放系で、エネルギーや物質の流れを伴って形成・維持される秩序です。プリゴジンの非平衡熱力学で重要な位置を占めます。

#### 概念をつかむ

止まった状態だけが安定なのではなく、流れの中で保たれるパターンもあります。系の外への散逸を含めれば、局所的な秩序と熱力学第二法則は両立します。

#### 身近な場面で考える

下から加熱した流体に規則的な対流の模様が生じることがあります。加熱という条件が維持されることで、流れ自体がまとまった構造を持つ例です。

#### どこまで説明できる？

流れがあれば必ず秩序が生まれるわけではありません。人間関係や組織への比喩に使う場合も、物理系での条件や法則をそのまま移せるとは限りません。

### English

**Dissipative structures** · Nonequilibrium thermodynamics

**Introduction**

Can a continuing flow of energy sustain order?

**Summary**

Dissipative structures are ordered patterns sustained in open systems away from equilibrium through flows of energy or matter.

#### Understanding the concept

Stable patterns can be dynamic. Local order is compatible with the second law when exchange with the surroundings is included.

#### A concrete example

A fluid heated from below can develop organized convection patterns, sustained by the continuing thermal conditions.

#### Scope and limits

Not every flow produces order. Extending the concept to organizations requires care rather than assuming physical laws transfer unchanged.

### 参考資料（アプリに掲載する参照先）

- [Nobel Prize: Ilya Prigogine](https://www.nobelprize.org/prizes/chemistry/1977/prigogine/facts/)
- [集団のパターン](https://plato.stanford.edu/entries/properties-emergent/)

<a id="topic-phase-transition"></a>

## 17. 相転移

ID: `phase-transition`

### 日本語

分野：物理学

**導入・問い**

少しの条件変化で、全体の性質が変わる。

**概要**

相転移は、温度などの条件の変化に伴い、物質や系の巨視的な状態が変わる現象です。氷から水への変化だけでなく、磁性の変化なども含みます。

#### 概念をつかむ

多くの要素の相互作用が、全体として異なる振る舞いを生みます。何を秩序の指標として見るかにより、変化を個々の粒子とは別の尺度で記述できます。

#### 身近な場面で考える

水が凍るとき、水分子が別の分子になるわけではありません。分子同士の配置や運動のあり方が変わることで、流れる液体と形を保つ固体が現れます。

#### どこまで説明できる？

すべての相転移が同じ急激さや仕組みを持つわけではありません。社会の急変を相転移と呼ぶときは、比喩なのか、定義したモデルの話なのかを区別します。

### English

**Phase transition** · Physics

**Introduction**

How can changing conditions transform a whole system?

**Summary**

A phase transition changes a system’s macroscopic state as conditions vary, including changes of state and magnetic ordering.

#### Understanding the concept

Interactions among many components produce collective behavior. An order parameter can describe a change at the system level.

#### A concrete example

Freezing does not turn water molecules into another molecule. Their collective arrangement and motion change.

#### Scope and limits

Transitions differ in character and mechanism. Calling a social change a phase transition needs either a clear model or an explicit metaphor.

### 参考資料（アプリに掲載する参照先）

- [Stanford: Introduction to Statistical Mechanics](https://web.stanford.edu/~peastman/statmech/phasetransitions.html)
- [集団のパターン](https://plato.stanford.edu/entries/properties-emergent/)

<a id="topic-emergence"></a>

## 18. 創発

ID: `emergence`

### 日本語

分野：複雑系科学・哲学

**導入・問い**

個々の要素にはない性質が、集まりからどう生まれる？

**概要**

創発は、要素の相互作用から、全体の水準で新しい性質やパターンが現れることを捉えます。部分を見る尺度と、集まりを見る尺度の関係が問いになります。

#### 概念をつかむ

一つの要素の性質を知ることと、組み合わさった系の振る舞いを理解することは別の課題です。どんな相互作用からパターンが生じるかをモデルで調べます。

#### 身近な場面で考える

説明用に、各人が前の人との距離を調整するだけで、人の列に波のような動きが広がる状況を考えます。全員が波を作ろうと意図する必要はありません。

#### どこまで説明できる？

創発は「不思議だから説明できない」という言葉ではありません。予測の難しさを指す用法と、原理的に還元できないとする哲学的主張も区別されます。

### English

**Emergence** · Complex systems and philosophy

**Introduction**

How can interactions produce properties of a whole?

**Summary**

Emergence concerns novel system-level properties or patterns arising through interactions among components.

#### Understanding the concept

Knowing component properties and explaining collective behavior are different tasks. Models can investigate the interactions producing a pattern.

#### A concrete example

Imagine people each adjusting distance from the person ahead, producing a moving wave without anyone planning that wave.

#### Scope and limits

Emergence is not a substitute for explanation. Practical unpredictability and stronger claims of irreducibility need to be distinguished.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Emergent Properties](https://plato.stanford.edu/entries/properties-emergent/)
- [Stanford: Introduction to Statistical Mechanics](https://web.stanford.edu/~peastman/statmech/phasetransitions.html)

<a id="topic-path-dependence"></a>

## 19. 経路依存性

ID: `path-dependence`

### 日本語

分野：経済学・制度研究

**導入・問い**

過去の選択が、現在の選択肢をどう制約する？

**概要**

経路依存性は、現在の結果が現在の条件だけでなく、そこへ至る過去の過程にも依存することです。技術や制度が続く理由を、歴史を含めて捉えます。

#### 概念をつかむ

一度普及した方式には、技能や設備、互換性への投資が積み重なります。その積み重ねが次の選択を方向づけ、別方式への切り替えを難しくすることがあります。

#### 身近な場面で考える

説明用に、町全体で同じ充電端子が普及した場面を考えます。新しい端子に利点があっても、充電器や利用者が少ない間は移行しにくいかもしれません。

#### どこまで説明できる？

長く続く制度が必ず非効率というわけではありません。歴史の影響と、現在も合理的に選ばれる理由を分けて調べる必要があります。

### English

**Path dependence** · Economics and institutions

**Introduction**

How do past choices shape what can be chosen now?

**Summary**

Path dependence means that outcomes depend on the sequence of earlier events, not only present conditions.

#### Understanding the concept

Accumulated skills, equipment, and compatibility can reinforce earlier choices and raise switching costs.

#### A concrete example

Imagine a town using one charging connector. A new option may struggle while compatible chargers and users remain scarce.

#### Scope and limits

Persistence does not prove inefficiency. Historical influence must be distinguished from current reasons for preferring a system.

### 参考資料（アプリに掲載する参照先）

- [EH.net Encyclopedia: Path Dependence](https://eh.net/encyclopedia/path-dependence/)
- [制度と規範](https://plato.stanford.edu/entries/social-construction-naturalistic/)

<a id="topic-transaction-costs"></a>

## 20. 取引費用

ID: `transaction-costs`

### 日本語

分野：経済学

**導入・問い**

市場で取引できるのに、なぜ会社が存在する？

**概要**

取引費用は、相手を探し、条件を交渉し、合意の履行を確かめるなど、取引を成立させるための費用です。コースは企業と市場の役割を考える際に注目しました。

#### 概念をつかむ

価格を払うだけでなく、情報を集めたり調整したりする負担も生じます。組織の内部で指示や調整を行うことと、市場で毎回契約することの違いが見えてきます。

#### 身近な場面で考える

説明用に、イベントの仕事を一つずつ別会社へ頼む場合を考えます。発注価格に加え、納期を合わせ、変更を伝え、責任範囲を決める手間がかかります。

#### どこまで説明できる？

社内で行えば費用が消えるわけではなく、管理にも費用があります。企業の境界を、安い方へ単純に決められるとは限らず、不確実性や契約の条件も関わります。

### English

**Transaction costs** · Economics

**Introduction**

Why do firms exist when people can trade in markets?

**Summary**

Transaction costs include finding partners, negotiating, and enforcing agreements. Coase used them to examine firms and markets.

#### Understanding the concept

Trading requires information and coordination beyond the price itself. Internal organization and repeated market contracting have different costs.

#### A concrete example

Imagine outsourcing each part of an event separately. Scheduling, communicating changes, and assigning responsibility also consume resources.

#### Scope and limits

Internal management has costs too. Organizational boundaries also depend on uncertainty and contracting conditions.

### 参考資料（アプリに掲載する参照先）

- [Nobel Prize: Ronald Coase](https://www.nobelprize.org/prizes/economic-sciences/1991/coase/facts/)
- [制度と規範](https://plato.stanford.edu/entries/social-construction-naturalistic/)
- [EH.net Encyclopedia: Path Dependence](https://eh.net/encyclopedia/path-dependence/)

<a id="topic-gift-exchange"></a>

## 21. 贈与論

ID: `gift-exchange`

### 日本語

分野：文化人類学

**導入・問い**

贈り物は、人と人の間に何を生み出す？

**概要**

贈与論は、贈る・受け取る・返すという実践から社会関係を考える入口です。モースは、贈り物が物の移動にとどまらず、義務や関係と結びつくことを論じました。

#### 概念をつかむ

売買なら価格の支払いで一区切りになる場面でも、贈与には関係が続く働きがあります。何を誰に返すのかは、その社会の規範や関係によって異なります。

#### 身近な場面で考える

説明用に、引っ越しを手伝ってもらい、お礼の食事へ招く場面を考えます。時間と食事を同じ価格に換算するだけでは、二人の間に生まれた関係を捉えきれません。

#### どこまで説明できる？

すべての贈り物が下心による交換だという意味ではありません。返礼の義務、親密さ、権力の差などがどう組み合わさるかを、具体的に読む視点です。

### English

**The gift** · Social anthropology

**Introduction**

What does a gift create between people?

**Summary**

Mauss’s account of gifts examines how giving, receiving, and reciprocating are bound up with social relationships and obligations.

#### Understanding the concept

Gifts can sustain relationships beyond a single transfer. Expectations of return depend on social context.

#### A concrete example

Imagine inviting a friend to dinner after they help you move. Equating hours and food prices misses part of the relationship.

#### Scope and limits

This does not reduce generosity to hidden calculation. Obligation, intimacy, and unequal power can coexist in different ways.

### 参考資料（アプリに掲載する参照先）

- [Open Encyclopedia of Anthropology: Gifts](https://www.anthroencyclopedia.com/entry/gifts)
- [社会関係と移行](https://indeterminacy.ac.uk/dictionary/liminality/)

<a id="topic-liminality"></a>

## 22. リミナリティ

ID: `liminality`

### 日本語

分野：文化人類学

**導入・問い**

元の立場を離れ、次の立場にも入っていない時間。

**概要**

リミナリティは、通過儀礼などで、ある状態から別の状態へ移る途中の境界的な段階を指します。ファン・ヘネップの議論をターナーらが発展させました。

#### 概念をつかむ

元の地位から分離され、新しい地位へ組み込まれるまで、通常の区分やルールが揺らぐことがあります。境界を越える過程そのものに注目する概念です。

#### 身近な場面で考える

説明用に、卒業後、新しい所属に入る前の期間を考えます。以前の役割が終わり、次の役割も定まらない感覚は、この概念を考える入口になります。

#### どこまで説明できる？

日常の「何となく不安な時期」をすべて同一視する概念ではありません。儀礼研究での位置づけと、現代生活への応用の違いを意識して使います。

### English

**Liminality** · Social anthropology

**Introduction**

What happens between leaving one status and entering another?

**Summary**

Liminality describes an in-between phase of transition, developed through studies of rites of passage.

#### Understanding the concept

Between separation and incorporation, ordinary distinctions can become unsettled. The transition itself becomes an object of study.

#### A concrete example

The interval after graduation but before joining a new institution offers an illustrative entry point into in-betweenness.

#### Scope and limits

Not every uncertain period is equivalent to a ritual transition. Broader applications should acknowledge the concept’s anthropological origins.

### 参考資料（アプリに掲載する参照先）

- [The Future of Indeterminacy: Liminality](https://indeterminacy.ac.uk/dictionary/liminality/)

<a id="topic-social-construction"></a>

## 23. 社会構築主義

ID: `social-construction`

### 日本語

分野：社会学・哲学

**導入・問い**

当たり前の区分や意味は、どう社会の中で作られる？

**概要**

社会構築主義は、自然に決まっているように見える意味や分類に、言語・制度・実践がどう関わるかを問う立場のまとまりです。何がどう構築されるのかを具体化します。

#### 概念をつかむ

ある区分が存在することと、その区分が自然から一意に与えられることは別です。誰が分類し、制度の中でどう扱い、その結果何が起きるかを調べます。

#### 身近な場面で考える

説明用に、同じ紙が、制度と合意の中で入場券として扱われる場面を考えます。紙の物理的性質だけでは、入場できる資格を説明できません。

#### どこまで説明できる？

「現実は存在しない」「好きに考えれば変わる」という主張と同じではありません。構築の対象・過程・物質的な制約を区別することが大切です。

### English

**Social constructionism** · Sociology and philosophy

**Introduction**

How do social practices establish familiar categories?

**Summary**

Social constructionism investigates how meanings and categories depend on social practices, language, and institutions.

#### Understanding the concept

A category’s existence does not establish that nature uniquely fixes it. Classification and its consequences can be investigated.

#### A concrete example

Consider a paper ticket: its physical properties alone do not explain the institutional right to enter.

#### Scope and limits

Social dependence does not mean reality is imaginary or freely changeable. Objects, processes, and material constraints must be specified.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Social Construction](https://plato.stanford.edu/entries/social-construction-naturalistic/)

<a id="topic-imagined-communities"></a>

## 24. 想像の共同体

ID: `imagined-communities`

### 日本語

分野：政治学・歴史学

**導入・問い**

会ったこともない人を、なぜ同じ国の仲間だと思える？

**概要**

ベネディクト・アンダーソンは、国民を互いの大半を知らなくても共有される共同体のイメージから捉えました。「想像」は、偽物という意味ではありません。

#### 概念をつかむ

共通の言語や印刷物は、人々が同じ時間を生きる仲間を思い描く条件に関わります。国民のまとまりを、最初から自然にあるものとして扱わない視点です。

#### 身近な場面で考える

説明用に、離れた場所の人々が同じ新聞の日付を読み、同じ出来事を自分たちの社会の話として受け取る場面を考えます。会うこと以外にも共有の仕組みがあります。

#### どこまで説明できる？

国民の形成を一つの要因だけで説明するものではありません。国家の制度、植民地支配、地域ごとの歴史などと併せて検討する必要があります。

### English

**Imagined communities** · Politics and history

**Introduction**

How can strangers imagine belonging to one nation?

**Summary**

Benedict Anderson examined nations as communities imagined among people who will never meet most fellow members.

#### Understanding the concept

Print and shared languages helped shape ways of imagining collective membership. Nationhood becomes a historical question.

#### A concrete example

Imagine distant readers treating a dated newspaper’s events as part of their shared society. Meeting is not the only basis of belonging.

#### Scope and limits

This is not a single-cause explanation of nation formation. Institutions, colonial histories, and regional differences also matter.

### 参考資料（アプリに掲載する参照先）

- [Verso: Benedict Anderson, Imagined Communities](https://www.versobooks.com/products/1126-imagined-communities)
- [Stanford Encyclopedia: Social Construction](https://plato.stanford.edu/entries/social-construction-naturalistic/)

<a id="topic-indexicality"></a>

## 25. 指標性

ID: `indexicality`

### 日本語

分野：言語学

**導入・問い**

言葉は内容だけでなく、話す場の何を伝える？

**概要**

指標性は、表現が発話の文脈と結びついて意味を持つ性質です。「私」「ここ」「今」の指すものは、誰がどこでいつ話すかによって変わります。

#### 概念をつかむ

同じ文字列でも、場面を知らなければ指示対象が定まりません。社会言語学では、話し方が立場や関係、集団への帰属を示す働きにも注目します。

#### 身近な場面で考える

説明用に、「明日ここで会いましょう」というメモを拾う場面を考えます。書かれた日や場所が分からなければ、文法が分かっても待ち合わせには行けません。

#### どこまで説明できる？

発話者の属性を、言葉遣いだけで確実に当てられるわけではありません。指し示し方は状況や慣習に依存し、固定的な人物分類と同じではありません。

### English

**Indexicality** · Linguistics

**Introduction**

What does language reveal about the situation of speaking?

**Summary**

Indexicality links expressions to the contexts in which they are used: “I,” “here,” and “now” depend on the occasion.

#### Understanding the concept

Identical words can refer differently across situations. Sociolinguistic approaches also examine how speech points to social relationships.

#### A concrete example

Imagine finding “Meet here tomorrow.” Grammar alone cannot identify the meeting without knowing when and where it was written.

#### Scope and limits

Speech does not reliably reveal a speaker’s identity by itself. Social interpretations remain contextual rather than fixed personal classifications.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Indexicals](https://plato.stanford.edu/entries/indexicals/)

<a id="topic-linguistic-relativity"></a>

## 26. 言語相対論

ID: `linguistic-relativity`

### 日本語

分野：言語学・認知科学

**導入・問い**

使う言語は、物事への注意や捉え方に影響する？

**概要**

言語相対論は、言語の区分や表現習慣が思考や認知にどう関わるかを問う研究上のテーマです。言語が思考を完全に決定するという強い主張とは区別されます。

#### 概念をつかむ

何を言い分ける必要があるか、どんな関係を表現しやすいかは、言語ごとに異なります。それが注意や記憶などの課題とどう関わるかを検討します。

#### 身近な場面で考える

説明用に、位置を説明する際、左右を使う習慣と、東西南北を使う習慣を比べます。日々どの手がかりに注意するかを考える入口になります。

#### どこまで説明できる？

ある言語に単語がないことは、その内容を理解できない証明にはなりません。文化や課題の条件も関わるため、言語だけを原因と即断しないことが大切です。

### English

**Linguistic relativity** · Linguistics and cognitive science

**Introduction**

Can language influence patterns of attention and thought?

**Summary**

Linguistic relativity investigates how language influences thought, without requiring that it completely determines what can be thought.

#### Understanding the concept

Languages differ in habitual distinctions. Researchers test how these relate to attention, memory, and other tasks.

#### A concrete example

Compare describing positions with left and right versus cardinal directions. The contrast invites questions about habitual attention.

#### Scope and limits

A missing word does not prove an inability to understand a concept. Cultural and task differences complicate causal claims.

### 参考資料（アプリに掲載する参照先）

- [Annual Review of Anthropology: Linguistic Relativity](https://www.annualreviews.org/content/journals/10.1146/annurev.anthro.26.1.291)
- [発話の文脈](https://plato.stanford.edu/entries/indexicals/)

<a id="topic-performativity"></a>

## 27. パフォーマティヴィティ

ID: `performativity`

### 日本語

分野：言語哲学・社会理論

**導入・問い**

言葉や行為は、現実を説明するだけでなく作り出す？

**概要**

パフォーマティヴィティを考える入口に、オースティンの言語行為論があります。発言は状態の報告だけでなく、約束や命名などの行為にもなります。

#### 概念をつかむ

発話が何を述べるかに加え、その場で何を行うかを区別します。言葉が行為として成立するには、発話者の権限や手続き、状況なども関わります。

#### 身近な場面で考える

説明用に、会議で権限のある人が「これで閉会します」と宣言する場面を考えます。発言は会議の終わりを記述するとともに、その手続きの一部になります。

#### どこまで説明できる？

思ったことを口にすれば何でも実現するという意味ではありません。バトラーのジェンダー論などでは異なる展開があり、各論者の用法を分けて読む必要があります。

### English

**Performativity** · Philosophy of language and social theory

**Introduction**

Can saying something help bring a social reality into being?

**Summary**

Austin’s work on speech acts offers an entry into performativity: utterances can do things such as promise or name.

#### Understanding the concept

What an utterance says and what it does are distinct questions. Authority, procedures, and circumstances affect whether the act succeeds.

#### A concrete example

Imagine an authorized chair declaring a meeting closed. The utterance can participate in ending the meeting.

#### Scope and limits

Words do not make any wish real. Later uses, including Butler’s account of gender, require attention to their different theoretical contexts.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Speech Acts](https://plato.stanford.edu/entries/speech-acts/)
- [発話の文脈](https://plato.stanford.edu/entries/indexicals/)

<a id="topic-paradigm"></a>

## 28. パラダイム

ID: `paradigm`

### 日本語

分野：科学哲学

**導入・問い**

科学者の共有する前提が変わると、問いも変わる。

**概要**

クーンの科学論で、パラダイムは研究共同体が共有する模範的な問題解決や前提などに関わります。何を問題とし、何を解答として認めるかにも影響します。

#### 概念をつかむ

通常科学では共有された枠組みの中で問題を解きます。解決しにくい問題が現れることと、枠組みそのものが変わることは、同じ段階ではありません。

#### 身近な場面で考える

説明用に、授業で手本となる解法を習い、その解法で新しい問題を解く場面を考えます。何がよい問いかも、手本から身につけているかもしれません。

#### どこまで説明できる？

新製品や方針変更をすべて「パラダイム転換」と呼ぶと、科学史の議論が薄れます。証拠を無視して好きな世界観を選べるという意味でもありません。

### English

**Paradigm** · Philosophy of science

**Introduction**

What changes when a scientific community’s shared framework changes?

**Summary**

In Kuhn’s philosophy of science, paradigms concern shared exemplars and commitments shaping scientific problems and solutions.

#### Understanding the concept

Normal science solves puzzles within shared commitments. Encountering an anomaly and changing a framework are not identical events.

#### A concrete example

Imagine learning exemplary solutions in a course. Those examples can shape which new problems seem worth asking.

#### Scope and limits

Not every novelty is a paradigm shift. Kuhn’s account does not mean scientific evidence can simply be ignored.

### 参考資料（アプリに掲載する参照先）

- [Stanford Encyclopedia: Thomas Kuhn](https://plato.stanford.edu/entries/thomas-kuhn/)

<a id="topic-bricolage"></a>

## 29. ブリコラージュ

ID: `bricolage`

### 日本語

分野：人類学・思想

**導入・問い**

手元にあるものを組み替えて、問題に応える知のあり方。

**概要**

レヴィ＝ストロースは、手元の限られた素材や記号を組み替える営みを、ブリコラージュという考えで論じました。既存のものが持つ履歴も、新しい構成に関わります。

#### 概念をつかむ

目的に合わせて素材を一から設計するだけが、知の働きではありません。以前の用途の跡を持つものを、その都度の関係の中で組み直す過程にも注目します。

#### 身近な場面で考える

説明用に、古い箱や余った布を組み合わせて展示台を作る場面を考えます。箱の形や布の柄は制約であるとともに、思いつかなかった構成のきっかけになります。

#### どこまで説明できる？

単なる節約術や器用さの名称に狭めないことが大切です。人類学での知や神話の議論と、現代のものづくりへの比喩的な応用を区別します。

### English

**Bricolage** · Anthropology and ideas

**Introduction**

What can be made by recombining what is already at hand?

**Summary**

Lévi-Strauss used bricolage to examine working with an available repertoire of materials and signs.

#### Understanding the concept

Knowledge can work by rearranging inherited resources rather than designing every element afresh. Their previous meanings can remain relevant.

#### A concrete example

Imagine building a display from old boxes and spare fabric. Existing shapes constrain the design while suggesting unexpected arrangements.

#### Scope and limits

The concept is broader than thrift or craft skill. Its anthropological arguments about thought differ from later practical analogies.

### 参考資料（アプリに掲載する参照先）

- [Yale: Bricolage and Cultural Software](https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0)

<a id="topic-rhizome"></a>

## 30. リゾーム

ID: `rhizome`

### 日本語

分野：哲学

**導入・問い**

一つの中心や階層に収まらない、つながり方を考える。

**概要**

ドゥルーズとガタリは、地下茎を意味するリゾームを哲学の概念へ展開しました。一つの根や中心から枝分かれする図式に収まらない、多方向の接続を考えます。

#### 概念をつかむ

出発点や一本道を固定せず、途中から入り、異なるもの同士が接続するあり方に注目します。考え方や知識の配置を、単一の序列に整理し尽くせるかを問い直します。

#### 身近な場面で考える

説明用に、読んだ本の引用から音楽へ、そこから歴史へと関心が伸びる場面を考えます。最初に一つの目次を決めなくても、複数の入口から探索できます。

#### どこまで説明できる？

リゾームは、あらゆるネットワークの構造を測定する数学モデルではありません。中心がないものは必ず自由で望ましい、と単純に評価する言葉でもありません。

### English

**Rhizome** · Philosophy

**Introduction**

How might connections escape a single center or hierarchy?

**Summary**

Deleuze and Guattari developed rhizome as a philosophical concept for multiplicities and connections beyond a single organizing root.

#### Understanding the concept

It invites entry from the middle and connections among heterogeneous elements, questioning exhaustive organization under one hierarchy.

#### A concrete example

Imagine following a reference from a book to music and then history. Exploration can grow through multiple entry points.

#### Scope and limits

Rhizome is not a mathematical measure of networks, nor a guarantee that every decentralized arrangement is desirable.

### 参考資料（アプリに掲載する参照先）

- [Routledge Encyclopedia: Gilles Deleuze](https://www.rep.routledge.com/articles/biographical/deleuze-gilles-1925-95/v-1)
- [Yale: Bricolage and Cultural Software](https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0)
