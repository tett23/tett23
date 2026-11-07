# ADR 0004: peg-hs のページとプレイグラウンド

ステータス: 採択

## 文脈

[peg-hs](https://github.com/tett23/peg-hs) は、PEG で書いた文法（`.hpeg`）から Haskell のパーサーを生成するツールチェインである。
ページは [ADR 0002](0002-product-pages-on-github-pages.md) の基盤の上に、英語で作る。

作業者からの指示は次のとおり。

- [pest](https://pest.rs/) のページを手本にする。
- インタラクティブに試せるようにし、文法の AST と生成したコードを表示する。デフォルトのサンプルは JSON とする。
- 左再帰に対応していることをページの一番上に書く。
- 「速くなくてよいところは Haskell を書かずに自動で生成でき、速さが要るところは自分で書ける」ことを説明する。
- どういう考えで作っているかと、先行するソフトウェアに対する優位性を説明する。

調べてわかったことは次のとおり。

- pest のページは、ヒーロー、3 つの柱（Accessibility、Correctness、Performance）、文法の例、エラー表示の例、計測、エディタの順に並ぶ。エディタには文法と入力の欄があり、整形、共有リンク、幅の切りかえがある。ページのリポジトリ（pest-parser/site）は MIT と Apache-2.0 のデュアルライセンスである。
- peg-hs には文法を直接解釈する仕組みがない。入力のテキストを解析するには、生成したモジュールを GHC でコンパイルする必要がある（peg-hs の ADR 0036）。
- 文法から文法の AST を作る `parseGrammar`、検査、整形、文法から Haskell を作る `generateFromSource :: Options -> Text -> Either [Diagnostic] Text` は、純粋な関数で、GHC のブートパッケージだけに依存する。
- アクションのない JSON の文法 `conformance/bench/JsonGenerated.hpeg` がある。型を推論と生成に任せた書き方（peg-hs の ADR 0075）で、生成された型の宣言も見せられる。
- README は、型を生成する書き方が、型とアクションを書いた書き方の約 0.97 倍の時間、1.18 倍のメモリで動いたことと、速さが要る規則だけに型とアクションを書けることを書いている。

## 実装すること

### 前提となる peg-hs 側の変更

peg-hs のリポジトリに ADR を立てて、次を実装する。このページの実装は、そのリリースが出てから始める。

- `peg-grammar` と `peg-codegen` を GHC の wasm バックエンドでビルドする reactor モジュールを足す。`peg-cli` は含めない。
- 次の関数をエクスポートする。入力と出力は UTF-8 の JSON とする。
  - `analyze`：文法のテキストを受け取り、文法の AST、生成した Haskell のモジュール、生成した型の宣言、診断（行、列、メッセージ）を返す。
  - `format`：文法のテキストを `peg-hs fmt` と同じ規則で整形して返す。
- 文法の AST を JSON にする形を、その ADR で決める。
- その wasm を、リリースに添付する。

### ページの構成

pest のページの構成にならう。文章、CSS、スクリプトは写さず、自分で書く。

1. **ヒーロー**：「peg-hs」と、1 行の説明（Haskell parsers from PEG grammars）。その下に一番大きく「Left recursion, as written.」と書き、`Expr <- Expr '+' Term / Term` がそのまま通ることを、短い文法と、それから生成した型で見せる。プレイグラウンドへのリンクと、インストールへのリンクを置く。
2. **3 つの柱**：カードにせず、見出しと 2〜3 文の段落を横に並べる（狭い画面では縦に並べる）。
   - *Left recursion as written*：直接と間接の左再帰を受け付ける。意味は bounded left recursion（Medeiros et al. 2014）である。
   - *Generate where speed doesn't matter, write where it does*：型注釈とアクションのない規則は型を生成するので、Haskell を書かなくてよい。速さが要る規則にだけ型とアクションを書ける。README の計測（0.97 倍、1.18 倍）を添える。
   - *Errors at the grammar*：アクションの型エラーを GHC が `.hpeg` の行と列で報告する。
3. **例**：電卓の文法を、型を生成する書き方と、型とアクションを書いた書き方で並べ、同じ入力の結果を示す（README の「A first grammar」と同じ内容）。
4. **考え方と先行ソフトウェアとの比較**：次を書く。
   - 生成したモジュールは peg-runtime だけに依存し、同じ文法から同じバイト列ができるので、コミットできる。happy や alex と同じく単独の生成器で、Template Haskell を使わない。
   - パーサーコンビネーター（Parsec、Megaparsec）と違い、左再帰を書きかえなくてよく、文法が実装から分かれる。
   - pest と違い、文法の規則ごとに Haskell の型と値を返す。
   - 空白とコメントを残す構文木（`%syntax`）と、エラーからの回復（`%recover`）で、フォーマッターや言語サーバーにも使える。
   - 比較の記述は、peg-hs のドキュメントと、相手のドキュメントで確かめられることだけにする。速さの比較は、計測していないので書かない。
5. **適合性**：JSONTestSuite、CommonMark 0.31.2 の 652 例、Lua 5.5、TOML 1.1.0 の結果を、数字で並べる。
6. **プレイグラウンド**（後述）。
7. **インストールとリンク**：リリース、ソースからのビルド、ドキュメント、リポジトリ。

### プレイグラウンド

- 左に文法の欄、右に出力の欄を置く。広い画面では横に、狭い画面では縦に並べる。
- 出力の欄はタブで、次の 3 つを切りかえる。
  - *Grammar AST*：文法の AST を、たためる木で表示する。
  - *Generated module*：生成した Haskell のモジュール。
  - *Generated types*：生成した型の宣言だけ。型注釈とアクションのない規則から、どんな型ができたかを見せる。
- 診断は出力の欄の上に、行と列つきで表示し、クリックすると文法の欄のその位置に移る。
- 文法を書きかえてから 300 ミリ秒たったら、Worker で `analyze` を呼んで出力を更新する。
- サンプルを選ぶメニューを置く。
  - *JSON (generated types)*（既定）：`JsonGenerated.hpeg`。日本語のコメントは英語に書きかえる。
  - *JSON (typed)*：`conformance/json/Json.hpeg`。
  - *Calculator*：README の電卓の文法（左再帰を含む）。
  - サンプルは peg-hs の、取り込む wasm と同じタグからコピーし、出どころ（タグとパス）を `.github/site/peg-hs/samples/README.md` に書く。peg-hs は MIT である。
- *Format* のボタンで `format` を呼び、文法の欄を整形した結果で置きかえる。
- *Copy share link* のボタンで、文法を deflate で縮めて base64url にし、URL のフラグメント（`#g=`）に入れたリンクをコピーする。フラグメントはサーバーに送られない。ページを開いたときにフラグメントがあれば、その文法を読み込む。
- 入力のテキストは解析しないことと、解析するには `peg-hs parse` を使うことを、プレイグラウンドの見出しの下に書く。

## 実装しないこと

- 入力のテキストの解析（文法のインタプリタ、ブラウザでの GHC）。
- 文法の欄の構文の色付け。
- `.hpeg` の言語サーバーの機能（補完、ホバー）。
- 他のパーサー生成器との速さの比較。

## テスト設計

先に書いて失敗させてから実装する。

- 共有リンク
  - 文法を符号化して復号すると元に戻る。空、非 ASCII、数十 KB の文法を含める。
  - 壊れたフラグメントを読み込むと、既定のサンプルを表示し、壊れていたことを伝える。
- `analyze` の結果の表示（Deno で wasm を読み込んで動かす）
  - `JsonGenerated.hpeg` で、診断がなく、生成した型の宣言に `Value` の型が含まれる。
  - 電卓の文法で、`Expr` が左再帰のまま通り、`data Expr = Add Expr Term | Expr2 Term` が生成した型に含まれる。
  - 未定義の規則を参照する文法で、その位置の行と列つきの診断が返る。
  - 文法の AST の JSON から作る木の、ノードの数と入れ子が、JSON と一致する。
- `format`
  - 整形した文法をもう一度整形しても変わらない。
- 実装後に Safari と Chrome で、文法の書きかえ、タブの切りかえ、診断のクリック、共有リンクの往復を確かめ、プルリクエストに書く。

## トレードオフ

- 入力のテキストを解析しないので、pest のエディタのように結果の木を見せられない。代わりに、peg-hs の特長である型の生成を見せる。解析まで見せるには、アクションのない文法を解釈するインタプリタを peg-hs に足す必要があり、生成したパーサーと結果を一致させる保証が新たに要る。
- サンプルをコピーで持つので、peg-hs の版を上げるときに、コピーも取り直す必要がある。wasm と同じタグから取ることで、文法の書き方と生成器の版がずれないようにする。

## 参考文献

- peg-hs. https://github.com/tett23/peg-hs
- pest. https://pest.rs/ （ページのリポジトリ https://github.com/pest-parser/site）
- Sérgio Medeiros, Fabio Mascarenhas, Roberto Ierusalimschy, "Left recursion in Parsing Expression Grammars", Science of Computer Programming 96, 2014.
- Bryan Ford, "Parsing Expression Grammars: A Recognition-Based Syntactic Foundation", POPL 2004.
- GHC User's Guide, "Using the GHC WebAssembly backend". https://ghc.gitlab.haskell.org/ghc/doc/users_guide/wasm.html
