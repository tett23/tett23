# 開発

クローン後、gitのhookを有効化する。コミット済みのADRの変更は [adr-guard](https://github.com/tett23/adr-guard) で拒否する。

```sh
git config core.hooksPath .githooks
```

CIの `adr` ジョブは adr-guard v0.10.0 のactionで、コミット済みのADRの変更、ADRの参照のリンク、ADRの番号の重複を検査する（[ADR 0001](docs/adr/0001-update-adr-guard-to-v0-10-0.md)）。
ADRの参照（`ADR 0001` の形）にはADRのファイルへのリンクを付ける。ほかのリポジトリのADRは、`tett23/adr-guard ADR 0019` のように書かず、リンクのテキストごと外部リンクにする。

設計判断は `.github/docs/adr/` にADRとして記録する。仕様は [docs/specifications.md](docs/specifications.md) を参照。

## プロダクトのページ

ページのソースは [tett23/tett23.github.io](https://github.com/tett23/tett23.github.io) にある（[ADR 0008](docs/adr/0008-move-product-pages-to-user-site.md)）。
このリポジトリには、古い URL から転送するページ（`.github/redirects/`）だけがある。検査は次のとおり。

```sh
deno test --allow-read .github/redirects
```

## ファイルの置き場所

ルートの `README.md` は GitHub のプロフィールに表示される。
プロフィールに見せる必要のないファイル（仕様、ロードマップ、ADR、CI）は `.github/` の下に置く。
`.githooks/` と `.gitignore` は、git が読む場所のためルートに置く。`LICENSE` は、GitHub がライセンスとして認識するようルートに置く。

## License

[MIT](../LICENSE)
