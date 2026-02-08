# Research: Cloudflareデプロイメント

**調査日**: 2026-02-08
**対象プロジェクト**: TanStack Start (React) を使用したTV Newsアプリケーション
**目的**: Cloudflare Workersへのデプロイ機能実装のための技術調査

---

## 1. Wrangler CLI統合

### Decision
TanStack Start公式の推奨構成を採用:
- `@cloudflare/vite-plugin` をViteプラグインとして使用
- `wrangler.jsonc` (JSON形式) で設定管理
- `@tanstack/react-start/server-entry` をメインエントリーポイントとして使用

### Rationale
1. **公式サポート**: TanStack Startは2025年10月からCloudflare Vite pluginの公式サポートを開始しており、最も安定した統合方法
2. **設定の簡潔性**: JSON形式の設定ファイルは型安全性とIDE補完のサポートが優れている
3. **ビルド最適化**: Cloudflare Vite pluginがSSR環境を自動的に最適化

### 実装の詳細

**必要なパッケージ:**
```bash
bun add -d @cloudflare/vite-plugin wrangler
```

**vite.config.ts の設定:**
```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(), // must come after tanstackStart
  ],
})
```

**wrangler.jsonc の設定:**
```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tv-news-with-tanstack",
  "compatibility_date": "2026-02-08",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

**package.json スクリプト:**
```json
{
  "scripts": {
    "deploy": "bun run build && wrangler deploy",
    "preview": "wrangler dev"
  }
}
```

### Alternatives Considered
- **TOML形式の設定**: Cloudflareは新規プロジェクトにはJSONを推奨しているため不採用
- **カスタムWorkerエントリーポイント**: TanStack Start公式の`@tanstack/react-start/server-entry`を使用することで保守性向上

### 参考資料
- [TanStack Start - Hosting Documentation](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Cloudflare - TanStack Start Framework Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [Cloudflare Changelog - TanStack Start Support](https://developers.cloudflare.com/changelog/2025-10-24-tanstack-start/)
- [TanStack Start Cloudflare Example](https://github.com/TanStack/router/tree/main/examples/react/start-basic-cloudflare)

---

## 2. 環境変数とシークレット管理

### Decision
環境に応じた多層的なアプローチ:
- **開発環境**: `.dev.vars` ファイル (gitignore対象)
- **本番環境**: `wrangler secret put` コマンドでシークレット管理
- **非機密情報**: `wrangler.jsonc` の `[vars]` セクション

### Rationale
1. **セキュリティ**: シークレットはCloudflare側で暗号化され、デプロイ後は値を確認できない
2. **環境分離**: 開発と本番で異なる設定を簡単に管理可能
3. **CI/CD対応**: GitHub Actionsなどから環境変数を注入可能

### 実装の詳細

**開発環境の設定 (.dev.vars):**
```bash
# .dev.vars (ローカル開発用 - .gitignoreに追加すること)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=dev_password
```

**本番環境のシークレット設定:**
```bash
# 本番環境にシークレットを設定
bunx wrangler secret put BASIC_AUTH_PASSWORD
# プロンプトに従ってパスワードを入力

# 設定されたシークレットの確認 (値は表示されない)
bunx wrangler secret list
```

**環境変数の読み取り (TypeScript):**
```typescript
// worker-configuration.d.ts
interface Env {
  BASIC_AUTH_USER: string
  BASIC_AUTH_PASSWORD: string
}

// Server functionでの使用例
import { createServerFn } from '@tanstack/react-start'

export const protectedAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .handler(async ({ request, context }) => {
    const env = context.cloudflare.env as Env
    const password = env.BASIC_AUTH_PASSWORD
    // 認証ロジック...
  })
