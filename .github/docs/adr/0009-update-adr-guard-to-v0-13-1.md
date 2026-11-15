# ADR 0009: adr-guard を v0.13.1 に上げ、ADRのステータスの行を新形式に移す

Status: accepted

## 文脈

[ADR 0001](0001-update-adr-guard-to-v0-10-0.md) は、CI の `adr` ジョブの action を `tett23/adr-guard@v0.10.0` にすると決めた。
`.github/CONTRIBUTING.md` と `.github/docs/specifications.md` も、CI の adr-guard を v0.10.0 と書いている。

その後、adr-guard は v0.13.1 まで進んだ。

- v0.11.0 で、Codex の PreToolUse hook `adr-guard codex-hook` が加わった（tett23/adr-guard の [ADR 0021](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0021-codex-hook.md)）。
- v0.12.0 で、ステータスの行の新形式と、状態遷移の検査が加わった（tett23/adr-guard の [ADR 0022](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0022-status-transitions.md)）。新形式は `Status: <トークン>` で、トークンは `proposed`、`accepted`、`accepted-pending`、`rejected`、`discarded`、`deprecated`、または `superseded [<変更の JSON 配列>]` である。変更は `{"part":<部分名か null>,"by":[<修正先>]}` で、修正先はリポジトリのルートからのパスである。追加したADRと、ステータスの行を書きかえたADRには新形式が要る。新しいADRは最初に `Status: proposed` でコミットする。pre-commit と check-range は、最初のコミットを含めて状態遷移を検査し、その違反は書きかえの許可のオプション（`--allow-status` など）やトレーラーでは免除されない。旧形式の行はそのまま読める。旧形式を新形式に書きかえる移行スクリプト `scripts/migrate-adr-status` は adr-guard のソースにあり、リリースのアーカイブには入らない。
- v0.12.0 で、修正の関係をたどる `adr-guard trace` が加わった（tett23/adr-guard の [ADR 0023](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0023-trace-amendments.md)）。
- v0.13.0 で、移行スクリプトに `--dry-run` が加わり、移行できないADRを全件数えるようになった（tett23/adr-guard の [ADR 0024](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0024-migration-dry-run-and-error-count.md)）。
- v0.13.0 で、`superseded-pending`、変更の `kind` と `note`、`https://` の URL の修正先、`trace --list` の 6 列が加わった（tett23/adr-guard の [ADR 0025](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0025-extend-canonical-status-amendments.md)）。URL の修正先で、別のリポジトリのADRを修正先に書ける。
- v0.13.0 で、旧形式の参照を読む範囲が広がった（tett23/adr-guard の [ADR 0026](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0026-read-more-legacy-references.md)、[ADR 0027](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0027-read-legacy-replaced-status.md)）。
- v0.13.1 で、移行スクリプトが旧形式の行から作る部分名が直った。部分名から修飾子（リンクのテキストの `ADR NNNN` の前の語）、先頭の `。`、末尾の `→` を除く。部分名を決められない行は「部分名を決められません」と報告し、書かない（tett23/adr-guard の [ADR 0028](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0028-fix-legacy-part-names.md)）。

手元の adr-guard は 0.13.1 になっており、CI の action だけが v0.10.0 のままでは、手元と CI で検査の規則が食い違う。
状態遷移の検査は v0.12.0 で加わったので、v0.10.0 の action は状態遷移を検査せず、手元の検査を通さずに作ったコミット（`--no-verify` など）を CI が見逃す。

このリポジトリのADRのステータスの行は、すべて旧形式（`ステータス: 採択` など）である。
旧形式の行はそのまま読めるが、書きかえるときには新形式が要る。
書きかえるたびに 1 行ずつ移すと、旧形式と新形式がいつまでも混ざるので、版を上げるときにまとめて移す。

このリポジトリのADRのうち 3 つ（[ADR 0002](0002-product-pages-on-github-pages.md)、[ADR 0005](0005-golem-page.md)、[ADR 0006](0006-golem-preview-at-300-dpi.md)）は、tett23/tett23.github.io のADRを修正先に持つ。
旧形式では、これらの修正先を `[tett23.github.io ADR 0001](https://github.com/...)` のような外部リンクで書いている。

## 調査した事項

この節のコマンドは、このリポジトリの worktree（ブランチ `adr-guard-v0.13.0`、origin/main から作成）か、その一時的な clone で実行した。

### 版と action

