# tv-news-with-tanstack Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-08

## Active Technologies
- TypeScript 5.x + Node.js 22 (mise管理) (002-cloudflare-deploy)
- N/A (初期実装ではデータベース不要) (002-cloudflare-deploy)
- TypeScript 5.x（strictモード）、Node.js 22（mise管理） (001-prefecture-office-button)
- 静的JSONファイル（public/data/prefecture-offices.json - 新規作成） (001-prefecture-office-button)

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
- 001-prefecture-office-button: Added TypeScript 5.x（strictモード）、Node.js 22（mise管理）

## Implementation Notes

### Feature: 001-prefecture-office-button (都道府県庁舎所在地マーカー)

**実装日**: 2026-02-11

**概要**: 日本地図上の47都道府県庁舎所在地にインタラクティブなマーカーを表示する機能。

**実装内容**:
- **データソース**: dataofjapan/land CSVデータ → JSON変換（public/data/prefecture-offices.json）
- **コンポーネント**:
  - `PrefectureOfficeMarkers`: マーカー表示（Leaflet divIcon使用）
  - `PrefectureOfficePopup`: クリック時のポップアップ（都道府県名表示）
- **フック**:
  - `usePrefectureOffices`: データ取得、自動リトライ（1回）、エラーハンドリング
  - `useMapInteraction`: 拡張（capitalマーカー用の状態管理追加）
- **アクセシビリティ**:
  - WCAG 2.1 AA準拠
  - キーボード操作（Tab, Enter/Space, Esc）
  - aria-label, role="button", tabindex="0"
  - フォーカスインジケーター（3:1コントラスト比）
- **パフォーマンス**:
  - React.memo, useMemo, useCallback使用
  - ズームレベル対応（20-30px）
  - レンダリング時間 < 2秒（開発環境でモニタリング）

**テスト**: 47 tests passing
- prefectureOfficeData.test.ts: 16 tests
- usePrefectureOffices.test.ts: 6 tests
- JapanMap.test.tsx: 25 tests (3 tests added)

**重要な設計決定**:
- DOM-based markers (L.divIcon) - 47マーカーは軽量なので Canvas 不要
- 既存の useMapInteraction フックを拡張（新規フック作成せず）
- エラーログのみ（ユーザー通知なし）- 仕様で明示

<!-- MANUAL ADDITIONS START -->

## パッケージマネージャーとランタイム

**重要**: このプロジェクトでは **Bun** を使用します。

### 基本コマンド

すべてのドキュメント、スクリプト、ガイドでは以下のコマンドを使用してください：

| 操作 | コマンド | 説明 |
|------|----------|------|
| パッケージインストール | `bun install` | 依存関係をインストール |
| スクリプト実行 | `bun run <script>` | package.jsonのスクリプトを実行 |
| 開発サーバー起動 | `bun dev` | 開発サーバーを起動 |
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
bun dev
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

## 開発環境

**重要**: このプロジェクトは **Cloudflare Workers** にデプロイすることを前提としていますが、開発時は通常の Vite 開発サーバーを使用します。

### 開発サーバー

#### ✅ 使用すべきコマンド

```bash
bun dev
```

- **実体**: `vite dev` を実行
- **環境**: 通常の Vite 開発サーバー
- **特徴**:
  - 高速起動（約1秒）
  - HMR（Hot Module Replacement）が高速
  - 軽量で快適な開発体験

### package.json のスクリプト

```json
{
  "scripts": {
    "dev": "bun --bun vite dev",           // ✅ 開発サーバー
    "preview:wrangler": "wrangler dev",    // Cloudflare Workers環境でテストする場合
    "build": "bun --bun vite build",       // ✅ ビルド
    "deploy": "bun run build && wrangler deploy"  // ✅ デプロイ
  }
}
```

## Storybook

**重要**: Storybook 10 + `@storybook/addon-vitest`。ストーリーは Chromium 実機で走ります。

### コマンド

| 操作 | コマンド |
|------|----------|
| Storybook 起動 | `bun run storybook` |
| 静的ビルド | `bun run build-storybook` |
| 全テスト | `bun run test`（unit + storybook） |
| ユニットのみ | `bun run test:unit` |
| ストーリーのみ | `bun run test:storybook` |

