# 仕様

tett23 の現行の仕様をまとめる。
設計判断の経緯は `.github/docs/adr/` のADRに記録する。

## ファイルの置き場所

- ルートの `README.md` は、GitHub のプロフィールに表示する内容だけを書く。
- ライセンス（`.github/LICENSE`）、開発の手順（`.github/CONTRIBUTING.md`）、仕様（`.github/docs/specifications.md`）、ロードマップ（`.github/docs/roadmap.md`）、ADR（`.github/docs/adr/`）、CI（`.github/workflows/`）は `.github/` の下に置く。
- `.githooks/` と `.gitignore` は git が読む場所のため、ルートに置く。

## 破棄したADR

なし
