# iPhone Expo Go / EAS Update 最小PoCの調査

調査日: 2026-11-07。対象: akmrbaby/know-gacha、基準コミット `2a8b2f8`。

これはADP登録前の調査記録。登録後の専用プレビューアプリ構成と現在の準備状況は[preview-setup.md](./preview-setup.md)を参照。

## 結論

現状のSDK 58アプリを、Apple Developer Program未加入のままApp Store版のiPhone Expo Goで開く要件は成立しない。文言変更だけを準備し、更新公開・GitHub Actionsの自動公開・EAS Build・常時稼働サーバーの構築は実施していない。実機検証済みのプレビューURLはない。

## 既存構成

| 項目 | 確認結果 |
| --- | --- |
| Expo | package.json: `~58.0.23`、lockfile: `58.0.23`、CLI解決SDK: `58.0.0` |
| React / React Native | `19.3.0` / `0.88.1` |
| expo-status-bar | `~58.0.4` |
| TypeScript / @types/react | `~6.0.3` / `~19.3.0` |
| パッケージ管理 | npm、package-lock.jsonあり |
| エントリー / 画面 | index.tsからregisterRootComponent、App.tsxの単一画面 |
| app.json | name / slugともに`tmp`、version `1.0.0`、画像・向き等の初期設定 |
| EAS連携 | eas.jsonなし。extra.eas.projectId、owner、updates.url、runtimeVersionの明示設定なし |
| OTA / 開発クライアント | expo-updates、expo-dev-clientの直接依存なし |
| ネイティブ / CI | ios・androidディレクトリなし、.github/workflowsなし |

独自のネイティブライブラリは直接依存にない。今回の阻害要因はまずSDKとiPhone Expo Goの互換性である。未連携設定からEAS上の既存プロジェクトやアカウントの有無までは判断していない。

## 公式仕様との照合

1. [Expo GoのSDK不一致の説明](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/)では、App Store版はSDK 54までで、SDK 55以降は提供されていない。Expo GoとプロジェクトのSDKは一致する必要がある。したがってSDK 58の本プロジェクトは対象外。
2. 同資料では実機iPhone向けの`eas go`によるTestFlight内部配布にはApple Developer Program加入が必要。今回の条件を満たす代替手段にならない。
3. [EAS Updateの制約](https://docs.expo.dev/build/updates/)では、runtimeVersion付きの更新はExpo Goで読み込めない。[標準セットアップ](https://docs.expo.dev/eas-update/getting-started/)はruntimeVersion・updates.url・projectIdを設定する。標準設定を足して公開しても、Expo Goで開けるという検証にはならない。
4. SDK番号やruntimeVersionだけを書き換えても、SDK 58のReact NativeやネイティブコードがSDK 54互換になるわけではない。SDKのダウングレードは今回の文言変更PoCの範囲外とした。

参照した[SDK 58資料](https://docs.expo.dev/versions/v58.0.0/)と[公式資料索引](https://docs.expo.dev/llms.txt)も含め、公式情報に基づく構成上の判定。iPhoneで実際に読み込ませるテストは行っていない。

## 最小変更と確認

App.tsxのTextを1か所だけ`KnowGacha：クラウドプレビュー確認用 PoC 01`に変更。表示変更の準備であり、クラウド配信成功を表す文言ではない。

- `npm ci --ignore-scripts --no-audit --no-fund`: 成功。
- `./node_modules/.bin/tsc --noEmit`: 成功。
- `EXPO_NO_TELEMETRY=1 ./node_modules/.bin/expo config --type public`: 成功。SDK 58を確認。
- `expo install --check`（オフライン）: 同梱情報では依存は整合。ただしCLIがオフライン判定の信頼性について注意を出しており、オンライン診断の代わりではない。
- `expo lint`: 実行を試みたが、既存ESLint設定がなく自動設定に伴うネットワークアクセスが失敗。lintは未完了。文言1か所の変更にlint環境一式は追加していない。

## push連動の扱い

今回の条件では開ける更新を生成できないため、push時に公開するworkflowやExpoトークン設定は追加していない。URLの発行だけをPoC成功とはしない。

将来対応するiOSクライアントを確保できた場合は、EASプロジェクト連携、互換runtimeの確認、GitHub SecretsへのEXPO_TOKEN設定、push対象ブランチを限定したEAS Update公開、Actions Summaryへの更新URL出力、PC停止状態でのiPhone実機確認の順に進める。トークンをソースやチャットへ記載しない。

当面の別案は、SDK 54互換への移行を別作業として検討するか、Safariで見るWebプレビューを別PoCとして検証すること。前者でもEAS Update経由のExpo Goプレビューが成立するかは別途検証が必要で、後者はExpo Goやネイティブ挙動の確認を代替しない。
