# ADP登録後のiPhoneプレビューPoC

## 構成と現在地

Expo Goではなく、KnowGacha専用の内部配布プレビューアプリを使う。`preview`ブランチへのpushでGitHub ActionsがiOS向けEAS Updateを公開し、Actions Summaryに更新のExpoダッシュボードURLを出力する。PCやMetroサーバーの常時起動は不要。

準備済み: SDK 58用expo-updates、eas.jsonの内部配布previewプロファイル、runtimeVersionのfingerprintポリシー、公開workflow、画面文言1か所（PoC 01）。開発クライアントは追加していない。アプリは同じruntimeのpreviewチャンネル更新を起動時に取得するリリース構成。

未実施: Expoプロジェクトの作成・連携、Apple署名設定、端末登録、初回ビルド、iPhoneへのインストール、更新公開と実機確認。ADP加入だけではこれらは完了しない。Expoの認証情報はこの環境に未設定。

## 初回セットアップ

以下は認証済みのクラウドターミナルで行える。Apple IDのパスワード・2FAコード・Expoトークンをソースやチャットに保存しない。

1. Expoアカウント名と利用するプロジェクトを確定。`npx eas-cli@latest login`でログインし、`npx eas-cli@latest whoami`で確認する。自動化用トークンは秘密情報設定から渡す。
2. `npx eas-cli@latest init`で実際のプロジェクトに連携する。既存プロジェクトがある場合はそちらを選ぶ。app.jsonの`owner`に実際のアカウントまたはOrganization名を記載する。
3. `npx eas-cli@latest update:configure`で`extra.eas.projectId`と`updates.url`を設定する。runtimeVersionは`{"policy":"fingerprint"}`を維持し、eas.jsonのchannelとenvironmentは両方`preview`にする。架空のprojectIdは使わない。
4. `com.akmrbaby.knowgacha`はリポジトリ名から提案したBundle Identifier。既に取得済みの識別子があれば初回ビルド前に置き換える。初回Apple連携で利用可能かを確認する。
5. `npx eas-cli@latest device:create`で端末登録URLを生成し、iPhoneで開いて登録する。ADPが有効であることを確認し、初回ビルド時の対話認証でAppleチームと対象端末を選択する。
6. `npx eas-cli@latest build --profile preview --platform ios`を初回のみ実行し、完了時のインストールURLをiPhoneのSafariで開く。初回ビルドはまだ実行していない。

内部配布はAd Hoc署名を使い、対象iPhoneがプロビジョニングプロファイルに含まれている必要がある。登録直後はApple側の端末処理に時間がかかる場合がある。

## GitHubの設定

1. [ExpoのAccess tokens](https://expo.dev/settings/access-tokens)でトークンを発行する。
2. [リポジトリのActions secrets](https://github.com/akmrbaby/know-gacha/settings/secrets/actions)に`EXPO_TOKEN`として保存する。Expoプロジェクトへの公開権限を持つアカウントを使う。
3. 本設定と実プロジェクトIDを含む変更を`preview`ブランチへpushする。初回ビルドと更新は、同一のネイティブ構成・依存関係とExpoの`preview`環境を使う。

workflowは`preview`ブランチのみが対象。手動実行も同ブランチを選ぶ。mainや他ブランチへのpushでは公開しない。Apple署名情報は更新公開に不要。初回ビルドの自動実行は含まない。

## 文言1か所での実機確認

1. 初回ビルドをインストールし、`KnowGacha：クラウドプレビュー確認用 PoC 01`が表示されることを確認する。
2. App.tsxの同じTextだけを`KnowGacha：クラウドプレビュー確認用 PoC 02`へ変更して`preview`にpushする。初回ビルドを作る前にPoC 02へ変えない。
3. Actionsの`iOS preview update`が成功し、Summaryに公開済み更新のURLがあることを確認する。
4. Windows PCを停止し、iPhoneをインターネットへ接続してKnowGachaを開く。更新のダウンロードを待ち、アプリを完全終了して再起動し、PoC 02が表示されることを確認する。必要ならもう一度終了・起動する。
5. コミットSHA、ビルドURL、更新URL、iOS実機の表示結果を記録してPoC成功とする。現時点ではこの確認は未実施。

Summaryの更新URLは公開内容を見る管理ページ。Expo Go起動URLやアプリのインストールURLではない。iPhoneで開く初回インストールURLはEAS Buildが発行する。今回のリリース型プレビューアプリはインストール後のアプリアイコンから起動する。

文言だけの変更は同じfingerprintで配信できる。依存ライブラリやネイティブ設定が変わりfingerprintが変わった場合は、新しい内部配布ビルドを作ってインストールする。更新公開の成功だけでは既存アプリへの適用を保証しない。

## ローカル検証結果（2026-11-07）

- `tsc --noEmit`: 成功。
- `expo lint`: 成功。Expo CLIでESLint設定を追加し、初期化後に再実行して確認した。
- `expo export --platform ios`: 成功。618モジュールのiOSバンドルを生成した。
- workflow YAMLの読み込みとpreviewプロファイルのchannel・distribution確認: 成功。
- `expo install --check`（オフライン）: 同梱情報では整合。オンラインのExpo診断やEASでの実行は未検証。

## 公式資料

- [SDK 58 / expo-updates](https://docs.expo.dev/versions/v58.0.0/sdk/updates/)
- [Updateセットアップ](https://docs.expo.dev/eas-update/getting-started/)
- [内部配布・端末登録](https://docs.expo.dev/build/internal-distribution/)
- [GitHub Actions連携](https://docs.expo.dev/eas-update/github-actions/)
