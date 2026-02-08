# tv-news-with-tanstack Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-08

## Active Technologies
- TypeScript 5.x + Node.js 22 (mise管理) (002-cloudflare-deploy)
- N/A (初期実装ではデータベース不要) (002-cloudflare-deploy)

- TypeScript 5.x + Node.js 22 (管理: mise) (001-dev-setup)

## Project Structure

```text
src/
tests/
```

## Commands

bun test && bun run lint

## Code Style

TypeScript 5.x + Node.js 22 (管理: mise): Follow standard conventions

## Recent Changes
- 002-cloudflare-deploy: Added TypeScript 5.x + Node.js 22 (mise管理)

- 001-dev-setup: Added TypeScript 5.x + Node.js 22 (管理: mise)

<!-- MANUAL ADDITIONS START -->

## パッケージマネージャーとランタイム

**重要**: このプロジェクトでは **Bun** を使用します。

### 基本コマンド

すべてのドキュメント、スクリプト、ガイドでは以下のコマンドを使用してください：

| 操作 | コマンド | 説明 |
|------|----------|------|
| パッケージインストール | `bun install` | 依存関係をインストール |
| スクリプト実行 | `bun run <script>` | package.jsonのスクリプトを実行 |
| 開発サーバー起動 | `bun run dev` | 開発サーバーを起動 |
| ビルド | `bun run build` | プロダクションビルド |
| テスト実行 | `bun test` | テストを実行 |
| CLIツール実行 | `bunx <command>` | CLIツールを実行 (npxの代替) |

### 具体例

**❌ 使用しないでください：**
```bash
npm install
npm run dev
npx wrangler deploy
```

**✅ 正しい使用方法：**
```bash
bun install
bun run dev
bunx wrangler deploy
```

### 注意事項

- **npm**、**npx**、**yarn**、**pnpm** は使用しない
- すべてのCIパイプライン、ドキュメント、ガイドで`bun`を使用
- Bunは高速で互換性が高いため、ほとんどのnpmパッケージがそのまま動作

## ビルドツール

**重要**: このプロジェクトでは **Vite** を使用します。

### TanStack Startのビルドツール変更履歴

- **〜v1.120.x**: Vinxiを使用（廃止）
- **v1.121.0+**: **Viteに移行**（現在）

### 正しいコマンド

```json
{
  "scripts": {
    "dev": "vite dev",      // ✅ 開発サーバー
    "build": "vite build",  // ✅ プロダクションビルド
    "start": "vite preview" // ✅ ビルド後のプレビュー
  }
}
```

### ❌ 使用しないでください

```json
{
  "scripts": {
    "dev": "vinxi dev",     // ❌ 古い（v1.120.x以前）
    "build": "vinxi build", // ❌ 古い
    "start": "vinxi start"  // ❌ 古い
  }
}
```

### キャッシュディレクトリ

- ✅ `.vite/` - Viteのキャッシュ
- ❌ `.vinxi/` - 古いVinxiのキャッシュ（削除推奨）

## Git Workflow

### Feature開発時のWorktree使用

機能開発時は git worktree を使用してください。

**基本的な使い方：**

```bash
# 新しいfeature用のworktreeを作成
git worktree add ../tv-news-feature-name -b feature-name

# 作業ディレクトリに移動
cd ../tv-news-feature-name

# 開発作業...

# 作業完了後、元のディレクトリに戻る
cd -

# worktreeを削除
git worktree remove ../tv-news-feature-name
```

**利点：**
- 複数のブランチで同時に作業可能
- ブランチ切り替え時のstash不要
- クリーンな作業環境を維持
- メインブランチを汚さずに実験的な開発が可能

**参考：** using-git-worktrees スキルを使用すると、worktreeの操作をより簡単に行えます。

## 推奨Claude Codeスキル

このプロジェクトでは以下のClaude Codeスキルの使用を推奨します：

### コア開発スキル
- **tanstack-query** - TanStack Query v5のサーバー状態管理
- **tanstack-router** - TanStack Routerのtype-safeルーティング
- **tanstack-start** - TanStack Startのフルスタック開発

### UI/UX・デザイン
- **ui-ux-pro-max** - UI/UXデザインインテリジェンス
- **frontend-design** - 高品質なフロントエンドインターフェース作成

### React開発
- **vercel-composition-patterns** - スケーラブルなReactコンポジションパターン

### インフラ・デプロイ
- **cloudflare** - Cloudflareプラットフォーム開発
- **wrangler** - Cloudflare Workers CLI

### テスト・品質
- **webapp-testing** - Playwrightを使ったWebアプリテスト
- **web-perf** - Webパフォーマンス分析

### 自動化
- **agent-browser** - ブラウザ自動化

### プロジェクト管理
- **speckit.*** - 機能仕様、計画、タスク管理コマンド

### インストール方法

Claude Codeのスキルは、通常グローバルまたはプロジェクト固有でインストールされます。
詳細は[Claude Codeのドキュメント](https://github.com/anthropics/claude-code)を参照してください。

<!-- MANUAL ADDITIONS END -->
