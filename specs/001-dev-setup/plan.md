# Implementation Plan: 開発環境構築

**Branch**: `001-dev-setup` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-dev-setup/spec.md`

## Summary

開発者が10分以内にプロジェクトをクローンしてから開発サーバーを起動できる開発環境を構築します。TanStack Start (React)をベースフレームワークとし、mise（ランタイム管理）、bun（パッケージマネージャー）、Biome（リンター/フォーマッター）を使用して、憲章の5つのコア原則（型安全性、パフォーマンス、TDD、シンプルさ、CI/CD）に準拠した環境を整備します。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 22 (管理: mise)
**Primary Dependencies**:
- TanStack Start (React) - フルスタックフレームワーク
- Vite 6.x - ビルドツール
- React 19 - UIライブラリ
**Storage**: N/A（設定ファイルのみ）
**Testing**: Vitest + React Testing Library + MSW
**Target Platform**: クロスプラットフォーム（macOS、Windows、Linux）
**Project Type**: Web application（フルスタック）
**Performance Goals**:
- 開発サーバー起動: 5秒以内
- HMR（ホットリロード）: 500ms以内
- 初期セットアップ: 10分以内
**Constraints**:
- TypeScript strictモード必須
- Biomeによるリント・フォーマットチェック必須
- すべてのOSで同じように動作すること
**Scale/Scope**:
- 単一プロジェクト
- 設定ファイル: 約10個
- 開発者: 1-10名を想定

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 型安全性ファースト ✅

- **要件**: TypeScript strictモード有効化
- **実装**: tsconfig.jsonで`"strict": true`を設定
- **検証**: 型エラーのあるコードが1秒以内に検出される（SC-002）

### II. パフォーマンス最適化 ✅

- **要件**: 高速な開発体験
- **実装**:
  - bunによる高速パッケージインストール
  - Vite 6.xによる高速HMR
  - Biomeによる高速リント・フォーマット
- **検証**:
  - 開発サーバー起動5秒以内（SC-006）
  - 自動フォーマット500ms以内（SC-004）

### III. テストファースト開発（絶対必須） ✅

- **要件**: テスト環境のセットアップ
- **実装**:
  - Vitest + React Testing Library + MSW
  - サンプルテストの作成
  - package.jsonでテストスクリプト定義
- **検証**: テスト実行が10秒以内（SC-003）

### IV. シンプルさとYAGNI ✅

- **要件**: 必要最小限のツール構成
- **実装**:
  - Biome（ESLint + Prettierを統合）
  - mise（単一ツールで複数ランタイム管理）
  - TanStack Start公式CLI（手動設定を最小化）
- **検証**: 設定ファイルが10個以内、セットアップ10分以内（SC-001）

### V. CI/CD自動化 ✅

- **要件**: 自動テスト・リントの実行
- **実装**:
  - GitHub Actions設定（.github/workflows/ci.yml）
  - pre-commitフック（Husky + Biome）
  - package.jsonでCIスクリプト定義
- **検証**: CIパイプライン3分以内（SC-005）

### 総合評価: **PASS** ✅

すべての憲章原則に準拠した設計です。複雑さの正当化は不要です。

## Project Structure

### Documentation (this feature)

```text
specs/001-dev-setup/
├── plan.md              # This file
├── research.md          # ✅ Created - 技術調査結果
├── data-model.md        # ✅ Created - 設定ファイルエンティティ定義
├── quickstart.md        # ✅ Created - 10分セットアップガイド
└── checklists/
    └── requirements.md  # ✅ Created - 仕様品質チェックリスト