```

**環境別の設定 (.dev.vars.production):**
```bash
# 本番用の開発環境設定
# .dev.vars.production
BASIC_AUTH_USER=production_admin
```

**wrangler.jsonc での非機密変数:**
```json
{
  "name": "tv-news-with-tanstack",
  "vars": {
    "APP_NAME": "TV News",
    "VERSION": "1.0.0"
  }
}
```

### 重要な注意事項
1. `.dev.vars` と `.env` を両方使用しない (どちらか一方を選択)
2. シークレットはGitにコミットしない
3. `wrangler secret put` は即座に新バージョンをデプロイするため注意
4. タイミング攻撃を防ぐため、パスワード比較には `crypto.subtle.timingSafeEqual()` を使用

### Alternatives Considered
- **環境変数のみでの管理**: シークレットの方が安全性が高いため不採用
- **外部シークレット管理サービス**: 初期実装では過剰な複雑性のため不採用

### 参考資料
- [Cloudflare Workers - Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers - Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Wrangler - System Environment Variables](https://developers.cloudflare.com/workers/wrangler/system-environment-variables/)

---

## 3. Basic認証の実装

### Decision
TanStack Startのミドルウェアシステムを使用したBasic認証の実装:
- サーバーミドルウェアで認証を処理
- `beforeLoad` フックでルートレベルの保護
- Cloudflare Workers標準のBasic認証パターンを採用

### Rationale
1. **TanStack Start統合**: フレームワークのミドルウェアシステムを活用することで一貫性のある実装
2. **セキュリティ**: HTTPSと組み合わせることで十分なセキュリティレベル
3. **シンプルさ**: 初期実装として最小限の複雑性

### 実装の詳細

**1. 認証ミドルウェアの作成:**
```typescript
// src/middleware/auth.ts
import { createMiddleware } from '@tanstack/react-start'

/**
 * Timing-safe comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder()
  const aBuffer = encoder.encode(a)
  const bBuffer = encoder.encode(b)

  return crypto.subtle.timingSafeEqual(aBuffer, bBuffer)
}

/**
 * Parse Basic Auth header
 */
function parseBasicAuth(authHeader: string): { user: string; pass: string } | null {
  const base64Credentials = authHeader.replace('Basic ', '')
  const credentials = atob(base64Credentials) // or use Buffer in nodejs_compat
  const [user, pass] = credentials.split(':')
  return user && pass ? { user, pass } : null
}

/**
 * Basic Authentication Middleware
 */
export const basicAuthMiddleware = createMiddleware().server(async ({ next, context, request }) => {
  const env = context.cloudflare.env as Env
  const authHeader = request.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  const credentials = parseBasicAuth(authHeader)

  if (!credentials) {
    return new Response('Invalid credentials', { status: 401 })
  }

  const validUser = env.BASIC_AUTH_USER || 'admin'
  const validPass = env.BASIC_AUTH_PASSWORD || 'password'

  const userMatch = timingSafeEqual(credentials.user, validUser)
  const passMatch = timingSafeEqual(credentials.pass, validPass)

  if (!userMatch || !passMatch) {
    return new Response('Unauthorized', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Area"',
      },
    })
  }

  // Authentication successful, proceed to next middleware/handler
  return next()
})
```

**2. ルートレベルでの適用:**
```typescript
// routes/_protected.tsx - Protected layout route
import { createFileRoute, redirect } from '@tanstack/react-router'
import { basicAuthMiddleware } from '../middleware/auth'

export const Route = createFileRoute('/_protected')({
  beforeLoad: async ({ context }) => {
    // Middleware already handled auth, but we can add additional checks here
    return {}
  },
  // Apply middleware to all child routes
  server: {
    middleware: [basicAuthMiddleware],
  },
})
```

**3. Server Routesでの適用:**
```typescript
// routes/api/data.ts
import { createFileRoute } from '@tanstack/react-router'
import { basicAuthMiddleware } from '../../middleware/auth'

