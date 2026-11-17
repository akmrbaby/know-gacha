# TestFlight向けの手動ビルド・アップロード

## 目的と範囲

Actionsの `iOS TestFlight` を手動実行し、品質チェック後にproductionビルドを作成してApp Store Connectへ送信する。アプリの画面・保存データは変更しない。内部配布用の `iOS Preview`、previewへのOTA更新とは別の処理で、productionチャンネルを使う。

## 初回準備

1. App Store ConnectのKnowGachaのBundle IDが `com.akmrbaby.knowgacha` であることを確認する。
2. App Store Connect → アプリ情報 → Apple IDの数値を、GitHubのSettings → Secrets and variables → Actions → Variablesに `ASC_APP_ID` として設定する。Bundle IDやAppleログイン用メールとは別の値。ワークフローはrunner上のeas.jsonの `submit.production.ios.ascAppId` に反映する。リポジトリには書き戻さない。
3. 既存のActions Secret `EXPO_TOKEN` を使う。値をコード・ドキュメント・チャットへ貼らない。
4. 手元のターミナルで `npx eas-cli@27.5.0 credentials --platform ios` を実行し、productionのストア配布用証明書・プロビジョニングを設定する。previewのAd Hoc用プロビジョニングとは別。必要なら初回productionビルドを対話実行し、署名設定を完了する。すでに有効なストアビルドがある場合、重複ビルドせずそのIDを指定して送信できる。
5. 同じcredentialsコマンドでproduction → App Store Connect: Manage your API Key → Set up your project to use an API Key for Expo Submitを選び、対象アプリ用キーをEASに登録する。Apple IDのパスワード・API秘密鍵をGitHubリポジトリへ保存しない。

非対話モードでは初回認証情報を設定できない。署名修復が必要になった場合も手元で更新する。既存のトークンでproduction操作ができるか、Apple側の契約・登録・認証情報が有効かは実行前に別途確認する。

## 実行と確認

- デフォルトブランチへマージ後、Actions → iOS TestFlight → Run workflowで `develop` または配布するレビュー済みのブランチを選ぶ。選択したブランチのコードをビルドする。pushによる自動実行はない。
- `npm ci`・lint・型チェック後、productionビルドの完了を待つ。ビルド番号は既存設定の `autoIncrement` で増分する。
- 完成したビルドのIDを使って送信し、送信処理の完了も待つ。`--latest` で別のビルドを選ばない。Actions summaryにソースコミットとビルドIDを記録する。
- Actions完了後、App Store Connect → TestFlightでApple側の処理・輸出コンプライアンス・内部グループへのビルド割当を確認し、自分のTestFlightアプリでインストールする。アップロード完了だけでは実機インストールの成功を意味しない。
- 外部テスター招待・外部ベータ審査・App Store公開はこのワークフローでは実行しない。

アップロードのみ失敗した場合は、有効なビルドを作り直さない。原因を修正後、記録したIDを指定して `npx eas-cli@27.5.0 submit --platform ios --profile production --id BUILD_ID --non-interactive --wait` を実行する。手元で実行する場合は、eas.jsonの送信プロファイルにも正しいascAppIdを設定する。タイムアウトやキャンセル後はEAS側のビルド・送信状態を確認してから再実行する。

## 情報の扱い

このリポジトリとActionsログは公開。トークンはSecret経由で必要なステップにだけ渡す。生のビルドJSONはrunnerの一時ファイルに保存し、artifactとして公開しない。CLIはアプリ名・チーム情報・EASリンク等をログへ表示する場合があり、Secretsによるマスクはそれら全体の秘匿を保証しない。Apple認証情報の追加やデバッグ用の環境変数出力は避ける。

## 受け入れ条件と状態

- 手動実行だけで開始し、送信先未設定・不正値の場合はビルド前に終了する。
- 品質チェックやビルドが失敗した場合は送信しない。今回完成したビルドだけを送る。
- 実装済み: ワークフローと初回設定・復旧手順。
- 未検証: production署名・APIキー・ASC_APP_IDの外部サービス設定、実際のEASビルド・Appleへの送信・TestFlight実機確認。

## 参考

- https://docs.expo.dev/build/building-on-ci/
- https://docs.expo.dev/submit/ios/
