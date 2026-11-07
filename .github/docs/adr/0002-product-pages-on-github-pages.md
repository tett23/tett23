# ADR 0002: プロダクトのページを GitHub Pages で公開する基盤

ステータス: 採択→公開先、URL、ソースの置き場所は [ADR 0008](0008-move-product-pages-to-user-site.md)

## 文脈

[ロードマップ](../roadmap.md) に、NablaSKK の紹介ページと、peg-hs と Golem のインタラクティブデモのページがある。
3 つのページは別々の ADR（[ADR 0003](0003-nablaskk-page.md)、[ADR 0004](0004-peg-hs-page.md)、[ADR 0005](0005-golem-page.md)）で中身を決める。
この ADR では、3 つに共通する公開先、ソースの置き場所、ビルド、wasm の取り込み方、見た目の方針を決める。

調べてわかったことは次のとおり。

- このリポジトリには GitHub Pages がまだない。`tett23.github.io` のリポジトリもない。
- tett23.org は sqlite-cms で Cloudflare Workers に置いている日記などのサイトで、wasm を置く仕組みはない。
- 3 つのページはどれも、ブラウザの中でプロダクトの wasm を動かす。
  - NablaSKK（Rust）は `nablaskk-core` に依存がない。辞書とルールを文字列から読める。
  - peg-hs（Haskell）は `peg-grammar` と `peg-codegen` が GHC のブートパッケージだけに依存し、純粋な関数で文法から AST と Haskell を作れる。
  - Golem（Haskell）は FreeType、HarfBuzz、wasmtime に依存しており、wasm にするには Golem 側の変更が要る。
  - shem（Rust）は依存がなく、`std::fs` を使うのは CLI だけである。
- [仕様](../specifications.md) では、プロフィールに見せる必要のないファイルを `.github/` の下に置く。

## 実装すること

### 公開先と URL

- このリポジトリの GitHub Pages で公開する。GitHub Actions でビルドしてデプロイする。
- URL は次のとおりにする。
  - `https://tett23.github.io/tett23/`：3 つのページへのリンクだけを置く目次。
  - `https://tett23.github.io/tett23/nablaskk/`：NablaSKK（日本語）。
  - `https://tett23.github.io/tett23/peg-hs/`：peg-hs（英語）。
  - `https://tett23.github.io/tett23/golem/`：Golem（英語）。
- ルートの `README.md`（プロフィール）から 3 つのページへリンクする。

### ソースの置き場所

[仕様](../specifications.md) の置き場所の決まりに合わせて、ページのソースは `.github/site/` の下に置く。

```
.github/site/
  index.html            目次
  base.css              3 ページで共通の最小限の規則（リセット、フォーカス表示、visually-hidden）
  lib/                  共通の TypeScript（WASI、wasm との受け渡し、Worker の呼び出し）
  nablaskk/             ADR 0003
  peg-hs/               ADR 0004
  golem/                ADR 0005
  wasm.lock             取り込む wasm とフォントの URL と SHA-256
.github/scripts/
  fetch-assets.sh       wasm.lock のファイルを取ってきて検証する
  build-site.sh         _site/ にページを組み立てる
```

`_site/` はビルドの出力で、`.gitignore` に入れる。

### ビルド

- フレームワークは使わない。HTML と CSS は手で書く。
- スクリプトは TypeScript で書き、クラスは使わない。Deno の `deno check`、`deno lint`、`deno fmt --check`、`deno test` で検査し、`deno bundle` でページごとに 1 つの JS にまとめる。
- npm の依存は入れない。必要なものは再実装する。
- 外部の CDN、Web フォントのサービス、アクセス解析は使わない。読み込むのは同じオリジンのファイルだけにする。

### wasm とフォントの取り込み

- wasm は各プロダクトのリポジトリの CI でビルドし、そのリリースに添付する。このリポジトリでは wasm をビルドしない。
- `wasm.lock` に、1 行に 1 つ、`名前 URL SHA-256` を書く。プロダクトの版を上げるときは、この行を書きかえる。
- `fetch-assets.sh` は `wasm.lock` のファイルを取ってきて、SHA-256 が合わなければ失敗する。macOS と Ubuntu の両方で動くよう、`shasum -a 256` を使う。
- 取ってきた wasm とフォントはコミットしない。

### wasm との受け渡し

- Rust のもの（NablaSKK、shem）は `wasm32-unknown-unknown` でビルドし、`extern "C"` の関数で、線形メモリ上のポインタと長さを受け渡す。wasm-bindgen は使わない。
- GHC のもの（peg-hs、Golem）は GHC の wasm バックエンドでビルドした reactor モジュールとし、エクスポートした関数で受け渡す。
- GHC の wasm の RTS が必要とする WASI preview1 の関数を、`lib/wasi.ts` に最小限だけ実装する。
  - 実装するのは、引数、環境変数、時計、乱数、標準出力と標準エラーへの書き込み、`proc_exit` に限る。
  - ファイルシステムは実装しない。入力はすべて関数の引数で渡す。
  - 実装しない関数は `ENOSYS` を返す。
  - どの関数が要るかは、`WebAssembly.Module.imports` で各 wasm の import を列挙して決め、テストで固定する。