export const Route = createFileRoute('/api/data')({
  server: {
    middleware: [basicAuthMiddleware],
    handlers: {
      GET: async ({ request }) => {
        return new Response(JSON.stringify({ data: 'protected data' }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
```

**4. グローバルミドルウェアとしての適用:**
```typescript
// router.tsx
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { basicAuthMiddleware } from './middleware/auth'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    server: {
      middleware: [basicAuthMiddleware], // Apply to all routes
    },
  })

  return router
}
```

### セキュリティ考慮事項
1. **HTTPS必須**: Basic認証は平文をbase64エンコードするだけなので、HTTPSが必須
2. **タイミング攻撃対策**: `crypto.subtle.timingSafeEqual()` を使用
3. **シークレット管理**: パスワードは環境変数/シークレットで管理
4. **ログアウト機能**: 401ステータスを返すことでブラウザの認証をクリア

### Alternatives Considered
- **JWT認証**: 初期実装では過剰。将来的に検討可能
- **OAuth/OIDC**: エンタープライズレベルでは検討価値あり
- **Cloudflare Access**: より高度なセキュリティが必要な場合の選択肢

### 参考資料
- [Cloudflare Workers - HTTP Basic Authentication](https://developers.cloudflare.com/workers/examples/basic-auth/)
- [TanStack Start - Middleware Guide](https://tanstack.com/start/latest/docs/framework/react/guide/middleware)
- [TanStack Start - Authentication Guide](https://tanstack.com/start/latest/docs/framework/react/guide/authentication)
- [Hono - Basic Auth Middleware](https://hono.dev/docs/middleware/builtin/basic-auth)

---

## 4. カスタムドメイン設定

### Decision
Cloudflare Workers Custom Domainsを使用:
- Cloudflareで管理されているドメイン/ゾーンを使用
- Wrangler CLIまたはダッシュボードで設定
- 自動的なDNS設定と証明書管理

### Rationale
1. **簡便性**: DNS設定と証明書管理が自動化される
2. **統合性**: Cloudflareエコシステム内で完結
3. **パフォーマンス**: Cloudflareのエッジネットワークを最大限活用

### 実装の詳細

**前提条件:**
- ドメインがCloudflareで管理されている (ネームサーバーがCloudflareを指している)
- Workerがデプロイ済み

**方法1: Cloudflareダッシュボード**
1. Cloudflareダッシュボードにログイン
2. `Workers & Pages` セクションに移動
3. 対象のWorkerを選択
4. `Settings` → `Domains & Routes` → `Add` → `Custom Domain`
5. ドメインまたはサブドメインを入力 (例: `tv-news.example.com`)
6. `Add Custom Domain` をクリック

**方法2: Wrangler設定ファイル**
```json
// wrangler.jsonc
{
  "name": "tv-news-with-tanstack",
  "compatibility_date": "2026-02-08",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "routes": [
    {
      "pattern": "tv-news.example.com/*",
      "custom_domain": true
    }
  ]
}
```

**確認:**
```bash
# デプロイ
bunx wrangler deploy

# DNS設定を確認 (自動的に作成される)
# CNAME レコード: tv-news.example.com -> <worker-name>.<account>.workers.dev
```

### 重要な制約事項
1. **ゾーン所有権**: Cloudflareでドメインを管理している必要がある
2. **ワイルドカード不可**: ワイルドカードDNSレコードは非サポート
3. **既存CNAME**: カスタムドメインと同じホスト名に既存のCNAMEレコードがある場合は競合
4. **パス制限**: Custom Domainはドメイン/サブドメインの全パスをWorkerにルーティング

### 外部DNS使用の場合
Cloudflare以外のDNSプロバイダを使用する場合:
- Business Planで`Partial DNS`機能を使用
- または、CNAMEレコードを手動で設定 (証明書管理が複雑になる)

### DNS設定例 (手動設定の場合)
```
Type: CNAME
Name: tv-news
Target: tv-news-with-tanstack.<account-id>.workers.dev
Proxy: Yes (Cloudflare経由)
```

### Alternatives Considered
- **Workers Routes**: より細かいパス制御が必要な場合に検討
- **Cloudflare Pages**: 静的サイトの場合の選択肢
- **外部DNSプロバイダ**: 初期実装では複雑性のため不採用

### 参考資料
- [Cloudflare Workers - Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Blog - Custom Domains for Workers](https://blog.cloudflare.com/custom-domains-for-workers/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

## 5. 継続的デプロイ (CI/CD)

### Decision
GitHub Actionsとcloudflare/wrangler-actionを使用:
- 公式のWrangler GitHub Actionを使用
- Cloudflare API Tokenでの認証
- mainブランチへのpush時に自動デプロイ

### Rationale
1. **公式サポート**: Cloudflare提供の公式Action
2. **簡潔性**: 最小限の設定で動作
3. **セキュリティ**: GitHub Secretsで認証情報を管理
4. **柔軟性**: プレビューデプロイや環境別デプロイが可能

### 実装の詳細

**1. Cloudflare API Tokenの作成:**
1. Cloudflareダッシュボードにログイン
2. `My Profile` → `API Tokens` → `Create Token`
3. `Edit Cloudflare Workers` テンプレートを使用
4. 必要な権限:
   - `Account.Cloudflare Workers Scripts` - Edit
   - `Account.Account Settings` - Read
5. Tokenをコピー

**2. GitHub Secretsの設定:**
GitHub リポジトリで:
1. `Settings` → `Secrets and variables` → `Actions`
2. 以下のシークレットを追加:
   - `CLOUDFLARE_API_TOKEN`: API Token
   - `CLOUDFLARE_ACCOUNT_ID`: Account ID

**3. GitHub Actions Workflowの作成:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run tests
        run: bun test

      - name: Run linter
        run: bun run lint

      - name: Build
        run: bun run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

**4. プレビューデプロイの設定 (Pull Request用):**
```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    branches:
      - main

jobs:
  preview:
    runs-on: ubuntu-latest
    name: Preview
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Build
        run: bun run build

      - name: Deploy Preview
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env preview

      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed to: https://preview.tv-news.<account>.workers.dev'
            })
```

**5. 環境別デプロイ設定:**
```json
// wrangler.jsonc
{
  "name": "tv-news-with-tanstack",
  "compatibility_date": "2026-02-08",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry",
  "env": {
    "preview": {
      "name": "tv-news-with-tanstack-preview",
      "vars": {
        "ENVIRONMENT": "preview"
      }
    },
    "production": {
      "name": "tv-news-with-tanstack",
      "vars": {
        "ENVIRONMENT": "production"
      }
    }
  }
}
```

### セキュリティのベストプラクティス
1. **シークレットの分離**: GitHub Secretsを使用し、リポジトリにコミットしない
2. **最小権限の原則**: API Tokenは必要最小限の権限のみ付与
3. **トークンローテーション**: 定期的にAPI Tokenを更新
4. **監査ログ**: Cloudflareダッシュボードでデプロイログを確認

### Alternatives Considered
- **Cloudflare Workers Builds**: GitHubネイティブ統合だが、自己ホストやGitHub以外には非対応
- **GitLab CI/CD**: GitLabを使用している場合の選択肢
- **手動デプロイ**: 小規模プロジェクトでは検討可能だが、自動化を推奨

### 参考資料
- [Cloudflare Workers - GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action)
- [GitHub Marketplace - Deploy to Cloudflare Workers](https://github.com/marketplace/actions/deploy-to-cloudflare-workers-with-wrangler)
- [Cloudflare Workers - CI/CD](https://developers.cloudflare.com/workers/ci-cd/)

---

## 6. TanStack Startとの互換性

### Decision
TanStack Start v1.159.0+ は Cloudflare Workers と完全互換:
- 公式サポート済み (2025年10月から)
- `@cloudflare/vite-plugin` による最適化
- SSR、Server Functions、Middlewareすべて動作

### Rationale
1. **公式サポート**: TanStack公式ドキュメントにCloudflare Workers向けガイドあり
2. **実績**: 公式サンプルプロジェクトで動作確認済み
3. **エコシステム**: Cloudflareの各種サービス (KV, D1, R2等) との統合可能

### 動作確認済み機能

#### ✅ Server-Side Rendering (SSR)
- Cloudflare Workersでのフルページレンダリング
- `@tanstack/react-start/server-entry` がエントリーポイント
- Reactコンポーネントのサーバーサイドレンダリング

#### ✅ Server Functions
```typescript
// Server Functionの例
import { createServerFn } from '@tanstack/react-start'

export const getData = createServerFn({ method: 'GET' })
  .handler(async () => {
    // Cloudflare Workers環境で実行される
    return { data: 'from server' }
  })
```

#### ✅ Middleware
```typescript
// グローバルミドルウェア
export const authMiddleware = createMiddleware()
  .server(async ({ next, context }) => {
    // 認証ロジック
    return next()
  })
```

#### ✅ Cloudflare Bindings
```typescript
// KV, D1, R2などのCloudflareサービスへのアクセス
import { createServerFn } from '@tanstack/react-start'

export const getFromKV = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
    const env = context.cloudflare.env as Env
    const value = await env.MY_KV_NAMESPACE.get('key')
    return { value }
  })
