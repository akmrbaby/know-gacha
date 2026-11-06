# KnowGacha ― 脳ガチャ ―

一日一つ、名前しか知らなかった世界を知る。Expo SDK 58 / React Native / TypeScript による最初の試作品です。SwiftUI・SwiftDataではなく、WSL2とiPhoneのExpo Goを優先します。

## 起動

```bash
npm ci
npx expo start --go
```

iPhoneとWindowsを同じWi-Fiに接続し、カメラでQRコードを読み取ってExpo Goで開きます。WSL2からLAN接続できない場合は `npx expo start --go --tunnel` を試してください（初回はExpo CLIからトンネル用ツールの導入を求められる場合があります）。

## 起動時のエラーを確認する

`Web Bundling` はブラウザ向けのビルドです。iPhoneのネイティブ動作確認では、ターミナルの `w` キーやブラウザ表示ではなく、QRコードからExpo Goで開いてください。

`Unable to resolve "react-native-web/dist/index"` が出る場合は、最新の依存を入れ直してキャッシュをクリアします。

```bash
npm ci
npx expo start --go --clear
```

Webプレビュー用の `react-native-web` も依存に含めています。WSL2から接続できない場合は `npx expo start --go --tunnel --clear` を使用してください。

## iPhoneでの確認

1. ホームのアプリ名・説明・「今日の一語を開く」を確認する。
2. 開封し、名称・導入文・短い解説・深掘り本文を読む。
3. 戻って「今日の一語を読み返す」を押し、同じ語が表示されることを確認する。連打しても履歴が増えないことも確認する。
4. Expo Goを終了し、同じプロジェクトを開き直す。今日の語と開封履歴が復元されることを確認する。
5. ホームの開発用「翌日扱いにする」を押し、新しい未開封語が出ることを確認する。開発用の日付差分も再起動後に復元される。
6. 3語すべて開封する。当日は3語目を再閲覧でき、さらに翌日へ進めると全件開封の案内が出る。
7. 「開封履歴を見る」から全3語を読み返す。
8. 「進捗を初期化する」でキャンセルを試し、次に実行する。履歴・今日の語・開発用日付が初期状態に戻り、再起動後も維持される。
9. 可能なら現地の午前0時をまたいで起動を継続、またはバックグラウンドから復帰し、新しい日の表示になることを確認する。

開発用ボタンは `__DEV__` のときだけ表示・実行できます。製品モードでは開発用日付差分を無視します。実機での表示・操作確認は別途必要です。

## 検証

```bash
npm run lint
npm run typecheck
node --test tests/progress.test.cjs
npx expo export --platform ios --output-dir /tmp/knowgacha-ios
npx expo export --platform web --output-dir /tmp/knowgacha-web
```

## 構成・保存

- `src/app/`: Expo Routerのホーム・履歴・解説画面
- `src/data/keywords.ts`: 光電融合・エスノグラフィー・シュルレアリスムの独自の試作用原稿。公開用の校閲・出典確認は未実施。
- `src/state/progress.ts`: 現地日付、未開封語のランダム選出、保存形式の検証
- `src/state/ProgressProvider.tsx`: AsyncStorageによる復元と保存。開封日と履歴を一つのJSONとして保存し、保存成功後に表示を更新。並行操作を防止。

開封は現地の暦日ごとに一回で、未開封日の権利は蓄積しません。端末時計変更への厳密な対策はありません。保存はこの端末のアプリ領域のみで、アンインストール後の復元・機種間同期・書き出しは今回の範囲外です。読み込み失敗時はデータを上書きせず再試行を表示します。

課金・通知・知識グラフ・バックエンドは含みません。企画全体は `docs/proposal.md` を参照してください。

## ブランチ運用

`main` → `develop` → `feature/*`。機能PRは `develop` に向けて作成します。
