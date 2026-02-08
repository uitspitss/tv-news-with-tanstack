# Quickstart: Cloudflareデプロイメント

**Feature**: 002-cloudflare-deploy
**Target Audience**: 開発者
**Estimated Time**: 15分
**Date**: 2026-02-08

## 概要

このガイドでは、TanStack StartアプリケーションをCloudflare Workersにデプロイし、Basic認証を設定し、カスタムドメインを構成する手順を説明します。

## 前提条件

- ✅ Node.js 22がインストール済み (mise管理)
- ✅ Cloudflareアカウント (無料プラン可)
- ✅ GitHubアカウント (CI/CD用)
- ✅ ドメイン (カスタムドメイン設定時のみ)

## ステップ1: 依存関係のインストール

**所要時間**: 2分

### 1.1 パッケージのインストール

```bash
bun add -d @cloudflare/vite-plugin wrangler
```

**確認**:
```bash
bunx wrangler --version
# → ⛅️ wrangler 3.x.x
```

## ステップ2: Cloudflare設定

**所要時間**: 3分

### 2.1 Vite設定の更新

**ファイル**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})
```

**重要**: プラグインの順序を守ること

---

### 2.2 Wrangler設定の作成

**ファイル**: `wrangler.jsonc` (プロジェクトルート)

```json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tv-news-with-tanstack",
  "compatibility_date": "2026-02-08",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

**カスタマイズ**:
- `name`: Worker名を変更
- `compatibility_date`: 今日の日付に更新

---

### 2.3 型定義の追加

**ファイル**: `worker-configuration.d.ts`

```typescript
interface Env {
  BASIC_AUTH_USER: string
  BASIC_AUTH_PASSWORD: string
}

declare module '@tanstack/react-start' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

---

### 2.4 package.jsonスクリプト

**ファイル**: `package.json`

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "start": "vite preview",
    "deploy": "bun run build && wrangler deploy",
    "preview": "wrangler dev"
  }
}
```

## ステップ3: Cloudflare認証

**所要時間**: 2分

### 3.1 ログイン

```bash
bunx wrangler login
```

**プロセス**:
1. ブラウザが自動的に開く
2. Cloudflareダッシュボードにログイン
3. "Allow Wrangler to access your account"をクリック
4. ターミナルに成功メッセージ表示

**確認**:
```bash
bunx wrangler whoami
# → You are logged in with an OAuth Token, associated with the email 'your-email@example.com'.
```

## ステップ4: 初回デプロイ

**所要時間**: 3分

### 4.1 ビルドとデプロイ

```bash
bun run deploy
```

**出力例**:
```
> bun run build

✓ built in 5.23s
> wrangler deploy

🌍  Deploying tv-news-with-tanstack
✨  Compiled Worker successfully
📤  Uploading...
✨  Upload complete
🎉  Published tv-news-with-tanstack
   https://tv-news-with-tanstack.your-account.workers.dev
```

---

### 4.2 デプロイの確認

**ブラウザでアクセス**:
```
https://tv-news-with-tanstack.your-account.workers.dev
```

**curlで確認**:
```bash
curl -I https://tv-news-with-tanstack.your-account.workers.dev
# → HTTP/2 200
```

**🎉 成功！**: アプリケーションがCloudflare Workers上で動作しています。

## ステップ5: Basic認証の設定

**所要時間**: 5分

### 5.1 認証ミドルウェアの作成

**ディレクトリ作成**:
```bash
mkdir -p app/middleware
```

**ファイル**: `app/middleware/auth.ts`

```typescript
import { createMiddleware } from '@tanstack/react-start'

/**
 * Timing-safe string comparison
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
  const credentials = atob(base64Credentials)
  const [user, pass] = credentials.split(':')
  return user && pass ? { user, pass } : null
}

/**
 * Basic Authentication Middleware
 */
export const basicAuthMiddleware = createMiddleware().server(
  async ({ next, context, request }) => {
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

    return next()
  }
)
```

---

### 5.2 グローバルミドルウェアの適用

**ファイル**: `app/router.tsx`

```typescript
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { basicAuthMiddleware } from './middleware/auth'

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    server: {
      middleware: [basicAuthMiddleware], // 全ルートに適用
    },
  })

  return router
}
```

**または特定ルートのみ保護**:

**ファイル**: `app/routes/_protected.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { basicAuthMiddleware } from '../middleware/auth'

export const Route = createFileRoute('/_protected')({
  server: {
    middleware: [basicAuthMiddleware],
  },
})
```

---

### 5.3 環境変数の設定

#### ローカル開発用

**ファイル**: `.dev.vars` (新規作成)

```bash
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=dev_password
```

**重要**: `.gitignore`に追加

```bash
echo ".dev.vars" >> .gitignore
```

---

#### 本番環境用

```bash
bunx wrangler secret put BASIC_AUTH_USER
# Enter: admin

bunx wrangler secret put BASIC_AUTH_PASSWORD
# Enter: <strong-password>
```

**確認**:
```bash
bunx wrangler secret list
# → [ "BASIC_AUTH_USER", "BASIC_AUTH_PASSWORD" ]
```

