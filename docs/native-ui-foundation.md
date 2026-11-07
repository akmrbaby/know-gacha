# #9 ネイティブUI基盤

この文書は先行実装時の設計・検証履歴。#7のほぼ完了を受けた実画面への適用と現状は[native-ui-integration.md](native-ui-integration.md)を参照。初期の「Mapを触らない」境界はその段階のものとする。

## 目的・範囲
Mapと知識を主役にするUI刷新の先行部分。#7と並行できるよう、テーマ、文字と操作ボタン、独立した確認画面を用意する。Map、配置、カメラ、既存画面の操作は変更しない。

## 画面・操作
`/ui-preview`（`knowgacha://ui-preview`）で明暗の切替、主要・補助操作、無効・処理中の状態、長い日本語を比較する。ヘッダーは確認画面内に配置し、戻る操作を備える。文字はOSの倍率を尊重し、高さを固定しない。押下は透明度で即座に示し、アニメーションを使わないため「動きを減らす」でも同じ情報を伝える。

## テーマ・部品の契約
既存 `components/ui.tsx` の配色を明色の入力として使い、移行前の値の二重管理を避ける。新しい部品は `theme.ts` の役割名を利用する。暗色は明示的な対応色を持つ。余白は4点刻み、本文17、補足15、見出し22。ボタンは最小48点で拡大に応じて伸び、ラベル・無効・処理中のアクセシビリティ状態を公開する。最終的なプラットフォーム別アイコンは統合段階で採用する。

SDK 58 の @expo/ui を確認した。シート・メニュー等は統合時にネイティブ部品を優先する。今回のボタンはMap上で配置する独自の主要・補助操作の基盤であり、Pressableで状態と余白を統一する。依存追加はしない。

## データ・永続化
知識・開封履歴・回数制限に変更なし。確認画面の配色選択は画面内だけで保持する。アプリ全体は現状 light 固定のため、暗色対応を完了とは扱わない。

## 受け入れ条件
- テーマ経由で主要・補助操作と文字の階層を表示する。
- 処理中と無効の操作を実行できず、読み上げにも状態を渡す。
- 確認画面で明暗を比較でき、長文・文字拡大で固定高による欠落を起こさない構造にする。
- #7の実装ファイル、依存定義、開封履歴に変更しない。
- lint・型チェックを通す。実機での見た目と読み上げの確認は別途記録する。

## 後続・未検証
#9全体は未完了。#8の画面設計に合わせ、既存UIの移行、ネイティブ詳細シートとMapの指操作の共存、触覚、アイコン、Liquid Glassと代替表示、アプリ全体の暗色対応を進める。iOS/Android実機、文字拡大、VoiceOver/TalkBack、ガラス表現は未検証。

参照: [SDK 58](https://docs.expo.dev/versions/v58.0.0/)、[Expo UI](https://docs.expo.dev/versions/v58.0.0/sdk/ui/)、[Pressable](https://reactnative.dev/docs/pressable)、[Text](https://reactnative.dev/docs/text)。

## 実装・検証記録（2026-11-07）
テーマ、NativeText、NativeAction、確認画面を実装。`npm run lint`・`npm run typecheck`・`git diff --check` 成功。Chromiumの390×844表示で明暗切替、主要操作のカウント更新、無効・処理中のaria-disabled、ページ例外なしを確認。これはWeb確認でありネイティブ実機の操作・読み上げ検証ではない。

[明色の確認画像](previews/ui-foundation-light.png) / [暗色の確認画像](previews/ui-foundation-dark.png)

worktreeは `/tmp/know-gacha-native-ui`、ブランチは `feature/native-ui-foundation`。依存は元worktreeのnode_modulesを一時参照して検証した。継続作業はこのディレクトリで行う。

## 先行基盤の追加設計
共通の操作バー（NativeToolbar）とアイコン操作（NativeIconAction）を追加する設計とし、実装した。操作バーは子要素を横並び・折り返しで配置し、表面と余白のみを管理する。画面やジェスチャーを所有しない。アイコン操作は読み上げ名を必須にし、48点の操作領域、押下、無効、選択中の状態を持つ。アイコンの図形は子要素で渡し、部品と特定のアイコンライブラリを結合しない。

確認画面には、短い用語一覧に対する検索の開閉・絞り込み・クリアと、保存の選択状態を用意する。確認用の検索・保存は画面内で完結し、#8の検索・保存機能を実装したとは扱わない。図形は既存依存のreact-native-svgを利用し、最終的なSF Symbols／Materialアイコンへの対応は統合時に判断する。ガラス非対応時に使える不透明な操作バーを先に実装し、Liquid Glass対応済みとは扱わない。

Webは390点と320点の幅、Tab/Enter操作、長文と文字サイズ2倍相当のレイアウト負荷を確認する。CSSによる文字拡大確認はOSのDynamic Typeや実機検証の代わりにはしない。


## 追加分の実装・検証（2026-11-07）
- NativeToolbar、NativeIconActionと、確認画面内の検索・保存の試用を実装。
- Chromium 390×844で明暗切替、開封操作サンプルのカウント、無効・処理中の操作抑止、処理中のaria-busyを確認。
- Enterによる検索開閉、入力による絞り込み、該当なし、クリアで一覧に復帰、Spaceによる保存切替、戻る操作を確認。
- 検索のaria-expanded、保存のaria-pressed、48点以上のアイコン操作領域を確認。ネイティブ向けaccessibilityStateも設定。装飾アイコンは読み上げ対象から外し、操作名をボタン側で提供する。
- 幅320点・CSS文字サイズ2倍で、操作と文言の水平はみ出しがなく、主要操作へスクロールして実行できることを確認。[文字拡大の確認画像](previews/ui-foundation-large-text.png)。OSの文字拡大・読み上げ・キーボード実機確認とは区別する。
- WebでaccessibilityStateだけでは処理中・開閉・保存状態が伝わらない点と、SVGのaccessible属性によるReact警告を修正した。
- iOS／Android実機、OSの暗色切替・文字拡大・動きを減らす設定、VoiceOver／TalkBack、ガラス対応／非対応環境は未検証。

## 統合時の使い方
- `NativeText`: variantはtitle / body / label / caption。TextPropsとstyleを受け取り、本文のコピーにはselectableを指定する。
- `NativeAction`: title・onPress、primary / secondary、disabled・loading、styleを受け取る。loading時もラベルを残す。
- `NativeIconAction`: label・onPress・childrenを必須とし、selected・expanded・disabledを渡す。図形の色は呼び出し側でテーマに合わせる。操作の読み上げ名と図形を分離する。
- `NativeToolbar`: childrenとstyleを受け取る。Mapのジェスチャー領域の外に配置する。操作バー内の個々の操作は独立してフォーカスできる。
- 共通部品はmode省略時にOS配色を参照する。ただし現行アプリ全体はlight固定なので、全画面移行とapp.jsonの見直しが完了するまでは呼び出し側でmodeを明示する。
- 既存画面のui.tsxは移行前のまま。既存利用箇所を移す際に、旧配色の定義をtheme側へ集約する。#7では新部品をまだ使わない。

このworktreeを別環境で起動する場合は、依存を`npm ci`で準備し、`npx expo start`後に`/ui-preview`を開く。
