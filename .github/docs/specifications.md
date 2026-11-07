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

## プロダクトのページ

プロダクトのページは [tett23/tett23.github.io](https://github.com/tett23/tett23.github.io) に移し、`https://tett23.github.io/` で公開している（[ADR 0008](adr/0008-move-product-pages-to-user-site.md)）。
ページのソースと仕様はそちらにある。
ページについてのこれまでの決定（[ADR 0002](adr/0002-product-pages-on-github-pages.md) から [ADR 0008](adr/0008-move-product-pages-to-user-site.md)）は、このリポジトリに残す。

このリポジトリの GitHub Pages は、`/tett23/` の下で公開していた URL を新しい URL へ転送するページだけを配る。

| 古い URL | 新しい URL |
| --- | --- |
| `https://tett23.github.io/tett23/` | `https://tett23.github.io/` |
| `https://tett23.github.io/tett23/nablaskk/` | `https://tett23.github.io/nablaskk/` |
| `https://tett23.github.io/tett23/peg-hs/` | `https://tett23.github.io/peg-hs/` |

- 転送のページは `.github/redirects/` にある手で書いた HTML である。`link rel="canonical"` で新しい URL を示し、スクリプトで `location.search` と `location.hash` を付けて移る（peg-hs の共有リンクの `#g=` を引き継ぐ）。スクリプトが動かないときは `meta refresh` で移り、本文にも新しい URL へのリンクを置く。
- GitHub Pages ではサーバーの側で転送を設定できないので、HTTP の 301 にはならない。
- CI の `site` ジョブが転送のページを Deno のテストで検査し、main への push では `deploy` ジョブが GitHub Pages にデプロイする。

## 破棄したADR

なし
