# ADR 0008: プロダクトのページを tett23.github.io のリポジトリに移し、URL から /tett23/ を外す

ステータス: 採択（未実装）

## 文脈

[ADR 0002](0002-product-pages-on-github-pages.md) では、プロダクトのページをこのリポジトリ（tett23/tett23）の GitHub Pages で公開すると決めた。
そのため、URL は次のようになっている。

- `https://tett23.github.io/tett23/`（目次）
- `https://tett23.github.io/tett23/nablaskk/`
- `https://tett23.github.io/tett23/peg-hs/`
- `https://tett23.github.io/tett23/golem/`（[ADR 0005](0005-golem-page.md)、[ADR 0006](0006-golem-preview-at-300-dpi.md) で実装する予定）

作業者は、`/tett23/` のない `https://tett23.github.io/nablaskk/` の形にしたい。

GitHub Pages では、リポジトリのサイト（プロジェクトサイト）は `https://<ユーザー名>.github.io/<リポジトリ名>/` に置かれる。
`https://tett23.github.io/` の直下に置けるのは、`tett23.github.io` という名前のリポジトリのサイト（ユーザーサイト）だけである。
2026-11-08 の時点で、`tett23/tett23.github.io` のリポジトリはない。

やり方は 2 つ考えた。

1. `tett23/tett23.github.io` を作り、ページのソースをそちらに移す。
2. ソースはこのリポジトリに置いたまま、組み立てた `_site/` を CI で `tett23/tett23.github.io` に送る。

作業者は 1 を選んだ。

公開済みの URL（`/tett23/nablaskk/`、`/tett23/peg-hs/`）は、すでに共有されている。
GitHub Pages には、サーバーの側で転送を設定する機能がない。

## 実装すること

### 新しいリポジトリ

`tett23/tett23.github.io` を公開のリポジトリとして作る。
このリポジトリの GitHub Pages のソースは GitHub Actions にする。

URL は次のとおりにする。

- `https://tett23.github.io/`：目次。
- `https://tett23.github.io/nablaskk/`：NablaSKK（[ADR 0003](0003-nablaskk-page.md)、[ADR 0007](0007-nablaskk-page-test-design-fixes.md)）。
- `https://tett23.github.io/peg-hs/`：peg-hs（[ADR 0004](0004-peg-hs-page.md)）。
- `https://tett23.github.io/golem/`：Golem（[ADR 0005](0005-golem-page.md)、[ADR 0006](0006-golem-preview-at-300-dpi.md)）。

### 移すもの

このリポジトリから、次のものを `tett23/tett23.github.io` に移す。
新しいリポジトリにはプロフィールの決まりがないので、`.github/` の下ではなくルートに置く。

| このリポジトリ | 新しいリポジトリ |
| --- | --- |
| `.github/site/` | `site/` |
| `.github/scripts/fetch-assets.sh`、`build-site.sh`、`check-site.ts` とそのテスト | `scripts/` |
| `.github/deno.json` | `deno.json` |
| CI の `site` ジョブと `deploy` ジョブ | `.github/workflows/ci.yml` |

- ファイルはコピーで移し、git の履歴は移さない。移したコミットを、新しいリポジトリの最初のコミットのメッセージに書く。履歴はこのリポジトリに残る。
- `check-site.ts` の、サイトの絶対パスの前置き `/tett23/` を `/` にする。ページの中のリンクはすべて相対パスなので、ほかは変えない。
- `wasm.lock` の中身は変えない。
- [ADR 0005](0005-golem-page.md) と [ADR 0006](0006-golem-preview-at-300-dpi.md)（Golem のページ）は、新しいリポジトリで実装する。

### 新しいリポジトリの ADR と文書

- 新しいリポジトリにも `docs/adr/`、`docs/specifications.md`、README を置く。
- ページについての決定の経緯（[ADR 0002](0002-product-pages-on-github-pages.md) から [ADR 0007](0007-nablaskk-page-test-design-fixes.md) と、この ADR）は、このリポジトリに残す。新しいリポジトリの仕様と README からは、それらの ADR へ絶対リンクで参照する。
- これから先の、ページについての決定は、新しいリポジトリの ADR に書く。
- adr-guard を、作業者の決まりに従って入れる（`.githooks/pre-commit`、README の `git config core.hooksPath .githooks` の手順、CI の `adr` ジョブ）。

### このリポジトリに残すもの：古い URL からの転送

