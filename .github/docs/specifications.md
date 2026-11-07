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

[ADR 0002](adr/0002-product-pages-on-github-pages.md) の基盤で、プロダクトのページをこのリポジトリの GitHub Pages に公開する。

- 公開先は `https://tett23.github.io/tett23/` で、目次のページを置く。各ページは `nablaskk/`、`peg-hs/`、`golem/` の下に置く。
- ソースは `.github/site/` に置く。フレームワークと npm の依存は使わず、HTML と CSS は手で書き、スクリプトは TypeScript（クラスを使わない）で書く。
- Deno の設定は `.github/deno.json` にある。`deno task check`、`deno lint`、`deno fmt --check`、`deno task test` で検査する。
- `.github/site/wasm.lock` に、取り込む wasm とデータのファイルを 1 行に 1 つ、`名前 URL SHA-256` で書く。`.github/scripts/fetch-assets.sh` が取ってきて SHA-256 を確かめ、合わなければ失敗してファイルを残さない。取ってきたファイル（`_assets/`）はコミットしない。
- `.github/scripts/build-site.sh` が `_site/` を組み立てる。各ページの `main.ts` と `worker.ts` を `deno bundle` で 1 つの JS にし、`wasm.lock` のファイルを `_site/assets/` に置く。
- `.github/scripts/check-site.ts` が、組み立てた `_site/` の同じサイトの参照先がすべてあることと、外部のオリジンからスクリプト、スタイルシート、フォントを読み込んでいないことを確かめる。
- GHC の wasm のために、WASI preview1 のうち引数、環境変数、時計、乱数、標準出力と標準エラーへの書き込み、`proc_exit` だけを `.github/site/lib/wasi.ts` に実装する。ほかの関数は `ENOSYS` を返す。`wasm.lock` の wasm の import がこの範囲に収まることをテストで確かめる。
- CI の `site` ジョブが、取り込み、検査、テスト、組み立て、組み立てたサイトの検査を行う。main への push では、`deploy` ジョブが `_site/` を GitHub Pages にデプロイする。

### peg-hs のページ

`https://tett23.github.io/tett23/peg-hs/` に、peg-hs のページを英語で置く（[ADR 0004](adr/0004-peg-hs-page.md)）。

- 節は、ヒーロー（左再帰）、3 つの柱、電卓の文法の 2 つの書き方、考え方と先行ソフトウェアとの比較、適合性、プレイグラウンド、インストールの順に並ぶ。
- プレイグラウンドは、peg-hs のリリースの `peg-hs.wasm` を Web Worker で動かす。文法を書きかえてから 300 ミリ秒たったら `analyze` を呼び、文法の AST（たためる木）、生成したモジュール、生成した型をタブで切りかえて表示する。位置を持たない AST のノードは、近い祖先の位置を使う。
- 診断は行と列つきで並べ、押すと文法の欄のその位置に移る。peg-hs の列はコードポイントで数えるので、UTF-16 の位置に直す。
- サンプルは、`JsonGenerated.hpeg`（既定）、`Json.hpeg`、README の電卓の文法で、`peg-hs.wasm` と同じタグからコピーし、`.github/site/peg-hs/samples/README.md` に出どころを書く。
- *Format* は `format` の結果で文法の欄を置きかえる。*Copy share link* は、文法を deflate で縮めて base64url にし、URL のフラグメント `#g=` に入れたリンクをコピーする。壊れたフラグメントのときは、既定のサンプルを表示し、壊れていたことを伝える。
- 入力のテキストは解析しない。

## 破棄したADR

なし
