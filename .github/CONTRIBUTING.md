# 開発

クローン後、gitのhookを有効化する。コミット済みのADRの変更は [adr-guard](https://github.com/tett23/adr-guard) で拒否する。

```sh
git config core.hooksPath .githooks
```

設計判断は `.github/docs/adr/` にADRとして記録する。仕様は [docs/specifications.md](docs/specifications.md) を参照。

## ファイルの置き場所

ルートの `README.md` は GitHub のプロフィールに表示される。
プロフィールに見せる必要のないファイル（ライセンス、仕様、ロードマップ、ADR、CI）は `.github/` の下に置く。
`.githooks/` と `.gitignore` は、git が読む場所のためルートに置く。

## License

[MIT](LICENSE)
