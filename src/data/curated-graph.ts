import type { RelatedConcept, Relation } from './graph';

export const curatedConcepts: RelatedConcept[] = [
  {
    "id": "perception-action",
    "name": "知覚と行為",
    "summary": "知覚と行動の関係を、身体や環境を含めて考える問いです。",
    "sourceUrl": "https://oecs.mit.edu/pub/984ungzu"
  },
  {
    "id": "evolutionary-processes",
    "name": "進化の過程",
    "summary": "生物の特徴や集団が世代を通して変わる過程。選択だけでなく浮動なども関わります。",
    "sourceUrl": "https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/"
  },
  {
    "id": "collective-patterns",
    "name": "集団のパターン",
    "summary": "要素の性質と相互作用から、全体としてどんな振る舞いが現れるかを問います。",
    "sourceUrl": "https://plato.stanford.edu/entries/properties-emergent/"
  },
  {
    "id": "institutions-norms",
    "name": "制度と規範",
    "summary": "社会の中で行動や意味を方向づける仕組みや期待。維持や変化の過程を調べます。",
    "sourceUrl": "https://plato.stanford.edu/entries/social-construction-naturalistic/"
  },
  {
    "id": "social-transitions",
    "name": "社会関係と移行",
    "summary": "人の立場や関係が、実践を通してどう作られ、変わるかという問いです。",
    "sourceUrl": "https://indeterminacy.ac.uk/dictionary/liminality/"
  },
  {
    "id": "utterance-context",
    "name": "発話の文脈",
    "summary": "誰が、いつ、どこで、どんな関係や手続きの中で話すかという条件です。",
    "sourceUrl": "https://plato.stanford.edu/entries/indexicals/"
  },
  {
    "id": "scientific-community",
    "name": "研究共同体",
    "summary": "研究者が問いや方法、問題解決の手本を共有する場です。",
    "sourceUrl": "https://plato.stanford.edu/entries/thomas-kuhn/"
  },
  {
    "id": "materials-context",
    "name": "素材と文脈",
    "summary": "既存の物や記号が、組み合わせや使われる場によって持つ意味を考えます。",
    "sourceUrl": "https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0"
  }
];

