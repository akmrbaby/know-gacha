# プライバシー申告の確認メモ（2026-11-17）

これはコードとSDKの確認記録。App Store Connectへの申告完了や、法的な適合性の保証とは区別する。

## アプリ内データ

| 情報 | 現行の保存/送信 | 確認箇所 |
| --- | --- | --- |
| 開封語・日時・日次開始日・特典・検証日付 | AsyncStorage。アプリによる外部送信なし | src/state/progress.ts, ProgressProvider.tsx |
| 言語 | AsyncStorage。端末の優先言語から初期値 | src/i18n/I18nProvider.tsx |
| 通知・バッジ設定 | AsyncStorageとOSのローカル予約。リモートPush登録なし | src/state/ReminderProvider.tsx, BadgeProvider.tsx, src/notifications/device.ts |
| Map位置 | AsyncStorage。外部送信なし | src/hooks/useMapViewport.ts |
| お問い合わせ | 利用者が外部サイトで任意送信。履歴/端末情報の自動添付なし | src/legal/policy.json, src/app/contact.tsx |

現行依存に広告・広告トラッキングSDK、Sentry等の独自行動/クラッシュ分析サービスはない。これは「SDKの更新通信を含め、情報を一切送らない」という意味ではない。

## Expo更新通信

- `app.json`のupdates.urlはu.expo.dev。production/previewのチャンネル・runtimeVersionで更新を配信する。
- インストール済み`expo-updates/ios/EXUpdates/AppLoader/FileDownloader.swift`では`EAS-Client-ID`、`Expo-Platform`、`Expo-Runtime-Version`、設定したチャンネル等を送る。現在・同梱・失敗更新IDや、起動失敗情報をリクエストに含める場合がある。
- `expo-eas-client/ios/EASClient/EASClientID.swift`はUserDefaultsにUUIDを保存する。IDFAを取得する処理ではない。更新先には通常の通信に伴うIPも伝わる。
- `expo-eas-client/ios/PrivacyInfo.xcprivacy`にはUserDefaultsのRequired Reason（CA92.1）とtracking=falseがある。このマニフェストだけからApp Privacyの「収集なし」を決めない。
- Expoの利用・保存・集計・第三者処理について、公開ポリシーを案内する。正確なログ保存期間を確認できていないため、保持日数を捏造しない。

## 外部サイトとTestFlight

- 参考資料、公開ポリシーのGitHubページ、Issues、Expo/Apple文書は外部リンク。参照/問い合わせのボタンを押すまでは、この追加機能から外部サイトを開かない。
- 公開GitHub窓口には非公開情報を送らせない。非公開のメールやフォームはユーザーから未提供のため、架空の連絡先を設定しない。
- TestFlightのフィードバックやクラッシュ/利用診断はApple側の機能。アプリ独自の解析SDKとは区別して申告要否を確認する。

## 提出前に行うこと

1. App Store ConnectのPrivacy Policy URLへ、マージ後の公開URLを設定。Support URLは公開サポート文書を利用できる。
2. Expoの現行の処理とAppleの定義を照合し、識別子や診断情報等の申告要否・目的・関連付けを確認する。「データを収集しない」「匿名」と断定して提出しない。
3. App Store ConnectのFeedback Email等に使う公開可能な連絡用メールはユーザーから指定してもらう。プライバシーポリシーとアプリにも専用の非公開窓口を追加する場合は、原稿と設定を一緒に更新する。
4. TestFlightで外部リンク・初回OS許可・通知拒否時の基本機能を実機確認する。

公開URLはdevelopへマージ後に有効となる。

- 日本語: https://github.com/akmrbaby/know-gacha/blob/develop/legal/privacy-ja.md
- English: https://github.com/akmrbaby/know-gacha/blob/develop/legal/privacy-en.md
- Support: https://github.com/akmrbaby/know-gacha/blob/develop/legal/README.md