- `adr-guard -V` は `adr-guard 0.13.1` を出力した。
- `.github/workflows/ci.yml` の 23 行めは `uses: tett23/adr-guard@v0.10.0` である。版の指定はタグで、`version` の入力は付けていない。
- tett23/adr-guard のリポジトリで `git diff v0.10.0 v0.13.1 --stat -- action.yml` は何も出力しなかった。action の入力（`base`、`head`、`version`、`allow-status`、`allow-links`、`links`、`check-status`、`check-numbers`、`allow-renumber`）は v0.10.0 と v0.13.1 で同じである。
- `rg -n 'v0\.8\.3|v0\.10\.0|adr-guard@' --hidden` で見つかった adr-guard の版の記述は、次のとおりである。
  - `.github/workflows/ci.yml` の 23 行め（`tett23/adr-guard@v0.10.0`）
  - `.github/CONTRIBUTING.md` の 9 行め（`adr-guard v0.10.0 のaction`）
  - `.github/docs/specifications.md` の 16 行め（`adr-guard v0.10.0 のaction`）
  - [ADR 0001](0001-update-adr-guard-to-v0-10-0.md) の本文（`v0.8.3`、`tett23/adr-guard@v0.8.3`、`v0.10.0`）。コミット済みのADRの本文なので変えない
- ルートの `README.md` は adr-guard に触れていない。
- `.githooks/pre-commit` は `exec adr-guard pre-commit --allow-status --allow-links` である。

### 移行スクリプトの --dry-run

tett23/adr-guard の v0.13.1 のコミット（`ab55769`）を checkout した worktree でビルドした `migrate_adr_status` の example を、この worktree のルートで `--dry-run` で実行した。
`scripts/migrate-adr-status` は、この example を `cargo run --example migrate_adr_status` で動かすシェルスクリプトである。
終了コードは 0 で、標準エラーの最後の行は `移行できる: 8件、移行済み: 1件、移行できない: 0件` だった。
移行済みの 1 件は、`Status: proposed` で書いたこの ADR である。
この ADR を含まない一時的な clone では、`移行できる: 8件、移行済み: 0件、移行できない: 0件` だった。
`git status --porcelain` は何も出力せず、ファイルは変わらなかった。
`.github/docs/adr/` のADRも、移行の対象になった。

差分のステータスの行は次のとおりである。
`superseded` の行は、変更を「部分名 → 修正先」で示す。
修正先の `T` は `https://github.com/tett23/tett23.github.io/blob/main/docs/adr/` の略である。

| ADR | トークン | 変更 |
|---|---|---|
| [ADR 0001](0001-update-adr-guard-to-v0-10-0.md) | `accepted` | |
| [ADR 0002](0002-product-pages-on-github-pages.md) | `superseded` | `公開先、URL、ソースの置き場所` → `.github/docs/adr/0008-move-product-pages-to-user-site.md`、`Golem のページの言語` → `T0001-golem-page-in-japanese-and-english.md` |
| [ADR 0003](0003-nablaskk-page.md) | `superseded` | `「試す」の wasm のテストと、候補と注釈の表示` → `.github/docs/adr/0007-nablaskk-page-test-design-fixes.md` |
| [ADR 0004](0004-peg-hs-page.md) | `accepted` | |
| [ADR 0005](0005-golem-page.md) | `superseded` | `ラスタライズの解像度とラスタライズするページ` → `.github/docs/adr/0006-golem-preview-at-300-dpi.md`、`言語、色、節の構成` → `T0001-golem-page-in-japanese-and-english.md`、`取り込む版、入力のファイル、見開きの組み方` → `T0003-golem-page-with-golem-wasm-v0-1-0-rc4.md` |
| [ADR 0006](0006-golem-preview-at-300-dpi.md) | `superseded` | `見開きの組み方（最初の見開きは 1 ページめだけ）` → `T0003-golem-page-with-golem-wasm-v0-1-0-rc4.md` |
| [ADR 0007](0007-nablaskk-page-test-design-fixes.md) | `accepted` | |
| [ADR 0008](0008-move-product-pages-to-user-site.md) | `accepted` | |

別のリポジトリのADRへの外部リンクは、URL の修正先に移った。
部分名は、どの変更も旧形式の行の `は` の前の文字列のとおりで、補足や注記はない。
旧形式の行では、`tett23.github.io` はリンクのテキストの中の修飾子である。

v0.13.0 のスクリプト（`0096636` でビルドしたもの）の `--dry-run` では、URL の修正先を持つ 4 つの変更の部分名が、末尾に ` は tett23.github.io` を含んでいた（たとえば `Golem のページの言語は tett23.github.io`）。
v0.13.1 の出力との差分は、この 4 つの部分名だけだった。
この誤りは tett23/adr-guard の [ADR 0028](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0028-fix-legacy-part-names.md) で直り、v0.13.1 で出た。

### 一時的な clone での試し

worktree を `$TMPDIR` に clone し、次を確かめた。