export const curatedRelations: Relation[] = [
  {
    "id": "affordance--perception-action",
    "sourceId": "affordance",
    "targetId": "perception-action",
    "ownerId": "affordance",
    "label": "行為の可能性を捉える",
    "explanation": "行為者の身体と環境の関係から、何ができるかを考えます。",
    "evidence": [
      {
        "title": "OECS: Affordances",
        "url": "https://oecs.mit.edu/pub/984ungzu"
      }
    ]
  },
  {
    "id": "umwelt--perception-action",
    "sourceId": "umwelt",
    "targetId": "perception-action",
    "ownerId": "umwelt",
    "label": "生物にとっての意味を問う",
    "explanation": "感覚と行為を通じて、生物ごとに何が意味を持つかを問います。",
    "evidence": [
      {
        "title": "University of Minnesota Press: Surface Encounters",
        "url": "https://manifold.umn.edu/read/a1d6deae-b96b-4bb9-8217-f41acf52f21c/section/17356e75-9cb7-4204-ab18-0710db5385b3"
      }
    ]
  },
  {
    "id": "predictive-processing--perception-action",
    "sourceId": "predictive-processing",
    "targetId": "perception-action",
    "ownerId": "predictive-processing",
    "label": "予測と入力のずれを考える",
    "explanation": "予測処理は、知覚や行為を予測とそのずれから捉える研究枠組みです。",
    "evidence": [
      {
        "title": "Sprevak & Smith: Introduction to Predictive Processing",
        "url": "https://doi.org/10.1111/tops.12704"
      }
    ]
  },
  {
    "id": "embodied-cognition--perception-action",
    "sourceId": "embodied-cognition",
    "targetId": "perception-action",
    "ownerId": "embodied-cognition",
    "label": "身体と環境の役割を問う",
    "explanation": "身体化認知は、感覚・運動と環境が認知にどう寄与するかを問います。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Embodied Cognition",
        "url": "https://plato.stanford.edu/entries/embodied-cognition/"
      }
    ]
  },
  {
    "id": "exaptation--evolutionary-processes",
    "sourceId": "exaptation",
    "targetId": "evolutionary-processes",
    "ownerId": "exaptation",
    "label": "特徴の起源と用途を分ける",
    "explanation": "現在の用途を、その用途のために生じたという起源の説明と分けます。",
    "evidence": [
      {
        "title": "Gould & Vrba: Exaptation—a Missing Term",
        "url": "https://doi.org/10.1017/S0094837300004310"
      }
    ]
  },
  {
    "id": "niche-construction--evolutionary-processes",
    "sourceId": "niche-construction",
    "targetId": "evolutionary-processes",
    "ownerId": "niche-construction",
    "label": "選択環境を変える",
    "explanation": "生物の活動が選択環境を変え、世代を越えて影響しうる過程を考えます。",
    "evidence": [
      {
        "title": "An introduction to niche construction theory",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC4922671/"
      }
    ]
  },
  {
    "id": "neutral-theory--evolutionary-processes",
    "sourceId": "neutral-theory",
    "targetId": "evolutionary-processes",
    "ownerId": "neutral-theory",
    "label": "分子の変化に浮動を考える",
    "explanation": "分子レベルの変化を考える際に、中立な変異の遺伝的浮動へ注目します。",
    "evidence": [
      {
        "title": "Nature Education: Neutral Theory",
        "url": "https://www.nature.com/scitable/topicpage/neutral-theory-the-null-hypothesis-of-molecular-839/"
      }
    ]
  },
  {
    "id": "endosymbiosis--evolutionary-processes",
    "sourceId": "endosymbiosis",
    "targetId": "evolutionary-processes",
    "ownerId": "endosymbiosis",
    "label": "系統の統合から起源を考える",
    "explanation": "ミトコンドリアなどの起源を、宿主と細菌の統合の歴史として考えます。",
    "evidence": [
      {
        "title": "OpenStax Biology 2e: Eukaryotic Origins",
        "url": "https://openstax.org/books/biology-2e/pages/23-1-eukaryotic-origins"
      }
    ]
  },
  {
    "id": "dissipative-structures--collective-patterns",
    "sourceId": "dissipative-structures",
    "targetId": "collective-patterns",
    "ownerId": "dissipative-structures",
    "label": "流れの中の秩序を考える",
    "explanation": "平衡から離れた系の流れと散逸が、秩序あるパターンの維持に関わります。",
    "evidence": [
      {
        "title": "Nobel Prize: Ilya Prigogine",
        "url": "https://www.nobelprize.org/prizes/chemistry/1977/prigogine/facts/"
      }
    ]
  },
  {
    "id": "phase-transition--collective-patterns",
    "sourceId": "phase-transition",
    "targetId": "collective-patterns",
    "ownerId": "phase-transition",
    "label": "条件による全体の変化",
    "explanation": "相転移では、温度などの条件によって系全体の状態が変わります。",
    "evidence": [
      {
        "title": "Stanford: Introduction to Statistical Mechanics",
        "url": "https://web.stanford.edu/~peastman/statmech/phasetransitions.html"
      }
    ]
  },
  {
    "id": "emergence--collective-patterns",
    "sourceId": "emergence",
    "targetId": "collective-patterns",
    "ownerId": "emergence",
    "label": "相互作用から全体を見る",
    "explanation": "個々の要素には帰しにくい全体の性質を、相互作用と水準の違いから問います。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Emergent Properties",
        "url": "https://plato.stanford.edu/entries/properties-emergent/"
      }
    ]
  },
  {
    "id": "path-dependence--institutions-norms",
    "sourceId": "path-dependence",
    "targetId": "institutions-norms",
    "ownerId": "path-dependence",
    "label": "制度の歴史を読む",
    "explanation": "現在の制度や技術の持続を、過去の選択と蓄積から考えます。",
    "evidence": [
      {
        "title": "EH.net Encyclopedia: Path Dependence",
        "url": "https://eh.net/encyclopedia/path-dependence/"
      }
    ]
  },
  {
    "id": "transaction-costs--institutions-norms",
    "sourceId": "transaction-costs",
    "targetId": "institutions-norms",
    "ownerId": "transaction-costs",
    "label": "取引を支える仕組みを問う",
    "explanation": "市場と組織の違いを、情報・交渉・履行確認の負担から考えます。",
    "evidence": [
      {
        "title": "Nobel Prize: Ronald Coase",
        "url": "https://www.nobelprize.org/prizes/economic-sciences/1991/coase/facts/"
      }
    ]
  },
  {
    "id": "social-construction--institutions-norms",
    "sourceId": "social-construction",
    "targetId": "institutions-norms",
    "ownerId": "social-construction",
    "label": "分類と意味の成立を問う",
    "explanation": "分類や意味を、言語や社会的実践、制度と結びつけて調べます。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Social Construction",
        "url": "https://plato.stanford.edu/entries/social-construction-naturalistic/"
      }
    ]
  },
  {
    "id": "imagined-communities--institutions-norms",
    "sourceId": "imagined-communities",
    "targetId": "institutions-norms",
    "ownerId": "imagined-communities",
    "label": "共有される帰属を考える",
    "explanation": "国民の帰属が共有される歴史的な条件を考える視点です。",
    "evidence": [
      {
        "title": "Verso: Benedict Anderson, Imagined Communities",
        "url": "https://www.versobooks.com/products/1126-imagined-communities"
      }
    ]
  },
  {
    "id": "gift-exchange--social-transitions",
    "sourceId": "gift-exchange",
    "targetId": "social-transitions",
    "ownerId": "gift-exchange",
    "label": "贈与による関係を考える",
    "explanation": "贈与を物の移動だけでなく、義務や関係を持続させる実践として考えます。",
    "evidence": [
      {
        "title": "Open Encyclopedia of Anthropology: Gifts",
        "url": "https://www.anthroencyclopedia.com/entry/gifts"
      }
    ]
  },
  {
    "id": "liminality--social-transitions",
    "sourceId": "liminality",
    "targetId": "social-transitions",
    "ownerId": "liminality",
    "label": "立場の間の段階を問う",
    "explanation": "通過儀礼などで、元の立場と新しい立場の間にある段階に注目します。",
    "evidence": [
      {
        "title": "The Future of Indeterminacy: Liminality",
        "url": "https://indeterminacy.ac.uk/dictionary/liminality/"
      }
    ]
  },
  {
    "id": "indexicality--utterance-context",
    "sourceId": "indexicality",
    "targetId": "utterance-context",
    "ownerId": "indexicality",
    "label": "文脈に結びつく意味",
    "explanation": "「私」「ここ」「今」などの表現は、発話の場面によって指すものが変わります。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Indexicals",
        "url": "https://plato.stanford.edu/entries/indexicals/"
      }
    ]
  },
  {
    "id": "performativity--utterance-context",
    "sourceId": "performativity",
    "targetId": "utterance-context",
    "ownerId": "performativity",
    "label": "発言が行為となる条件",
    "explanation": "約束や宣言が成立するには、適切な状況や手続きが関わります。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Speech Acts",
        "url": "https://plato.stanford.edu/entries/speech-acts/"
      }
    ]
  },
  {
    "id": "linguistic-relativity--utterance-context",
    "sourceId": "linguistic-relativity",
    "targetId": "utterance-context",
    "ownerId": "linguistic-relativity",
    "label": "言語と認知の関係を問う",
    "explanation": "文脈による指示の変化とは別に、言語の区分や習慣が認知へ及ぼす影響を問います。",
    "evidence": [
      {
        "title": "Annual Review of Anthropology: Linguistic Relativity",
        "url": "https://www.annualreviews.org/content/journals/10.1146/annurev.anthro.26.1.291"
      }
    ]
  },
  {
    "id": "paradigm--scientific-community",
    "sourceId": "paradigm",
    "targetId": "scientific-community",
    "ownerId": "paradigm",
    "label": "共有する手本と前提",
    "explanation": "クーンは、共同体で共有される問題解決の手本や前提を科学の営みと結びつけました。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Thomas Kuhn",
        "url": "https://plato.stanford.edu/entries/thomas-kuhn/"
      }
    ]
  },
  {
    "id": "bricolage--materials-context",
    "sourceId": "bricolage",
    "targetId": "materials-context",
    "ownerId": "bricolage",
    "label": "既存のものを組み直す",
    "explanation": "素材や記号の以前の用途や意味を伴いながら、新しい構成を作ります。",
    "evidence": [
      {
        "title": "Yale: Bricolage and Cultural Software",
        "url": "https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0"
      }
    ]
  },
  {
    "id": "rhizome--materials-context",
    "sourceId": "rhizome",
    "targetId": "materials-context",
    "ownerId": "rhizome",
    "label": "多方向の接続を考える",
    "explanation": "知識や記号のつながりを、一つの中心からの階層に限らず考える哲学的な視点です。",
    "evidence": [
      {
        "title": "Routledge Encyclopedia: Gilles Deleuze",
        "url": "https://www.rep.routledge.com/articles/biographical/deleuze-gilles-1925-95/v-1"
      }
    ]
  },
  {
    "id": "cognitive-dissonance--institutions-norms",
    "sourceId": "cognitive-dissonance",
    "targetId": "institutions-norms",
    "ownerId": "cognitive-dissonance",
    "label": "信念と行動の不一致を考える",
    "explanation": "社会的な期待と自分の行動が食い違う場面も、不協和を考える入口です。制度の存在だけで個人の心理を説明する線ではありません。",
    "evidence": [
      {
        "title": "APA Dictionary: Cognitive dissonance",
        "url": "https://dictionary.apa.org/cognitive-dissonance"
      }
    ]
  },
  {
    "id": "affordance--embodied-cognition",
    "sourceId": "affordance",
    "targetId": "embodied-cognition",
    "ownerId": "affordance",
    "label": "身体と環境を考える二つの視点",
    "explanation": "両者は身体・環境と認知の関係を考える入口になります。生態心理学と身体化認知の各立場を同一視する関係ではありません。",
    "evidence": [
      {
        "title": "OECS: Affordances",
        "url": "https://oecs.mit.edu/pub/984ungzu"
      }
    ]
  },
  {
    "id": "umwelt--affordance",
    "sourceId": "umwelt",
    "targetId": "affordance",
    "ownerId": "umwelt",
    "label": "生物と環境の関係を比べる",
    "explanation": "環世界は生物にとっての意味、アフォーダンスは行為の可能性から環境を見る視点です。用語を同義とする線ではありません。",
    "evidence": [
      {
        "title": "University of Minnesota Press: Surface Encounters",
        "url": "https://manifold.umn.edu/read/a1d6deae-b96b-4bb9-8217-f41acf52f21c/section/17356e75-9cb7-4204-ab18-0710db5385b3"
      }
    ]
  },
  {
    "id": "predictive-processing--embodied-cognition",
    "sourceId": "predictive-processing",
    "targetId": "embodied-cognition",
    "ownerId": "predictive-processing",
    "label": "認知モデルの接点を考える",
    "explanation": "予測処理と身体化認知を組み合わせる研究がありますが、理論の解釈によって関係は異なります。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Embodied Cognition",
        "url": "https://plato.stanford.edu/entries/embodied-cognition/"
      }
    ]
  },
  {
    "id": "phase-transition--emergence",
    "sourceId": "phase-transition",
    "targetId": "emergence",
    "ownerId": "phase-transition",
    "label": "全体の変化と性質を比べる",
    "explanation": "相転移を集団の振る舞いとして考えることは、創発の問いにつながります。すべての創発が相転移という意味ではありません。",
    "evidence": [
      {
        "title": "Stanford: Introduction to Statistical Mechanics",
        "url": "https://web.stanford.edu/~peastman/statmech/phasetransitions.html"
      }
    ]
  },
  {
    "id": "path-dependence--transaction-costs",
    "sourceId": "path-dependence",
    "targetId": "transaction-costs",
    "ownerId": "path-dependence",
    "label": "切り替えと調整の負担を考える",
    "explanation": "方式の切り替えには契約や調整の負担が伴うことがあります。経路依存性と取引費用は、その違う側面を見る概念です。",
    "evidence": [
      {
        "title": "EH.net Encyclopedia: Path Dependence",
        "url": "https://eh.net/encyclopedia/path-dependence/"
      }
    ]
  },
  {
    "id": "social-construction--imagined-communities",
    "sourceId": "social-construction",
    "targetId": "imagined-communities",
    "ownerId": "social-construction",
    "label": "帰属の成立を社会から問う",
    "explanation": "国民の帰属を歴史的に考えることは、社会的な区分の成立を問う入口にもなります。二つの議論全体を同一視しません。",
    "evidence": [
      {
        "title": "Stanford Encyclopedia: Social Construction",
        "url": "https://plato.stanford.edu/entries/social-construction-naturalistic/"
      }
    ]
  },
  {
    "id": "bricolage--rhizome",
    "sourceId": "bricolage",
    "targetId": "rhizome",
    "ownerId": "bricolage",
    "label": "組み合わせと接続を比べる",
    "explanation": "既存の素材を組み直す視点と、中心を固定しない接続の視点を比較できます。影響や同義を主張する線ではありません。",
    "evidence": [
      {
        "title": "Yale: Bricolage and Cultural Software",
        "url": "https://jackbalkin.yale.edu/2-bricolage-and-construction-cultural-software-0"
      }
    ]
  }
];
