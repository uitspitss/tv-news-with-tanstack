# Implementation Plan: Cloudflareデプロイメント

**Branch**: `002-cloudflare-deploy` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-cloudflare-deploy/spec.md`

## Summary

本番環境へのCloudflareデプロイ機能を実装する。TanStack StartアプリケーションをCloudflare Workersにデプロイし、環境変数管理、Basic認証、カスタムドメイン設定、継続的デプロイをサポートする。Wrangler CLIを使用した1コマンドデプロイを実現し、開発者が5分以内に初回デプロイを完了できることを目指す。

## Technical Context

**Language/Version**: TypeScript 5.x + Node.js 22 (mise管理)
**Primary Dependencies**:
- TanStack Start (React) - フルスタックフレームワーク
- Wrangler - Cloudflare Workers CLI
- @cloudflare/vite-plugin - Cloudflare統合
- TanStack Query - サーバー状態管理
- TanStack Router - 型安全ルーティング

**Storage**: N/A (初期実装ではデータベース不要)
**Testing**: Vitest (ユニット・統合), Playwright (E2E), React Testing Library (コンポーネント)
**Target Platform**: Cloudflare Workers (エッジコンピューティング環境)
**Project Type**: Web application (TanStack Start SSR)
**Performance Goals**:
- 初回デプロイ: 5分以内
- デプロイ後グローバル展開: 30秒以内
- 稼働率: 99.9% (Cloudflareインフラ依存)

**Constraints**:
- CPU時間: 10ms (無料) / 50ms (有料)
- メモリ: 128MB
- バンドルサイズ: 1MB (圧縮後)
- Node.js API制限あり (nodejs_compat使用)

**Scale/Scope**:
- 開発者: 1-5名
- デプロイ頻度: 日次〜週次
- 環境: 本番 + プレビュー (将来)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ I. 型安全性ファースト
- **準拠**: TypeScript strictモード使用、全ての設定ファイルとミドルウェアに型定義
- **証拠**: `worker-configuration.d.ts`でEnv型定義、認証ミドルウェアに型付け

### ✅ II. パフォーマンス最適化
- **準拠**: TanStack Start SSR使用、Cloudflare Workersのエッジ配信活用
- **証拠**:
  - SSRによる初期ページロード最適化
  - Code Splittingでバンドルサイズ削減
  - Edge Cachingでレスポンス高速化

### ✅ III. テストファースト開発（絶対必須）
- **準拠**: デプロイ前の自動テスト実行、認証ミドルウェアのユニットテスト
- **証拠**:
  - GitHub Actionsで`bun test`を実行
  - Basic認証の認証成功/失敗ケースのテスト
  - E2Eテストでデプロイ後の動作確認

### ✅ IV. シンプルさとYAGNI
- **準拠**: 必要最小限の機能実装、複雑な抽象化を避ける
- **証拠**:
  - Basic認証（JWTやOAuthではなく）
  - 手動DNS設定（自動DNS管理ではなく）
  - プレビュー環境は将来実装（初期には含めない）

### ✅ V. CI/CD自動化
- **準拠**: GitHub Actionsによる自動テスト・デプロイ
- **証拠**:
  - mainブランチへのマージで自動デプロイ
  - PRごとにテスト実行
  - Pre-commitフックでリンティング・型チェック

**結論**: 全ての憲章原則に準拠。違反なし。

## Project Structure

### Documentation (this feature)

```text
specs/002-cloudflare-deploy/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# TanStack Start web application structure
.github/
└── workflows/
    ├── deploy.yml       # 本番デプロイワークフロー
    └── preview.yml      # プレビューデプロイワークフロー (将来)

app/
├── routes/              # File-based routing
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   └── _protected.tsx  # Protected layout (Basic認証)
├── middleware/          # Server middleware
│   └── auth.ts         # Basic認証ミドルウェア
└── router.tsx          # Router configuration

.dev.vars                # ローカル開発用環境変数 (.gitignore)
wrangler.jsonc           # Cloudflare Workers設定
worker-configuration.d.ts # Cloudflare環境の型定義
vite.config.ts           # Vite設定 (Cloudflareプラグイン追加)

tests/
├── unit/
│   └── middleware/
│       └── auth.test.ts # 認証ミドルウェアのテスト
├── integration/
│   └── deploy.test.ts   # デプロイプロセスのテスト
└── e2e/
    └── auth.spec.ts     # E2E認証テスト
```

**Structure Decision**: TanStack Startの標準ファイルベースルーティング構造を採用。`app/`ディレクトリ配下にルート、ミドルウェア、コンポーネントを配置。Cloudflare設定ファイルはプロジェクトルートに配置。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

該当なし。全ての憲章原則に準拠しており、違反はありません。

---

## Phase Completion Status

### Phase 0: Research ✅
**Complete**: 2026-02-08
**Output**: [research.md](./research.md)
**Key Findings**:
- Wrangler CLI + @cloudflare/vite-plugin による統合
- TanStack Start v1.159.0+ は Cloudflare Workers と完全互換
- Basic認証はミドルウェアで実装可能
- 環境変数は .dev.vars (開発) と wrangler secret (本番) で管理
- カスタムドメインはCloudflare Custom Domainsで自動設定可能
- GitHub Actionsによる自動デプロイが公式サポート済み

### Phase 1: Design & Contracts ✅
**Complete**: 2026-02-08
**Outputs**:
- [data-model.md](./data-model.md) - エンティティとデータフロー定義
- [contracts/wrangler-cli.md](./contracts/wrangler-cli.md) - Wrangler CLIコマンドインターフェース
- [contracts/basic-auth-middleware.md](./contracts/basic-auth-middleware.md) - Basic認証ミドルウェア仕様
- [quickstart.md](./quickstart.md) - 15分間のセットアップガイド
- CLAUDE.md更新 - TypeScript 5.x + Node.js 22、データベースN/A追加

**Key Decisions**:
- データ永続化は最小限 (環境変数とCloudflare管理メタデータのみ)
- Basic認証は `crypto.subtle.timingSafeEqual()` でタイミング攻撃対策
- TanStack Startミドルウェアシステムを活用した認証実装
- 設定ファイルは `wrangler.jsonc` (JSON形式) を採用

### Phase 2: Tasks Generation 🔜
**Next Step**: `/speckit.tasks` コマンドで実装タスクを生成
**Input**: このplan.md、spec.md、research.md、data-model.md、contracts/
**Expected Output**: dependency-ordered task list in `tasks.md`

---

## Implementation Readiness

✅ **All planning phases complete**
✅ **Constitution check passed (no violations)**
✅ **Technical feasibility confirmed**
✅ **API contracts defined**
✅ **Data model documented**
✅ **Quickstart guide ready**

**Ready for**: `/speckit.tasks` → Task generation and implementation