```

### Source Code (repository root)

```text
/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actionsワークフロー
├── .husky/
│   └── pre-commit              # pre-commitフック
├── .vscode/
│   └── settings.json           # VS Code設定
├── src/
│   ├── routes/                 # TanStack Startルート
│   │   ├── __root.tsx         # ルートレイアウト
│   │   └── index.tsx          # ホームページ
│   ├── components/            # Reactコンポーネント
│   ├── lib/                   # ユーティリティ
│   └── test/
│       └── setup.ts           # Vitestセットアップ
├── public/                    # 静的アセット
├── .mise.toml                 # ランタイムバージョン管理
├── biome.json                 # Biome設定
├── tsconfig.json              # TypeScript設定
├── vite.config.ts             # Vite設定
├── vitest.config.ts           # Vitest設定
├── package.json               # パッケージマニフェスト
├── bun.lockb                  # bunロックファイル
├── README.md                  # プロジェクトREADME
└── .gitignore                 # Git除外設定
```

**Structure Decision**: TanStack Startの標準的なプロジェクト構造を採用。`src/routes/`ディレクトリでファイルベースルーティングを実現し、将来的な拡張性を確保。設定ファイルはルートディレクトリに配置し、検索性を優先。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**該当なし** - すべての憲章チェックに合格しており、複雑さの正当化は不要です。

---

## Implementation Phases

このセクションでは、開発環境構築の具体的な実装手順を定義します。

### Phase 0: プロジェクト初期化（User Story 1 - P1）

**目標**: TanStack Startプロジェクトの基本構造を作成し、開発サーバーが起動可能にする

**手順**:

1. **TanStack Startプロジェクト作成**
   ```bash
   bun create @tanstack/start@latest .
   ```
   - CLIで対話的にオプションを選択
   - 最小限の選択（Tailwind CSS、ESLintなどは後で追加）

2. **基本的な依存関係の確認**
   - `package.json`に以下が含まれることを確認：
     - `@tanstack/react-start`
     - `@tanstack/react-router`
     - `vite`
     - `react`、`react-dom`
     - `typescript`

3. **開発サーバー起動テスト**
   ```bash
   bun run dev
   ```
   - `http://localhost:3000`でページが表示されることを確認

**成功基準**: 開発サーバーが5秒以内に起動し、ブラウザでウェルカムページが表示される

---

### Phase 1: ランタイム管理設定（User Story 1 - P1）

**目標**: miseを使用してNode.jsとbunのバージョンを管理

**手順**:

1. **.mise.tomlファイルの作成**
   ```toml
   min_version = "2024.9.5"

   [tools]
   node = "22"
   bun = "latest"

   [env]
   NODE_ENV = "development"

   _.path = ['{{config_root}}/node_modules/.bin']
   ```

2. **package.jsonにenginesフィールド追加**
   ```json
   {
     "engines": {
       "node": ">=22.0.0",
       "bun": ">=1.0.0"
     }
   }
   ```

3. **READMEの更新**
   - miseのインストール手順を追加
   - `mise install`コマンドの説明

**成功基準**: `mise install`でNode.js 22とbun最新版が自動インストールされる

---

### Phase 2: TypeScript設定（User Story 2 - P2）

**目標**: TypeScript strictモードを有効化し、憲章の型安全性原則に準拠

**手順**:

1. **tsconfig.jsonの更新**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "strictNullChecks": true,
       "jsx": "react-jsx",
       "moduleResolution": "Bundler",
       "module": "ESNext",
       "target": "ES2022",
       "skipLibCheck": true,
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true,
       "forceConsistentCasingInFileNames": true,
       "baseUrl": ".",
       "paths": {
         "~/*": ["./src/*"]
       }
     },
     "include": ["src"],
     "exclude": ["node_modules", "dist", ".output"]
   }
   ```

2. **package.jsonにtype-checkスクリプト追加**
   ```json
   {
     "scripts": {
       "type-check": "tsc --noEmit"
     }
   }
   ```

3. **型エラーの修正**
   - CLIで生成されたコードにstrictモードによるエラーがある場合は修正

**成功基準**: `bun run type-check`がエラーなく完了し、意図的な型エラーが1秒以内に検出される

---

### Phase 3: Biome設定（User Story 2 - P2）

**目標**: リンターとフォーマッターをBiomeで統合

**手順**:

1. **Biomeのインストール**
   ```bash
   bun add -D -E @biomejs/biome
   ```

2. **Biome初期化**
   ```bash
   bunx --bun biome init
   ```

3. **biome.jsonの設定**
   ```json
   {
     "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
     "vcs": {
       "enabled": true,
       "clientKind": "git",
       "useIgnoreFile": true
     },
     "files": {
       "include": ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx", "**/*.json"],
       "ignore": ["node_modules", "dist", "build", ".output"]
     },
     "formatter": {
       "enabled": true,
       "indentStyle": "space",
       "indentWidth": 2,
       "lineWidth": 100
     },
     "javascript": {
       "jsxRuntime": "transparent",
       "formatter": {
         "quoteStyle": "double",
         "trailingCommas": "all",
         "semicolons": "always"
       }
     },
     "linter": {
       "enabled": true,
       "rules": {
         "recommended": true,
         "suspicious": {
           "noExplicitAny": "warn"
         }
       }
     }
   }
   ```

4. **package.jsonにスクリプト追加**
   ```json
   {
     "scripts": {
       "format": "biome format --write .",
       "lint": "biome lint .",
       "check": "biome check --write .",
       "ci": "biome ci ."
     }
   }
   ```

5. **VS Code設定（.vscode/settings.json）**
   ```json
   {
     "[javascript]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[typescript]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[javascriptreact]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     },
     "[typescriptreact]": {
       "editor.defaultFormatter": "biomejs.biome",
       "editor.formatOnSave": true
     }
   }
   ```

**成功基準**: `bun run check`がエラーなく完了し、ファイル保存時に500ms以内に自動フォーマットされる

---

### Phase 4: テスト環境構築（User Story 3 - P3）

**目標**: Vitest、React Testing Library、MSWをセットアップ

**手順**:

1. **テスト関連パッケージのインストール**
   ```bash
   bun add -D vitest @vitest/ui jsdom
   bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   bun add -D msw
   ```

2. **vitest.config.tsの作成**
   ```typescript
   import { defineConfig } from 'vitest/config'
   import react from '@vitejs/plugin-react'
   import path from 'path'

   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/test/setup.ts',
       coverage: {
         provider: 'v8',
         reporter: ['text', 'json', 'html'],
       },
     },
     resolve: {
       alias: {
         '~': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

3. **テストセットアップファイル（src/test/setup.ts）**
   ```typescript
   import '@testing-library/jest-dom'
   ```

4. **サンプルテストの作成（src/routes/index.test.tsx）**
   ```typescript
   import { render, screen } from '@testing-library/react'
   import { describe, it, expect } from 'vitest'
   // import Home from './index'  // 実際のコンポーネント名に合わせる

   describe('Home Page', () => {
     it('renders welcome message', () => {
       // render(<Home />)
       // expect(screen.getByText(/welcome/i)).toBeInTheDocument()
       expect(true).toBe(true) // プレースホルダー
     })
   })
   ```

5. **package.jsonにテストスクリプト追加**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:ui": "vitest --ui",
       "test:coverage": "vitest --coverage"
     }
   }
   ```

**成功基準**: `bun run test`でサンプルテストが10秒以内に実行完了する

---

### Phase 5: CI/CD設定（User Story 4 - P4）

**目標**: GitHub Actionsとpre-commitフックを設定

**手順**:

1. **GitHub Actionsワークフロー（.github/workflows/ci.yml）**
   ```yaml
   name: CI
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4

         - name: Install mise
           run: |
             curl https://mise.run | sh
             echo "$HOME/.local/bin" >> $GITHUB_PATH

         - name: Install tools
           run: mise install

         - name: Install dependencies
           run: bun install --frozen-lockfile

         - name: Lint and format check
           run: bun run ci

         - name: Type check
           run: bun run type-check

         - name: Run tests
           run: bun run test --run
   ```

2. **Huskyのインストールと設定**
   ```bash
   bunx husky-init
   bun install
   ```

3. **pre-commitフック（.husky/pre-commit）**
   ```bash
   #!/usr/bin/env sh
   . "$(dirname -- "$0")/_/husky.sh"

   bunx --bun biome check --staged --write
   ```

4. **実行権限の付与**
   ```bash
   chmod +x .husky/pre-commit
   ```

5. **package.jsonにprepareスクリプト追加**
   ```json
   {
     "scripts": {
       "prepare": "husky install"
     }
   }
   ```

**成功基準**:
- CIパイプラインが3分以内に完了する
- pre-commitフックがリントエラーを検出してコミットをブロックする

---

### Phase 6: ドキュメント整備

**目標**: READMEを更新し、セットアップ手順を明確化

**手順**:

1. **README.mdの更新**
   - quickstart.mdの内容を統合
   - プロジェクト概要の追加
   - 憲章へのリンク
   - 開発コマンド一覧

2. **.gitignoreの確認**
   ```
   node_modules
   .output
   dist
   .env
   .DS_Store
   *.log
   coverage
   ```

**成功基準**: 新しい開発者がREADMEだけで10分以内にセットアップ完了できる

---

## Validation & Testing

各フェーズ完了後、以下を検証：

### Phase 0検証
- [ ] `bun run dev`で開発サーバーが5秒以内に起動
- [ ] `http://localhost:3000`でページが表示される

### Phase 1検証
- [ ] `mise --version`が動作する
- [ ] `mise install`でNode.js 22とbunがインストールされる

### Phase 2検証
- [ ] `bun run type-check`がエラーなく完了
- [ ] 意図的な型エラーが1秒以内に検出される

### Phase 3検証
- [ ] `bun run check`がエラーなく完了
- [ ] VS Codeでファイル保存時に自動フォーマットされる

### Phase 4検証
- [ ] `bun run test`がサンプルテストを10秒以内に実行

### Phase 5検証
- [ ] GitHub Actionsワークフローが3分以内に完了
- [ ] pre-commitフックがリントエラーを検出

### Phase 6検証
- [ ] READMEに従って、新しい開発者が10分以内にセットアップ完了

---

## Rollout Strategy

1. **ローカル検証**: 自分の環境ですべてのフェーズを完了
2. **テストコミット**: 意図的なエラーでpre-commitフックをテスト
3. **PR作成**: CI/CDが正常に動作することを確認
4. **ドキュメントレビュー**: 他の開発者にREADMEをレビューしてもらう
5. **mainマージ**: すべてのチェックが通過したらマージ

---

## Dependencies & Risks

### 外部依存関係
- **mise**: インストールスクリプトの可用性
- **bun**: パッケージレジストリへのアクセス
- **GitHub**: Actions実行環境

### リスクと軽減策
1. **リスク**: miseのインストールスクリプトが失敗
   - **軽減策**: 手動インストール手順をREADMEに記載

2. **リスク**: bunとTanStack Startの互換性問題
   - **軽減策**: React 19を使用（research.mdで確認済み）

3. **リスク**: CI/CDの実行時間が目標（3分）を超過
   - **軽減策**: キャッシュ戦略の導入（bun依存関係のキャッシュ）

---

## Success Metrics

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| セットアップ時間 | 10分以内 | 新しい開発者によるタイムトライアル |
| 型エラー検出 | 1秒以内 | VS Codeでの実測 |
| テスト実行時間 | 10秒以内 | `time bun run test --run` |
| 自動フォーマット | 500ms以内 | VS Codeでの実測 |
| CIパイプライン | 3分以内 | GitHub Actionsログ |
| 開発サーバー起動 | 5秒以内 | `time bun run dev` |

すべての指標が目標を達成することで、憲章のSuccess Criteria（SC-001～SC-007）を満たします。