このリポジトリの GitHub Pages は、古い URL を新しい URL へ転送するページだけを配る。

- 転送するのは、公開済みの次の 3 つである。
  - `/tett23/` → `https://tett23.github.io/`
  - `/tett23/nablaskk/` → `https://tett23.github.io/nablaskk/`
  - `/tett23/peg-hs/` → `https://tett23.github.io/peg-hs/`
- Golem のページは公開していないので、転送を置かない。
- 転送のページは、`.github/redirects/` の下に手で書いた HTML とする。各ページは次を持つ。
  - `<meta http-equiv="refresh" content="0; url=...">`
  - `<link rel="canonical" href="...">`
  - スクリプトが動かなくても移れるよう、新しい URL へのリンクと、ページが移ったことを伝える 1 文。
- フラグメント（peg-hs の共有リンクの `#g=`）は、`meta refresh` では引き継がれない。そこで、転送のページに小さなスクリプトを置き、`location.hash` を付けて `location.replace` で移る。スクリプトが動かないときは、`meta refresh` でフラグメントなしの新しい URL に移る。
- CI の `site` ジョブを、転送のページの検査と配置だけにする。`deploy` ジョブは残す。
- ルートの `README.md`（プロフィール）のリンクを新しい URL にする。

### 切りかえの順序

古い URL が切れる時間をなくすため、次の順に進める。

1. 新しいリポジトリを作り、ページを移して、新しい URL で公開されたことを確かめる。
2. このリポジトリで、ページを転送のページに置きかえ、README のリンクを変える。

## 実装しないこと

- 独自ドメイン。
- git の履歴の移行。
- 公開していない URL（`/tett23/golem/`）の転送。
- ページの中身と見た目の変更。

## テスト設計

先に書いて失敗させてから実装する。

新しいリポジトリ：

- このリポジトリでのテスト（WASI、受け渡し、取り込み、各ページ）が、移した後もすべて通る。
- `check-site.ts`
  - `/nablaskk/` のように `/` で始まる同じサイトの参照を、組み立てたサイトの中で解決する。
  - `/tett23/` で始まる参照を、存在しない参照として報告する。
- 公開した後に、`https://tett23.github.io/`、`/nablaskk/`、`/peg-hs/` と、`/assets/` の wasm が 200 を返し、NablaSKK の「試す」と peg-hs のプレイグラウンドがブラウザで動くことを確かめる。

このリポジトリ：

- 転送のページの検査（Deno のテスト）
  - 3 つの転送のページがあり、それぞれの `meta refresh`、`link rel="canonical"`、本文のリンクが、上の表の新しい URL を指す。
  - 転送のページは、外部のオリジンからスクリプト、スタイルシート、フォントを読み込まない。
- 公開した後に、ブラウザで次を確かめる。
  - `https://tett23.github.io/tett23/nablaskk/` を開くと、`https://tett23.github.io/nablaskk/` に移る。
  - `https://tett23.github.io/tett23/peg-hs/#g=...` を開くと、同じフラグメントの付いた `https://tett23.github.io/peg-hs/#g=...` に移り、その文法が読み込まれる。

## トレードオフ

- ページのソースと、ページについての ADR が、別のリポジトリに分かれる。これまでの経緯はこのリポジトリに残り、これからの決定は新しいリポジトリに書く。
- 案 2（ソースを残して送る）なら、ソースと ADR は一か所に残る。しかし、別のリポジトリに書きこむトークンをシークレットとして持ち、その期限と権限を管理する必要がある。案 1 は秘密の値を持たず、GitHub Actions のデプロイがそのまま使えるので、こちらのほうが単純である。
- 転送のページは HTML で行うので、HTTP の 301 のような恒久的な転送にはならない。`link rel="canonical"` で新しい URL を正しいものとして示す。
- このリポジトリに、転送のためだけの GitHub Pages と `deploy` ジョブが残る。古いリンクが使われなくなったら、別の ADR で外せる。

## 参考文献

- [ADR 0002](0002-product-pages-on-github-pages.md)
- GitHub Docs, "What is GitHub Pages?"（ユーザーサイトとプロジェクトサイト）. https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub Docs, "Using custom workflows with GitHub Pages". https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- WHATWG HTML Living Standard, "Refresh" state of the `meta` element. https://html.spec.whatwg.org/multipage/semantics.html#attr-meta-http-equiv-refresh
- adr-guard. https://github.com/tett23/adr-guard