- 時間のかかる処理（peg-hs の生成、Golem の組版、shem のラスタライズ）は Web Worker で動かし、画面を止めない。

### 見た目の方針

量産されたテンプレートの見た目にしないため、次を守る。

- 構成と言葉は、それぞれのプロダクトの事実から組み立てる。誰にでも当てはまる宣伝文句（「シームレス」「パワフル」「次世代の」など）を使わない。
- 紫や青のグラデーションの背景、絵文字や汎用のアイコンを並べた機能紹介、影と角丸のカードを 3 つ並べる構成、ぼかしたガラス風の面を使わない。
- 文字組みで見せる。見出しと本文の大きさの差をはっきり付け、本文の 1 行を 40 字（日本語）または 70 字（英語）程度までにする。
- 色は各プロダクトから取る（NablaSKK はアイコンの紺と金）。1 ページで使う色は、地、文字、強調の 3 つを中心にする。
- 書体は OS の書体を使う。Golem のデモで組版に使うフォントだけは、デモのために読み込む。
- 動きは最小限にし、`prefers-reduced-motion` のときは止める。

### アクセシビリティ

- 文字と背景のコントラスト比を 4.5:1 以上にする。
- すべての操作をキーボードでできるようにし、フォーカスを見えるようにする。
- 各ページの `lang` を正しく付ける（NablaSKK は `ja`、ほかは `en`。英語のページに出る日本語には `lang="ja"` を付ける）。

### CI

- `site` ジョブ：`fetch-assets.sh`、Deno の検査とテスト、`build-site.sh`、組み立てた `_site/` の内部リンクの検査を行う。プルリクエストと main への push で動かす。
- `deploy` ジョブ：main への push のときだけ、`_site/` を GitHub Pages にデプロイする。
- アクションは Node 24 以降で動く最新のメジャー版を、コミットのハッシュで固定して使う。

## 実装しないこと

- tett23.org（sqlite-cms）への統合。
- 独自ドメイン。
- ページの多言語化。各ページは 1 つの言語だけで書く。
- このリポジトリでの wasm のビルド。
- WASI のファイルシステム。
- アクセス解析と Cookie。

## テスト設計

先に書いて失敗させてから実装する。

- `lib/wasi.ts`
  - `fd_write` で標準出力と標準エラーに書いたバイト列を、それぞれ取り出せる。複数の iovec にまたがる書き込みと、UTF-8 の文字が iovec の境目で切れる場合を含める。
  - `args_get` と `args_sizes_get`、`environ_get` と `environ_sizes_get` が、与えた値を NUL 終端で並べる。
  - `clock_time_get` と `random_get` が、与えた時計と乱数源を使う（テストでは固定の値を与える）。
  - `proc_exit` が終了コードつきの例外を投げる。
  - 実装しない関数が `ENOSYS` を返す。
  - 各プロダクトの wasm の import が、実装した関数の集合に含まれる（`wasm.lock` で取ってきた wasm で検査する）。
- `lib/` の受け渡し
  - 文字列とバイト列を wasm のメモリに書き、ポインタと長さで読み戻すと元に戻る。空、非 ASCII、大きい入力（数 MB）を含める。
- `fetch-assets.sh`
  - SHA-256 が合わないファイルで失敗し、ファイルを残さない。
  - 合うファイルで成功する。
- ビルドした `_site/`
  - `href` と `src` の同じサイト内の参照先がすべて存在する。
  - 外部オリジンの `<script>`、`<link rel="stylesheet">`、フォントの読み込みがない。
- 自動で確かめられないこと（見た目、キーボード操作、コントラスト）は、実装後に Safari と Chrome の最新版で各ページを開いて確かめ、プルリクエストに書く。

## トレードオフ

- ソースを `.github/site/` に置くのは、プロフィールに見せないファイルを `.github/` にまとめる今の決まりに合わせるためである。ルートの `site/` より見つけにくいが、決まりを一つ増やさずに済む。
- wasm を各プロダクトのリリースから取り込むので、ページを直すたびに GHC の wasm や wasi-sdk の環境を用意しなくて済む。代わりに、プロダクトの版を上げるには、そのリリースを先に出す必要がある。
- WASI を再実装すると保守する量は増えるが、必要なのは十数個の関数で、ファイルシステムを持たないぶん小さい。npm の依存を入れずに済む。
- tett23.org に置かないので、サイトが 2 つに分かれる。sqlite-cms に wasm と Worker を置く仕組みを足すより単純である。

## 参考文献

- GitHub Docs, "Using custom workflows with GitHub Pages". https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GHC User's Guide, "Using the GHC WebAssembly backend". https://ghc.gitlab.haskell.org/ghc/doc/users_guide/wasm.html
- WebAssembly System Interface, preview1. https://github.com/WebAssembly/WASI/blob/main/legacy/preview1/docs.md
- Deno, `deno bundle`. https://docs.deno.com/runtime/reference/cli/bundle/
- W3C, Web Content Accessibility Guidelines (WCAG) 2.2. https://www.w3.org/TR/WCAG22/
