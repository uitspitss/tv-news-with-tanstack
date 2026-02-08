# tv-news-with-tanstack Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-08

## Active Technologies

- TypeScript 5.x + Node.js 22 (管理: mise) (001-dev-setup)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x + Node.js 22 (管理: mise): Follow standard conventions

## Recent Changes

- 001-dev-setup: Added TypeScript 5.x + Node.js 22 (管理: mise)

<!-- MANUAL ADDITIONS START -->

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
