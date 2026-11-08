# iOS実機確認とCI

## 目的と範囲

GitHubから品質チェックとiOS内部配布ビルドを実行する。アプリの画面・操作・保存データへの変更はない。TestFlight提出は対象外。EAS Updateの設定・配信手順は[eas-update.md](eas-update.md)を参照する。

## パッケージ管理

依存の管理はnpmに統一し、package-lock.jsonをコミットする。CIはnpm ciを使用する。package.jsonに残っていたYarnのpackageManager指定は、DependabotがYarnとして依存を解釈する原因となるため削除した。npmのバージョン固定は追加せず、ロックファイルとnpmコマンドを基準にする。Dependabotの再実行結果はマージ後に確認する。

## 実装済みの設定

- `CI`: main/developへのpush、PR、手動実行でnpm ci・lint・型チェックを実行する。
- `iOS Preview`: 手動実行でチェック後にEASのpreviewビルドを実行する。完了まで待ち、ビルド失敗もActionsに反映する。配布URLはビルドのログから確認する。
- Repository variable `EAS_IOS_BUILD_ENABLED` を `true` にすると、developへのpushでもiOSビルドする。未設定の間はpushによるビルドをスキップする。
- EAS CLIは27.5.0、ActionsのNode.jsは24を使用する。
- 外部Actionは公式リポジトリで確認した40桁のコミットSHAに固定し、コメントにリリース番号を記載する。Dependabotが週次でActionsの更新PRを提案する。

2026-11-08: 初回ビルドのiPhoneへのインストール・起動はユーザー報告で確認済み。[Actions run 42438921989](https://github.com/akmrbaby/know-gacha/actions/runs/42438921989)でもlint・型チェック・EAS previewビルド完了をログで確認した。Actions生成物自体の実機インストール・全操作は未確認。

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
- 検証済み: GitHub Actionsの品質チェックとEAS previewビルド完了。初回ビルドの実機インストール・起動はユーザー報告で確認。
- 未検証: Actions生成物の実機確認、Update対応ビルドと配信の受信。

## 参考

- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/build/internal-distribution/