```

#### ✅ Router Features
- File-based routing
- Layouts and nested routes
- Data loading with loaders
- Route protection with beforeLoad

### 設定のベストプラクティス

**1. TypeScript型定義:**
```typescript
// worker-configuration.d.ts
interface Env {
  // Environment variables
  BASIC_AUTH_USER: string
  BASIC_AUTH_PASSWORD: string

  // Cloudflare Bindings (例)
  // MY_KV_NAMESPACE: KVNamespace
  // MY_D1_DB: D1Database
  // MY_R2_BUCKET: R2Bucket
}

declare module '@tanstack/react-start' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

**2. Cloudflare環境へのアクセス:**
```typescript
// Middleware内
export const myMiddleware = createMiddleware()
  .server(async ({ context }) => {
    const env = context.cloudflare.env as Env
    const ctx = context.cloudflare.ctx
    const cf = context.cloudflare.cf
    // ...
  })

// Server Function内
export const myServerFn = createServerFn({ method: 'POST' })
  .handler(async ({ context }) => {
    const env = context.cloudflare.env as Env
    // ...
  })
```

**3. Vite設定:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Order is important!
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})
```

### 既知の制限事項

#### 🔴 Node.js API制限
- すべてのNode.js APIが使えるわけではない
- `nodejs_compat` フラグで一部のNode.js APIが利用可能
- ファイルシステムアクセスは不可 (代わりにKV/R2を使用)

#### 🔴 CPU時間制限
- 無料プラン: 10ms CPU time
- 有料プラン: 50ms CPU time
- 処理が重い場合は注意が必要

#### 🔴 メモリ制限
- 128MB メモリ制限
- 大きなデータセットの処理には工夫が必要

#### 🔴 パッケージサイズ
- 1MB スクリプトサイズ制限 (圧縮後)
- バンドルサイズの最適化が重要

### パフォーマンス最適化

**1. Code Splitting:**
```typescript
// Route-based code splitting
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'