1. v0.13.1 のスクリプトで `--write` の後、`git add -A` してから `adr-guard pre-commit --allow-status --allow-links` を実行すると、終了コード 0 で終わった。`adr-guard check-status` と `adr-guard links` も終了コード 0 で終わった。
2. 1 の移行をコミットすると、`adr-guard check-range HEAD~1 HEAD --allow-status --allow-links` は終了コード 0 で終わった。その後の `--dry-run` は `移行できる: 0件、移行済み: 8件、移行できない: 0件` だった。`adr-guard trace --list .github/docs/adr/0005-golem-page.md` は、URL の修正先への辺を、部分名 `言語、色、節の構成` と `取り込む版、入力のファイル、見開きの組み方` で出力した。
3. v0.13.0 のスクリプトで移行したときは、移行をコミットした後に 4 つの部分名から ` は tett23.github.io` を手で除いた。その変更も、当時の手元の adr-guard 0.13.0 で `adr-guard pre-commit --allow-status --allow-links` と `adr-guard check-range` が終了コード 0 で終わった（`superseded` から `superseded` への変更）。v0.13.1 では、この手直しは要らない。
4. 移行をコミットした状態で `adr-guard links --fix --include-committed` を実行すると、終了コード 0 で終わり、ファイルは変わらなかった。

新しいADRを追加するときと、`accepted` のADRを `superseded` にするときの pre-commit の振る舞いは、SKK-JISYO.emoji-ja の worktree の一時的な clone で確かめた。

- 新しいADRを `Status: accepted` で足すと、pre-commit は `許可されていない状態遷移: Absent -> accepted` で終了コード 1 になった。`ステータス: 提案` で足すと ``新形式のステータス行は `Status: ` で始めてください`` で終了コード 1 になった。`Status: proposed` で足すと終了コード 0 で終わった。
- その `Status: proposed` のADRをコミットした後、そのADRを `Status: accepted-pending` にし、`Status: accepted` のADRを、そのADRを修正先とする `superseded` にすると、pre-commit は終了コード 0 で終わった。

### いまの worktree の検査

ADRを足す前の worktree で、`adr-guard links`、`adr-guard check-status`、`adr-guard check-numbers` は終了コード 0 で終わった。

## 実装すること

- CI の `adr` ジョブの action を `tett23/adr-guard@v0.13.1` にする。タグで指定する形を保ち、ほかの入力（`base`、`head`、`allow-status`、`allow-links`）は変えない。
- ステータスの行を新形式に移す。リポジトリのルートで、tett23/adr-guard v0.13.1 のソースの `scripts/migrate-adr-status --dry-run` を実行し、結果が「調査した事項」の表と同じ 8 件で、移行済みがこの ADR の 1 件で、移行できないADRが 0 件であることを確かめてから、`--write` で書く。移行は、ほかの変更と分けて 1 つのコミットにする。
- 移行の後、[ADR 0001](0001-update-adr-guard-to-v0-10-0.md) のステータスを `Status: superseded [{"part":"adr-guard の版","by":[".github/docs/adr/0009-update-adr-guard-to-v0-13-1.md"]}]` にする。
- `.github/CONTRIBUTING.md` の CI の adr-guard の版を v0.13.1 にし、この ADR へのリンクを足す。新しいADRは `Status: proposed` で最初にコミットし、次のコミットで `accepted` か `accepted-pending` にすることを書く。
- `.github/docs/specifications.md` の「ADRの検査」を次のように直す。
  - CI の `adr` ジョブの adr-guard の版を v0.13.1 にし、この ADR へのリンクを足す。
  - ステータスの行は新形式で書くことを書く。レビューの後に `Status: proposed` でコミットし、次のコミットで `accepted` か `accepted-pending` にすること、修正を受けたADRは `superseded [...]` に部分名と修正先を書き、別のリポジトリのADRは `https://` の URL で書くこと、pre-commit と CI が状態遷移を検査し、`--allow-status` では免除されないことを書く。
- この ADR のステータスは、実装のプルリクエストで `accepted` にする。
- `adr-guard links --fix --include-committed` を実行し、`adr-guard links`、`adr-guard check-status`、`adr-guard check-numbers` が終了コード0で終わる状態にする。

## 実装しないこと

- ルートの `README.md` は GitHub のプロフィールに表示されるため、変えない。
- `.githooks/pre-commit` のコマンドは変えない（`adr-guard pre-commit --allow-status --allow-links` のまま）。Claude Code の hook は全体の設定にあり、このリポジトリには置かない。
- Codex の hook（v0.11.0 の `adr-guard codex-hook`）は足さない。
- action の `version` 入力で版を別に指定することはしない。action のタグの版をそのまま使う。
- [ADR 0001](0001-update-adr-guard-to-v0-10-0.md) の本文の `v0.8.3` と `v0.10.0` は、コミット済みのADRの本文なので変えない。
- 移行した行の部分名を書きかえない。`kind` と `note` も足さない。旧形式の行に補足や注記はない。
- tett23/tett23.github.io のADRは、このADRでは変えない。そのリポジトリのステータスの行の移行は、そのリポジトリのADRで決める。
- 移行スクリプトをこのリポジトリに入れない。移行は一度だけ行う。