---

### 5.4 認証付きデプロイ

```bash
bun run deploy
```

**テスト**:
```bash
# 認証なし → 401
curl -I https://tv-news-with-tanstack.your-account.workers.dev
# → HTTP/2 401

# 正しい認証情報 → 200
curl -u admin:password https://tv-news-with-tanstack.your-account.workers.dev
# → HTTP/2 200
```

**ブラウザでテスト**:
1. URLにアクセス
2. ログインダイアログが表示される
3. `admin` / `<your-password>` を入力
4. アプリケーションが表示される

## ステップ6: カスタムドメインの設定（オプション）

**所要時間**: 5分（DNS伝播除く）

### 6.1 前提条件

- ドメインがCloudflareで管理されている
- ネームサーバーがCloudflareを指している

---

### 6.2 ダッシュボードから設定

1. [Cloudflareダッシュボード](https://dash.cloudflare.com/)にログイン
2. `Workers & Pages` → `tv-news-with-tanstack`
3. `Settings` → `Domains & Routes`
4. `Add` → `Custom Domain`
5. ドメインを入力（例: `tv-news.example.com`）
6. `Add Custom Domain` をクリック

**DNS確認**:
```bash
dig tv-news.example.com
# → CNAME pointing to <worker-name>.<account>.workers.dev
```

---

### 6.3 Wrangler経由で設定

**ファイル**: `wrangler.jsonc`

```json
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

**デプロイ**:
```bash
bun run deploy
```

**確認**:
```bash
curl -I https://tv-news.example.com
# → HTTP/2 200
```

## ステップ7: CI/CDの設定（オプション）

**所要時間**: 10分

### 7.1 Cloudflare API Tokenの作成

1. Cloudflareダッシュボード → `My Profile` → `API Tokens`
2. `Create Token` → `Edit Cloudflare Workers` template
3. Tokenをコピー

---

### 7.2 GitHub Secretsの設定

1. GitHubリポジトリ → `Settings` → `Secrets and variables` → `Actions`
2. 以下を追加:
   - `CLOUDFLARE_API_TOKEN`: <your-token>
   - `CLOUDFLARE_ACCOUNT_ID`: <your-account-id>

**Account IDの確認**:
```bash
bunx wrangler whoami
# → account id: abc123...
```

---

### 7.3 GitHub Actions Workflowの作成

**ファイル**: `.github/workflows/deploy.yml`

```yaml
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

---

### 7.4 テスト

```bash
git add .
git commit -m "feat: setup Cloudflare deployment"
git push origin main
```

**確認**:
1. GitHub → `Actions` タブ
2. ワークフロー実行を確認
3. 成功 → 自動デプロイ完了

## トラブルシューティング

### 問題1: ビルドが失敗する

**エラー**:
```
Error: Build failed
```

**解決策**:
```bash
# キャッシュをクリア
rm -rf .vite node_modules
bun install
bun run build
```

---

### 問題2: 認証が効かない

**症状**: 認証ダイアログが表示されない

**確認**:
```bash
# シークレットが設定されているか確認
bunx wrangler secret list
```

**解決策**:
```bash
# シークレットを再設定
bunx wrangler secret put BASIC_AUTH_USER
bunx wrangler secret put BASIC_AUTH_PASSWORD
bun run deploy
```

---

### 問題3: カスタムドメインが動作しない

**症状**: カスタムドメインでアクセスできない

**確認**:
```bash
# DNS確認
dig tv-news.example.com

# Worker確認
curl -I https://tv-news-with-tanstack.your-account.workers.dev
```

**解決策**:
1. DNSが伝播するまで待つ (最大48時間)
2. Cloudflareでドメインが管理されているか確認
3. Workerが正常にデプロイされているか確認

---

### 問題4: バンドルサイズ超過

**エラー**:
```
Error: Script too large (>1MB)
```

**解決策**:
```bash
# バンドルサイズを確認
bun run build
ls -lh .output/

# Code Splittingを追加
# vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
```

## 次のステップ

### セキュリティ強化
- [ ] 強力なパスワードポリシーの実装
- [ ] レート制限の追加
- [ ] 監査ログの設定

### パフォーマンス最適化
- [ ] Edge Cachingの設定
- [ ] Code Splittingの最適化
- [ ] 画像最適化

### 機能拡張
- [ ] プレビュー環境の追加
- [ ] Cloudflare KV/D1との統合
- [ ] カスタムエラーページ

## リソース

### ドキュメント
- [TanStack Start - Cloudflare Hosting](https://tanstack.com/start/latest/docs/framework/react/guide/hosting)
- [Cloudflare Workers - Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI - Reference](https://developers.cloudflare.com/workers/wrangler/)

### サポート
- [Cloudflare Community](https://community.cloudflare.com/)
- [TanStack Discord](https://discord.com/invite/WrRKjPJ)

---

**完了！** 🎉

TanStack StartアプリケーションがCloudflare Workersで動作し、Basic認証で保護され、カスタムドメインが設定されました。
