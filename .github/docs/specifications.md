# 仕様

tett23 の現行の仕様をまとめる。
設計判断の経緯は `.github/docs/adr/` のADRに記録する。

## ファイルの置き場所

- ルートの `README.md` は、GitHub のプロフィールに表示する内容だけを書く。
- 開発の手順（`.github/CONTRIBUTING.md`）、仕様（`.github/docs/specifications.md`）、ロードマップ（`.github/docs/roadmap.md`）、ADR（`.github/docs/adr/`）、CI（`.github/workflows/`）は `.github/` の下に置く。
- `.githooks/` と `.gitignore` は git が読む場所のため、ルートに置く。
- `LICENSE` は、GitHub がライセンスとして認識するよう、ルートに置く。

## ADRの検査

- コミット済みのADRの変更は、[adr-guard](https://github.com/tett23/adr-guard) で拒否する。pre-commit hook（`.githooks/pre-commit`）は `adr-guard pre-commit --allow-status --allow-links` を実行する。
- CIの `adr` ジョブは adr-guard v0.10.0 のactionを使い、コミット済みのADRの変更、ADRの参照のリンク、ADRの番号の重複（`check-numbers`）を検査する（[ADR 0001](adr/0001-update-adr-guard-to-v0-10-0.md)）。
- ADRの参照（`ADR 0001` の形）にはADRのファイルへのリンクを付ける。ほかのリポジトリのADRは、リンクのテキストごと外部リンクにする。

## 破棄したADR

なし