const HeavyComponent = lazy(() => import('../components/HeavyComponent'))

export const Route = createFileRoute('/heavy')({
  component: () => <HeavyComponent />
})
```

**2. Edge Caching:**
```typescript
// Server Functionでのキャッシング
export const getCachedData = createServerFn({ method: 'GET' })
  .handler(async ({ context }) => {
    const cache = caches.default
    const cacheKey = new Request('https://example.com/data')

    let response = await cache.match(cacheKey)

    if (!response) {
      const data = await fetchData()
      response = new Response(JSON.stringify(data), {
        headers: {
          'Cache-Control': 'max-age=3600',
          'Content-Type': 'application/json',
        },
      })
      await cache.put(cacheKey, response.clone())
    }

    return response.json()
  })
```

### 移行のチェックリスト
- [x] Node.js 22がサポートされている (mise管理)
- [x] TanStack Start v1.159.0以上を使用
- [x] `@cloudflare/vite-plugin` と `wrangler` をインストール
- [x] `vite.config.ts` にCloudflareプラグインを追加
- [x] `wrangler.jsonc` を作成
- [x] `nodejs_compat` フラグを有効化
- [ ] Node.js専用APIの使用を確認・修正
- [ ] バンドルサイズを1MB以下に最適化
- [ ] CPU時間制限を考慮した実装

### Alternatives Considered
- **Cloudflare Pages**: 静的サイト向け。SSRが必要な場合はWorkers必須
- **Vercel/Netlify**: 別のホスティングプロバイダ。Cloudflareとは異なるエッジネットワーク
- **自己ホスト**: 完全な制御が必要な場合の選択肢

### 参考資料
- [TanStack Start - Cloudflare Hosting Guide](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Cloudflare - TanStack Start Framework Guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/)
- [TanStack Router - Cloudflare Example](https://github.com/TanStack/router/tree/main/examples/react/start-basic-cloudflare)
- [Cloudflare Workers - Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Cloudflare - TanStack Start Changelog](https://developers.cloudflare.com/changelog/2025-10-24-tanstack-start/)

---

## 総括と推奨事項

### 技術スタックの実現可能性
✅ **高い実現可能性**: TanStack Start + Cloudflare Workersの組み合わせは公式にサポートされており、必要な機能はすべて実装可能です。

### 実装の優先順位

#### Phase 1: 基本デプロイ
1. `@cloudflare/vite-plugin` と `wrangler` のインストール
2. `vite.config.ts` と `wrangler.jsonc` の設定
3. ローカルでの動作確認 (`wrangler dev`)
4. 初回デプロイ (`wrangler deploy`)

#### Phase 2: 認証実装
1. Basic認証ミドルウェアの実装
2. 環境変数とシークレットの設定
3. セキュリティテスト

#### Phase 3: カスタムドメイン
1. Cloudflareでドメインを管理
2. Custom Domainの設定
3. DNS確認

#### Phase 4: CI/CD
1. GitHub Actions workflowの作成
2. Cloudflare API Tokenの設定
3. 自動デプロイのテスト

### セキュリティチェックリスト
- [ ] HTTPSのみでBasic認証を使用
- [ ] パスワードをシークレットとして管理
- [ ] `.dev.vars` を `.gitignore` に追加
- [ ] タイミング攻撃対策を実装
- [ ] API Tokenを適切に管理
- [ ] 定期的なセキュリティレビュー

### パフォーマンスチェックリスト
- [ ] バンドルサイズを1MB以下に保つ
- [ ] Code Splittingを活用
- [ ] Edge Cachingを適切に設定
- [ ] CPU時間を意識した実装

### 今後の拡張性
- **Cloudflare KV**: セッション管理、キャッシュ
- **Cloudflare D1**: SQLデータベース
- **Cloudflare R2**: オブジェクトストレージ
- **Cloudflare Durable Objects**: ステートフル処理
- **Cloudflare Access**: エンタープライズ認証

---

**調査完了日**: 2026-02-08
**次のステップ**: Phase 1の実装に進む
