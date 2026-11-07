# ADR 0001: adr-guard を v0.10.0 に上げる

ステータス: 採択

## 文脈

リポジトリの初期化のコミットで、コミット済みのADRの変更を拒否するために [adr-guard](https://github.com/tett23/adr-guard) v0.8.3 を入れた。
pre-commit hook（`.githooks/pre-commit`）は手元の adr-guard を呼び、CI の `adr` ジョブは action `tett23/adr-guard@v0.8.3` を使う。

その後、adr-guard は v0.10.0 まで進んだ。

- v0.9.0 で、同じディレクトリで番号が重複したADRを報告する `adr-guard check-numbers` と、重複を直す `adr-guard renumber` が加わった。action は既定で `check-numbers` を実行し、重複があればCIが失敗する（tett23/adr-guard の [ADR 0018](https://github.com/tett23/adr-guard/blob/main/docs/adr/0018-repair-duplicate-adr-numbers.md)）。
- v0.9.1 で、`renumber` の誤報が直った。
- v0.10.0 で、`ADR NNNN` の直前の語を修飾子として読むようになった。`/` を含む語はディレクトリ、`-` を含む語はモジュール、それ以外の語はそのモジュールが存在するときだけ修飾子になる。対象の無い修飾子付きの参照、リンク先が修飾子と異なるリンク、リンクの外に出た修飾子を、`links` と pre-commit が報告する（tett23/adr-guard の [ADR 0019](https://github.com/tett23/adr-guard/blob/main/docs/adr/0019-module-qualified-adr-references.md)）。シンボリックリンクの `.md` は検査しない（tett23/adr-guard の [ADR 0020](https://github.com/tett23/adr-guard/blob/main/docs/adr/0020-skip-symlinked-documents.md)）。

手元の adr-guard は v0.10.0 になっており、CI の action だけが v0.8.3 のままでは、手元と CI で検査が食い違う。

## 実装すること

- CI の `adr` ジョブの action を `tett23/adr-guard@v0.10.0` にする。ほかの入力（`base`、`head`、`allow-status`、`allow-links`）は変えない。`check-numbers` は既定のまま有効にする。
- `.githooks/pre-commit` のコマンドは変えない。
- `.github/CONTRIBUTING.md` に、CI が adr-guard v0.10.0 でADRの変更、ADRの参照のリンク、ADRの番号の重複を検査することを書く。
- `adr-guard links --fix --include-committed` を実行し、`adr-guard links`、`adr-guard check-status`、`adr-guard check-numbers` が終了コード0で終わる状態にする。

## 実装しないこと

- ルートの `README.md` は GitHub のプロフィールに表示されるため、変えない。
- action の `version` 入力で版を別に指定することはしない。action のタグの版をそのまま使う。
- `check-numbers: false` や `allow-renumber: true` は付けない。番号の重複が起きたときは、その時点で ADR を作って直す。

## テスト設計

自動テストは無い。次の手順で確かめる。

- `ruby -ryaml -e 'YAML.load_file(ARGV[0])' .github/workflows/ci.yml` で、CI の YAML が読めること。
- 手元の adr-guard v0.10.0 で、`adr-guard links`、`adr-guard check-status`、`adr-guard check-numbers` が終了コード0で終わること。
- コミット後、`adr-guard check-range origin/main HEAD --allow-status --allow-links` が終了コード0で終わること。
- プルリクエストの CI の `adr` ジョブが通ること。

## トレードオフ

- `check-numbers` が既定で有効になるため、別々のブランチで同じ番号のADRを作ってマージすると CI が失敗する。番号の重複を CI で見つけられる利点のほうが大きいので、止めない。
- 修飾子付きの参照の検査が加わるため、ほかのリポジトリのADRを `tett23/adr-guard ADR 0019` のように書くと違反になる。ほかのリポジトリのADRは、リンクのテキストごと外部リンクにする。

## 参考文献

- [adr-guard v0.9.0](https://github.com/tett23/adr-guard/releases/tag/v0.9.0)
- [adr-guard v0.9.1](https://github.com/tett23/adr-guard/releases/tag/v0.9.1)
- [adr-guard v0.10.0](https://github.com/tett23/adr-guard/releases/tag/v0.10.0)
- [adr-guard README](https://github.com/tett23/adr-guard/blob/main/README.md)
