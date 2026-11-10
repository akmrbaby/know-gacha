# 採用キャラクター

2026-11-10にユーザーが選んだ、脳のしわ・半目・短い足のカプセル（候補①）。

- `approved-icon.png`: 選ばれた元の生成画像。背景・構図・色を変えず、アプリアイコンとfaviconへ書き出す。
- `mascot-source.png`: 同じ画像から画像生成ツールで背景を除去した起動用原稿。
- `monochrome-stencil.png`: 画像生成ツールで用意した白黒の単色版原稿。
- `monochrome.png`: ステンシルの白を不透明、黒を透明へ変換した単色表示用のアルファ画像。

`node scripts/export-brand.cjs`で1024pxのアイコン・スプラッシュ・Android素材と64pxのfaviconを再生成する。ImageMagick 7が必要。元の画像は変更せず、書き出し時のサイズと色形式だけを揃える。Android foregroundとmonochromeは66dpの円形安全域へ収め、全不透明ピクセルの半径を検査する。

起動時は`assets/splash-icon.png`をOSとJSで共用する。[設計と検証](../../docs/brain-capsule-brand.md)を参照。
