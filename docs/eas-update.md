# EAS UpdateによるiOSプレビュー更新

## 目的・範囲（実装前の設計）

画面・文章・JavaScript・画像の互換性のある変更を、アプリの再インストールなしで実機へ届ける。画面や操作フロー、保存データの形式は変更しない。ネイティブ依存・権限・SDKの変更は新しいビルドで届ける。

## 初期計画（手動配信、実装済み）

- SDK 58対応のexpo-updatesを導入し、EAS CLIのupdate:configureでURL・runtimeVersion・チャンネルを設定する。
- GitHub Actionsの「iOS Preview Update」からiOS / previewチャンネル / preview環境へ手動配信する。lint・型チェックを先に実行する。
- map-labはpreviewと異なるチャンネルに分け、実験フラグを含む更新を通常版へ届けない。
- 初回だけUpdate対応ビルドをインストールする。以降はアプリを完全終了・起動し、ダウンロード後の次回起動で反映を確認する。

## 受け入れ条件

- 更新先はpreviewに固定され、productionには配信しない。
- ネイティブとの互換性はruntimeVersionで区切る。
- lint・型チェック・iOSバンドル生成が成功する。
- 未実施のビルド・配信・実機反映を確認済みと扱わない。

## 実装済み

- `expo-updates ~58.0.21` をSDK互換の `expo install --npm` で導入した。
- `eas-cli@27.5.0 update:configure --platform ios --environment preview --non-interactive` を実行し、既存プロジェクトのURLとiOSの `appVersion` ポリシーを生成した。既存の暗号化設定を保持した。
- CLIが各ビルドプロファイルに同名のチャンネルを追加した。`map-lab`にも独自チャンネルが設定され、previewからの継承を上書きする。
- `.github/workflows/ios-preview-update.yml` はdevelopへのpushで自動配信し、手動実行も可能。自動実行ではコミットSHA、手動実行では入力した更新内容をメッセージとして環境変数経由で渡し、iOS / previewチャンネル / preview環境へ配信する。ActionはコミットSHA、EAS CLIは27.5.0に固定した。
- productionへの配信は対象外。developへのpushで品質チェックと設定検証が成功した場合にpreviewへ配信する。

## 自動配信への変更設計（2026-11-08）

手動実行のみだった運用を、developへのpush（PRマージを含む）で自動配信する運用に変更する。品質チェック成功後、previewにだけ配信する。手動実行も残す。自動配信メッセージにはコミットSHAを使用する。既存のappVersionポリシーを保持し、配信前にUpdate URL・ポリシー・チャンネルを検証する。ネイティブ差分の自動判定は行わないため、ネイティブ変更時のversion更新は必須とする。

## 利用手順

1. 変更をGitHubのデフォルトブランチ `develop` に反映する。
2. Actions → **iOS Preview** → Run workflowで、この設定を含むブランチをビルドする。完成したアプリをiPhoneへ上書きインストールする。従来のUpdate未対応ビルドは更新を受信できない。
3. 互換性のあるJS・画面・画像の変更をdevelopにマージすると、**iOS Preview Update** が自動で実行される。既存の `EXPO_TOKEN` Secretを使う。必要ならRun workflowで対象ブランチと更新内容を指定して手動実行もできる。
4. iPhoneをオンラインにし、アプリを完全終了して起動する。更新がダウンロードされるまで待ち、反映しない場合はもう一度完全終了・起動する。通常は最大2回のコールド起動で確認する。

削除してからインストールする必要はない。map-labへの更新配信はこのワークフローの対象外であり、map-labビルドはpreview更新を受信しない。#14の変更では通常previewチャンネルでもデモを有効にするため、専用map-labの再インストールなしでGachaから50・100件を確認できる。productionの既定の入口は引き続き無効。

### ネイティブ変更時

CLI標準の `appVersion` ポリシーを使用するため、ネイティブ依存・Expo SDK・権限等を変更したら、**app.jsonのexpo.versionを上げて**新規ビルド・上書きインストールを行う。バージョンを据え置くと互換性のない更新を旧ビルドへ届ける危険がある。JSのみの修正ではversionを据え置ける。

## 検証状況

- Expoログインおよび公式CLIによるUpdate設定生成は成功。
- lint・型チェック・iOS向けexportが成功。ワークフローYAMLの読み込み、ActionのSHA固定、チャンネル分離とUpdate設定の整合性をローカルで確認した。
- 自動配信設定を追加。クラウドでの自動配信およびUpdate対応ビルドの実機検証は未実施。初回の対応ビルドをインストールしてから、配信と受信を確認する。

## 参考

- https://docs.expo.dev/eas-update/getting-started/
- https://docs.expo.dev/eas-update/runtime-versions/

### アイコン・起動画面を含む1.0.1
`expo-splash-screen`とネイティブ起動設定を追加したため、version 1.0.1で新しいプレビュービルドを一度作成し、既存アプリへ上書きインストールする。1.0.0のビルドへこのJS更新を届けないようruntimeVersionをappVersionで分離している。以後、互換性のある1.0.1のJS修正はpreview更新で配信できる。

### 日本語・英語対応を含む1.0.2

端末の言語取得に`expo-localization`と対応言語のネイティブ設定を追加したため、1.0.2の新しいプレビュービルドが必要。Actionsの**iOS Preview**で対応ブランチをビルドし、完成したアプリを既存アプリへ上書きインストールする。既存の履歴を残すため、削除してからのインストールは不要。1.0.1以前はruntimeVersionが異なるため、この更新を受信しない。以後の互換性のある1.0.2のJS修正はpreview更新で受信できる。言語対応の詳細と未検証項目は[languages.md](languages.md)を参照。