## 不変条件

なし。
CI の設定の値と、ステータスの行を移す手順だけを決めるADRで、入力によって変わる振る舞いを持たない。

## テスト設計

自動テストは無い。
次の手順で確かめる。

- 移行の前に `scripts/migrate-adr-status --dry-run` が、終了コード0と `移行できる: 8件、移行済み: 1件、移行できない: 0件` で終わること。
- `--write` の後、もう一度 `--dry-run` を実行すると、`移行できる: 0件` で終わること。
- `rg -n '^ステータス:' .github/docs/adr` が何も出力しないこと。
- `rg -n 'は tett23.github.io"' .github/docs/adr` が何も出力しないこと。
- `adr-guard trace --list .github/docs/adr/0005-golem-page.md` が、URL の修正先への辺を、`言語、色、節の構成` と `取り込む版、入力のファイル、見開きの組み方` の部分名で出力すること。
- `ruby -ryaml -e 'YAML.load_file(ARGV[0])' .github/workflows/ci.yml` で、CI の YAML が読めること。
- 手元の adr-guard 0.13.1 で、`adr-guard links`、`adr-guard check-status`、`adr-guard check-numbers` が終了コード0で終わること。
- 各コミットで `.githooks/pre-commit` が通り、コミット後、`adr-guard check-range origin/main HEAD --allow-status --allow-links` が終了コード0で終わること。
- プルリクエストの CI の `adr` ジョブが v0.13.1 の action で通ること。

## トレードオフ

- 新形式の `superseded` の行は JSON を含むので、旧形式より人が読みにくい。修正の関係は `adr-guard trace` で読めるので、機械で検査できるほうを選ぶ。
- すべてのADRのステータスの行をまとめて書きかえるので、1 つのコミットが全ADRに触れる。変わるのはステータスの行だけで、移行を 1 つのコミットに分けるので、レビューでは `--dry-run` の差分と照らせる。
- v0.13.0 ではなく v0.13.1 に上げる。v0.13.0 の移行スクリプトは、このリポジトリの 4 つの部分名に修飾子を残すので、手で直す手順が要る。v0.13.1 に上げれば、スクリプトの出力をそのまま書ける。
- 新しいADRごとに、`proposed` のコミットと `accepted` のコミットの 2 つが要る。状態遷移を adr-guard が検査できるようになるので、手間は受け入れる。
- URL の修正先は、adr-guard が存在を確かめず、たどらない。tett23/tett23.github.io のADRのファイル名が変わっても検査では気づかない。いまの外部リンクも同じなので、受け入れる。

## 参考文献

- [adr-guard v0.11.0](https://github.com/tett23/adr-guard/releases/tag/v0.11.0)
- [adr-guard v0.12.0](https://github.com/tett23/adr-guard/releases/tag/v0.12.0)
- [adr-guard v0.13.0](https://github.com/tett23/adr-guard/releases/tag/v0.13.0)
- [adr-guard v0.13.1](https://github.com/tett23/adr-guard/releases/tag/v0.13.1)
- [adr-guard README（v0.13.1）](https://github.com/tett23/adr-guard/blob/v0.13.1/README.md)
- [tett23/adr-guard の ADR 0021「Codex の PreToolUse hook で、コミット済みのADRと記録の編集を拒否する」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0021-codex-hook.md)
- [tett23/adr-guard の ADR 0022「状態と遷移を別々の代数的データ型で表す」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0022-status-transitions.md)
- [tett23/adr-guard の ADR 0023「trace で元の決定から修正ADRをたどる」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0023-trace-amendments.md)
- [tett23/adr-guard の ADR 0024「移行スクリプトに --dry-run を設け、失敗を最後まで数える」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0024-migration-dry-run-and-error-count.md)
- [tett23/adr-guard の ADR 0025「新形式のステータス行に、実装待ちの修正、補足、注記、別のリポジトリの修正先を加える」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0025-extend-canonical-status-amendments.md)
- [tett23/adr-guard の ADR 0026「旧形式のステータス行の修正先を、リンク先と裸の番号からも読む」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0026-read-more-legacy-references.md)
- [tett23/adr-guard の ADR 0027「旧形式の `置換（…）` を、修正を受けた状態として読む」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0027-read-legacy-replaced-status.md)
- [tett23/adr-guard の ADR 0028「旧形式の部分名から修飾子と区切りの記号を除き、決められない部分名を移行しない」](https://github.com/tett23/adr-guard/blob/v0.13.1/docs/adr/0028-fix-legacy-part-names.md)
