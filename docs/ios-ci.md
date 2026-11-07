# iOS実機確認とCI

## 目的と範囲

GitHubから品質チェックとiOS内部配布ビルドを実行する。アプリの画面・操作・保存データへの変更はない。TestFlight提出とEAS Update配信は対象外。

## 実装済みの設定

- `CI`: main/developへのpush、PR、手動実行でnpm ci・lint・型チェックを実行する。
- `iOS Preview`: 手動実行でチェック後にEASのpreviewビルドを実行する。完了まで待ち、ビルド失敗もActionsに反映する。配布URLはビルドのログから確認する。
- Repository variable `EAS_IOS_BUILD_ENABLED` を `true` にすると、developへのpushでもiOSビルドする。未設定の間はpushによるビルドをスキップする。
- EAS CLIは27.5.0、ActionsのNode.jsは24を使用する。
- 外部Actionは公式リポジトリで確認した40桁のコミットSHAに固定し、コメントにリリース番号を記載する。Dependabotが週次でActionsの更新PRを提案する。

## 初回に必要な準備

1. Apple Developer Programの登録完了を待つ。
2. `npx eas-cli@latest device:create` で確認用iPhoneを登録する。
3. `npx eas-cli@latest build --platform ios --profile preview` を端末から一度実行し、bundleIdentifier・署名証明書・プロビジョニングを設定してビルドを成功させる。生成されたapp.jsonなどの変更もコミットする。
4. ExpoのAccount settings → Access tokensでトークンを作成し、GitHubリポジトリのSettings → Secrets and variables → Actions → Secretsに `EXPO_TOKEN` として登録する。トークンをリポジトリに保存しない。
5. ワークフローをデフォルトブランチへ反映後、Actions → iOS Preview → Run workflowで対象ブランチを選択する。
6. 動作確認後、必要ならActionsのVariablesに `EAS_IOS_BUILD_ENABLED=true` を追加する。

内部配布はビルドのプロビジョニングに含まれる端末のみインストールできる。端末追加・署名期限切れなどでは、端末から署名設定を更新して再ビルドする。現在のワークフローではApple認証による署名修復は自動化しない。

## 受け入れ条件と検証状況

- 品質チェックに失敗するとiOSビルドを開始しない。
- EXPO_TOKENや必須アプリ設定がなければ、理由を表示して終了する。
- 自動ビルドは明示的に有効化するまで開始しない。
- 実装済み: ワークフローと利用手順。
- 未検証: GitHub Actions上での実行、EASクラウドビルド、iPhoneへのインストールと操作。Apple登録完了後に結果を追記する。

## 参考

- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/build/internal-distribution/
