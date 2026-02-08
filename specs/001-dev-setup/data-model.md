# Data Model: 開発環境構築

**Feature**: 001-dev-setup
**Date**: 2026-02-08

## 概要

このフィーチャーは主に設定ファイルとツールチェーンのセットアップに関するものであり、従来的な意味でのデータモデル（データベーススキーマやエンティティ）は存在しません。

しかし、以下の「設定エンティティ」を管理対象として定義します。

---

## 設定エンティティ

### 1. RuntimeConfiguration (.mise.toml)

**目的**: 開発環境のランタイムバージョンを管理

**属性**:
- `min_version`: miseの最小バージョン
- `tools.node`: Node.jsのバージョン（例: "22"）
- `tools.bun`: bunのバージョン（例: "latest"）
- `env.NODE_ENV`: 環境変数

**バリデーション**:
- `min_version`は有効なmiseバージョンであること
- Node.jsバージョンはプロジェクトの要件（v18以上）を満たすこと

**関係性**: package.jsonの`engines`フィールドと整合性を保つ

---

### 2. PackageManifest (package.json)

**目的**: プロジェクトの依存関係とスクリプトを管理

**主要属性**:
- `name`: プロジェクト名
- `type`: "module"（ESM必須）
- `scripts`: NPMスクリプト（dev、build、test等）
- `dependencies`: 本番依存関係
- `devDependencies`: 開発依存関係
- `engines`: Node.jsバージョン要件

**必須スクリプト**:
```json
{
  "dev": "bun --bun vite dev",
  "build": "bun --bun vite build",
  "serve": "bun --bun vite preview",
  "test": "vitest",
  "test:ui": "vitest --ui",
  "lint": "biome lint .",
  "format": "biome format --write .",
  "check": "biome check --write .",
  "type-check": "tsc --noEmit",
  "ci": "biome ci ."
}
```

**バリデーション**:
- `type`は"module"であること
- すべての必須スクリプトが定義されていること
- `engines.node`が.mise.tomlのNode.jsバージョンと一致すること

---

### 3. TypeScriptConfiguration (tsconfig.json)

**目的**: TypeScriptコンパイラオプションを定義

**主要属性**:
- `compilerOptions.strict`: true（憲章要件）
- `compilerOptions.jsx`: "react-jsx"
- `compilerOptions.module`: "ESNext"
- `compilerOptions.target`: "ES2022"
- `include`: コンパイル対象ディレクトリ
- `exclude`: 除外ディレクトリ

**バリデーション**:
- `strict`がtrueであること（憲章準拠）
- `verbatimModuleSyntax`が未設定またはfalse（TanStack Start要件）

**関係性**: vite.config.tsのaliasと`paths`設定が一致すること

---

### 4. ViteConfiguration (vite.config.ts)

**目的**: Viteビルドツールの設定

**主要属性**:
- `server.port`: 開発サーバーポート（デフォルト: 3000）
- `plugins`: Viteプラグインの配列

**必須プラグイン順序**:
1. `tsConfigPaths()`
2. `tanstackStart()`
3. `viteReact()`

**バリデーション**:
- プラグインの順序が正しいこと
- `tanstackStart()`が`viteReact()`より前であること

---

### 5. BiomeConfiguration (biome.json)

**目的**: リンターとフォーマッターのルール定義

**主要セクション**:
- `vcs`: Gitとの統合設定
- `files`: 対象ファイルとignoreパターン
- `formatter`: フォーマットルール
- `javascript`: JavaScript/TypeScript固有設定
- `linter`: リントルール

**バリデーション**:
- `linter.enabled`がtrueであること
- `formatter.enabled`がtrueであること
- `javascript.jsxRuntime`が"transparent"（React 17+用）

---

### 6. VitestConfiguration (vitest.config.ts)

**目的**: テストランナーの設定

**主要属性**:
- `test.globals`: グローバルテストAPI（true推奨）
- `test.environment`: "jsdom"（React用）
- `test.setupFiles`: セットアップファイルパス
- `test.coverage`: カバレッジ設定

**バリデーション**:
- `environment`が"jsdom"であること（React Testing Library要件）
- setupFilesが存在すること

**関係性**: src/test/setup.ts ファイルと連携

---

### 7. GitHubActionsWorkflow (.github/workflows/ci.yml)

**目的**: CI/CDパイプラインの定義

**主要要素**:
- `on`: トリガー条件（push、pull_request）
- `jobs`: ジョブ定義
- `steps`: 各ステップの実行内容

**必須ステップ**:
1. チェックアウト
2. miseインストール
3. ツールインストール（mise install）
4. 依存関係インストール（bun install --frozen-lockfile）
5. リント・フォーマットチェック（bun run ci）
6. 型チェック（bun run type-check）
7. テスト実行（bun run test）

**バリデーション**:
- すべての必須ステップが含まれていること
- `bun install`に`--frozen-lockfile`フラグがあること

---

### 8. HuskyConfiguration (.husky/pre-commit)

**目的**: Gitコミット前のフック実行

**内容**:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx --bun biome check --staged --write
```

**バリデーション**:
- 実行可能権限があること（chmod +x）
- `--staged`フラグが含まれていること

---

## エンティティ間の関係

```
.mise.toml
    ├─ 定義する → Node.jsバージョン
    └─ 参照される ← package.json (engines.node)

package.json
    ├─ 定義する → 依存関係
    ├─ 定義する → スクリプト
    └─ 参照する → すべての設定ファイル（npm run経由）

tsconfig.json
    ├─ 参照される ← vite.config.ts (paths → alias)
    └─ 参照される ← vitest.config.ts

vite.config.ts
    └─ 参照する → tsconfig.json (paths)

biome.json
    └─ 参照される ← .husky/pre-commit

.github/workflows/ci.yml
    ├─ 参照する → .mise.toml（mise install）
    ├─ 参照する → package.json（bun install）
    └─ 実行する → package.jsonスクリプト
```

---

## 状態遷移

開発環境のセットアップには以下の状態があります：

### セットアップ状態

1. **未初期化** → 新しくクローンされたリポジトリ
2. **ツールインストール済み** → mise、bunがインストール済み
3. **依存関係インストール済み** → `bun install`完了
4. **開発準備完了** → すべての設定ファイルが正しく、開発サーバーが起動可能

### セットアップフロー

```
未初期化
    ↓ mise install
ランタイム準備完了
    ↓ bun install
依存関係準備完了
    ↓ 設定ファイル検証
設定検証完了
    ↓ bun run dev
開発サーバー起動中
```

---

## バリデーションルール

### クロスファイルバリデーション

1. **Node.jsバージョンの一致**:
   - `.mise.toml`の`tools.node` = `package.json`の`engines.node`

2. **TypeScriptパス解決の一致**:
   - `tsconfig.json`の`paths` = `vite.config.ts`のalias設定

3. **strictモードの強制**:
   - `tsconfig.json`の`strict: true`が必須（憲章要件）

4. **Viteプラグイン順序**:
   - `tanstackStart()`が`viteReact()`より前に配置

5. **スクリプトの存在**:
   - package.jsonに全ての必須スクリプトが定義されていること

---

## まとめ

開発環境構築フィーチャーは、8つの主要設定エンティティとそれらの関係性を管理します。各エンティティは独立した設定ファイルですが、相互に参照・依存しており、整合性の維持が重要です。

**重要な検証ポイント**:
- 憲章準拠（TypeScript strict、テストファースト環境）
- TanStack Start要件（プラグイン順序、verbatimModuleSyntax）
- ツール間の整合性（バージョン、パス、設定）
