# Research: 開発環境構築

**Feature**: 001-dev-setup
**Date**: 2026-02-08
**Status**: Complete

## 調査概要

TanStack Start (React)、mise、bun、Biomeを使用した開発環境構築に必要な技術的決定事項を調査しました。

---

## 1. プロジェクト初期化戦略

### 決定: TanStack Start公式CLIを使用

**選択理由**:
- 公式CLIが依存関係、設定ファイル、ルート構造を自動生成
- ベストプラクティスに従った初期構造を提供
- 手動セットアップに比べてエラーが少ない

**実装方法**:
```bash
bun create @tanstack/start@latest
```

**代替案と却下理由**:
- **手動セットアップ**: 時間がかかり、設定ミスのリスクが高い
- **既存テンプレートのクローン**: 公式CLIの方が最新のベストプラクティスに準拠

---

## 2. ランタイム管理：mise

### 決定: .mise.tomlを使用したプロジェクト単位のバージョン管理

**選択理由**:
- 複数開発者間でNode.jsバージョンを統一
- `.mise.toml`でバージョンをコードとして管理
- nvm、nvmrcよりも多言語対応で将来的に拡張可能

**推奨設定**:
```toml
min_version = "2024.9.5"

[tools]
node = "22"
bun = "latest"

[env]
NODE_ENV = "development"

_.path = ['{{config_root}}/node_modules/.bin']
```

**代替案と却下理由**:
- **nvm + .nvmrc**: Node.jsのみ対応、将来的に他の言語（Pythonなど）を追加する際に不便
- **Docker**: 開発環境としては重すぎる、HMRのパフォーマンスに影響

---

## 3. パッケージマネージャー：bun

### 決定: bunをプロジェクトのパッケージマネージャーとして使用

**選択理由**:
- npmの最大25倍高速なインストール
- TanStack Start/Viteと完全互換
- ロックファイル（bun.lockb）による再現性の確保

**使用方法**:
```bash
bun install                    # 依存関係インストール
bun install --frozen-lockfile  # CI/CD用
bun run dev                    # 開発サーバー起動
```

**注意点**:
- React 19を推奨（React 18では一部問題が報告されている）
- `bun --bun vite dev` フラグでViteを最適化して実行可能

**代替案と却下理由**:
- **npm**: 遅い、インストール時間が開発体験を損なう
- **pnpm**: bunより遅い、ディスクスペース効率は良いがこのプロジェクトでは優先度低
- **yarn**: bunより遅い、設定が複雑

---

## 4. リンター/フォーマッター：Biome

### 決定: BiomeをESLint + Prettierの代替として採用

**選択理由**:
- ESLint + Prettierより高速（Rustベース）
- オールインワンツール（リント・フォーマット・インポート整理）
- Prettierと97%の互換性
- 434以上のルール（ESLint、TypeScript ESLintから移植）

**推奨設定（biome.json）**:
```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.11/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
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
      },
      "correctness": {
        "useExhaustiveDependencies": "warn"
      }
    }
  }
}
```

**package.jsonスクリプト**:
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

**代替案と却下理由**:
- **ESLint + Prettier**: 2つのツールの設定・実行が必要、遅い
- **dprint**: 設定が複雑、エコシステムがBiomeより小さい

---

## 5. TypeScript設定

### 決定: strictモード有効化とTanStack Start推奨設定

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "Bundler",
    "module": "ESNext",
    "target": "ES2022",
    "strict": true,
    "strictNullChecks": true,
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

**重要な注意点**:
- `verbatimModuleSyntax`は**無効**（TanStack Startの要件）
- `strict: true`で憲章の「型安全性ファースト」に準拠

---

## 6. Vite設定

### 決定: TanStack Start推奨設定を採用

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths(),
    tanstackStart(),
    viteReact(),
  ],
})
```

**重要な順序**:
- `tanstackStart()`は`viteReact()`より**前**に配置必須

---

## 7. テスト環境

### 決定: Vitest + React Testing Library + MSW

**Vitestの選択理由**:
- Viteとネイティブ統合（設定が簡単）
- 高速（ESMネイティブ対応）
- Jestと互換性のあるAPI

**基本設定（vitest.config.ts）**:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

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
})
```

**必要な依存関係**:
```bash
bun add -D vitest @vitest/ui jsdom
bun add -D @testing-library/react @testing-library/jest-dom
bun add -D msw
```

---

## 8. CI/CD設定

### 決定: GitHub Actionsを使用

**理由**:
- GitHubとネイティブ統合
- 無料枠が十分（月2,000分）
- mise、bunとの統合が容易

**基本的なワークフロー（.github/workflows/ci.yml）**:
```yaml
name: CI
on: [push, pull_request]

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
        run: bun run test
```

---

## 9. Pre-commitフック

### 決定: Husky + Biomeネイティブ --staged オプション

**選択理由**:
- Biome v1.7.0以降の`--staged`オプションでlint-staged不要
- シンプルな設定
- 高速

**設定方法**:
```bash
# Huskyインストール
bunx husky-init
bun install
```

**.husky/pre-commit**:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

bunx --bun biome check --staged --write
```

---

## 10. ディレクトリ構造

### 決定: TanStack Start標準構造を採用

```
project/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .husky/
│   └── pre-commit
├── src/
│   ├── routes/
│   │   ├── __root.tsx
│   │   └── index.tsx
│   ├── components/
│   ├── lib/
│   └── test/
│       └── setup.ts
├── public/
├── .mise.toml
├── biome.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

**理由**:
- TanStack Startのファイルベースルーティングに最適
- 拡張性が高い
- 憲章のシンプルさ原則に準拠

---

## まとめ

### 採用技術スタック

| カテゴリ | 選択 | 理由 |
|---------|------|------|
| フレームワーク | TanStack Start (React) | 憲章で定義、SSR対応 |
| ランタイム管理 | mise | 複数言語対応、チーム間の統一 |
| パッケージマネージャー | bun | 高速、TanStack Start互換 |
| リンター/フォーマッター | Biome | 高速、オールインワン |
| 型チェック | TypeScript strict | 憲章の型安全性原則 |
| テスト | Vitest + RTL + MSW | 高速、Vite統合 |
| CI/CD | GitHub Actions | 無料、統合が容易 |
| Pre-commit | Husky + Biome | シンプル、高速 |

### セットアップ時間の見積もり

- CLIでの初期化: 2分
- ツール設定（mise、bun、Biome）: 3分
- テスト環境構築: 3分
- CI/CD設定: 2分

**合計**: 約10分（憲章のSC-001を満たす）

### 未解決事項

なし - すべての技術的決定が完了しました。