### ストーリーの置き場所

対象コンポーネントと同じディレクトリに `*.stories.tsx` を置きます
（例: `src/components/map-error-fallback.stories.tsx`）。

### モジュールモック

ブラウザで動かせない・外部リソースを取りに行くモジュールは
`.storybook/mock-modules.ts` で Vite の解決を差し替えています。

| 元モジュール | モック | 理由 |
|---|---|---|
| `src/components/youtube-player.tsx` | `src/components/__mocks__/youtube-player.js` | YouTube IFrame API を読みに行く |
| `src/contexts/video-player-context.tsx` | `src/contexts/__mocks__/video-player-context.js` | TanStack Router の `useSearch` に依存 |

- **元モジュールに export を足したらモックにも足すこと**（手作業）
- モックは **JavaScript の ESM**（TypeScript 不可）。実体を re-export しない
- ストーリー側では `mocked()` で振る舞いを差し込む

### 注意事項

- `.storybook/main.ts` の `stories` / `framework` / `viteFinal` を変えたら dev サーバーを再起動する
- ストーリーから外部リソース（画像・API）を取りに行かない。data URI かモックにする
- `optimizeDeps` の取りこぼしはウォームキャッシュでは再現しない。
  疑うときは `rm -rf node_modules/.cache/storybook node_modules/.vite` してから `bun run test:storybook`
- a11y は `test: "todo"`（違反を表示するだけで CI は落とさない）

## E2E テスト

**重要**: `@playwright/test` を使い、**本番ビルドを配ったサーバー**に対して走らせます。

### 3種類のテストの境界

| | 何を起動するか | 何を確かめるか |
|---|---|---|
| Vitest `unit`（jsdom） | 何も起動しない | 純粋なロジック、DOM 構造 |
| Vitest `storybook`（browser mode） | Chromium。**サーバーは起動しない** | 1コンポーネントの見た目とインタラクション |
| **`@playwright/test`** | Chromium **＋ `vite preview`（本番ビルド）** | ページ配信、SSR/hydration、URL ↔ 状態、静的データの配信 |

**Vitest browser mode で E2E を書かないこと。** ブラウザは動くがサーバーは動かない。

### コマンド

| 操作 | コマンド |
|------|----------|
| E2E 実行 | `bun run test:e2e` |
| UI モード | `bun run test:e2e:ui` |

`bun run test`（Vitest）には E2E を含めません。pre-commit にも入れません。

### 構成

- テストは `e2e/*.spec.ts`（unit は `*.test.ts`。**拡張子で役割を分ける**）
- `playwright.config.ts` の `webServer` が `bun run build && bun run serve --port 3100` を実行
  - `vite dev` は使わない（オンデマンドコンパイル待ちが「要素が見つからない」として現れる）
  - ポートは開発サーバー（3000）とずらす。ずらさないと `bun dev` に対してテストが走る
  - ローカルは `reuseExistingServer: true`。既に 3100 が上がっていればビルドは走らない
- `e2e/fixtures.ts` が YouTube / Esri タイル / Google Fonts を **abort** する
  （アプリの `/data/*.json` はブロックしない。あれはサーバーが配る本物）
- Leaflet のラベルは role を持たないので `[data-broadcast-name="…"]` で取る。
  それ以外は `getByRole` を第一候補にする

### 注意事項

- `@playwright/test` と無印 `playwright`（Storybook が使う）は**別パッケージ**。
  **バージョンを揃えること**（片方だけ上がるとブラウザバイナリが2世代になり CI が壊れる）
- `page.waitForTimeout` を書かない。`expect(locator)` の web-first assertion が自動で待つ
- 視覚回帰（`toHaveScreenshot`）は E2E に混ぜない。見た目は Storybook 側
- 網羅しようとしない。E2E は主要導線の番人で、仕様の検証器ではない

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

## 推奨Codexスキル

このプロジェクトでは以下のCodexスキルの使用を推奨します：

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

Codexのスキルは、通常グローバルまたはプロジェクト固有でインストールされます。
詳細は[Codexのドキュメント](https://github.com/anthropics/Codex)を参照してください。

<!-- MANUAL ADDITIONS END -->
