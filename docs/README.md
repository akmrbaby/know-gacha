# ドキュメント一覧

| 文書 | 役割 | 状態 |
| --- | --- | --- |
| [gacha-allowance.md](gacha-allowance.md) | 通常ガチャの初期10回・権利管理・保存移行 | 実装・自動検証・Web10回開封済み、実機確認は未完了 |
| [gacha-clarity.md](gacha-clarity.md) | Gachaの情報量と操作の整理 | 実装・Web操作確認済み、実機評価は未完了 |
| [map-scaling.md](map-scaling.md) | #13 通常Map・大量表示の動的配置と描画削減 | 実装・自動テスト・Web確認済み、実機評価と最終技術選定は未完了 |
| [eas-update.md](eas-update.md) | EAS Updateの設計・配信・実機確認手順 | 設定・develop自動配信ワークフロー実装済み、配信・実機受信は未検証 |
| [map-labels.md](map-labels.md) | #12 ズームから独立した文字描画と表示優先度 | 実装・Web検証済み、iPhone 16 Pro / iOS 27.2 / Expo Goで鮮明さ・文字拡大等のユーザー確認OK |
| [map-home.md](map-home.md) | #8 Mapホーム・開封と探索の統合 | 実装・Webの開封／関係探索／位置復元確認済み、実機未検証 |
| [native-ui-integration.md](native-ui-integration.md) | #9 Map・開封・読書へのUI統合 | 実装・Web確認・iOS/Androidバンドル生成済み、実機未検証 |
| [native-ui-foundation.md](native-ui-foundation.md) | #9 UI基盤・並行開発の境界 | テーマ・共通操作・確認画面を実装、Web検証済み、実機未検証 |
| [map-device-evaluation.md](map-device-evaluation.md) | #7→#14 実機比較の手順・計測・評価記録 | previewで50・100件を確認する導線を追加、実機操作・性能比較は未検証 |
| [map-interaction.md](map-interaction.md) | #7 動的配置・直接操作の試作と移管記録 | 5〜10件の試作を区切り、文字は#12、通常Map・大量表示は#13、実機検証は#14へ移管 |
| [knowledge-graph-demo.md](knowledge-graph-demo.md) | #6 共有概念・公開範囲・件数別デモ | 実装・自動検証・Web確認済み、実機未検証 |
| [ios-ci.md](ios-ci.md) | iOS内部配布・GitHub Actionsの設定と初回準備 | 設定実装済み・クラウドと実機は未検証 |
| [proposal.md](proposal.md) | アプリ全体の構想・長期候補 | 企画案。SwiftUI等の技術想定より現行のExpo環境を優先 |
| [ux-design-v0.3.md](ux-design-v0.3.md) | Gachaと全画面Mapへの再設計 | 実装済み・自動検証済み、実機未検証。新しい付与ルールは保留 |
| [ux-design-v0.2.md](ux-design-v0.2.md) | 開封演出・読書・知識グラフの設計と実装記録 | 試作実装済み・実機フィードバックをv0.3へ反映 |
| [../README.md](../README.md) | 現在の起動方法・機能確認・接続トラブルの対処 | 現行実装の利用手順 |

## 設計を残すルール

- 機能追加やUX変更の前に、目的・範囲・画面と操作・データと保存・受け入れ条件を設計書に残す。
- 実装時に判断が変わったら、同じPRで設計書と変更履歴を更新する。
- 設計中・実装済み・未検証を区別し、設計だけの機能を現行機能としてREADMEに記載しない。
- 実機での検証結果と制約も残す。未確認の操作を確認済みにしない。
- 大きく方針を変える場合は、新しい設計書から旧文書へリンクして変更理由を残す。
