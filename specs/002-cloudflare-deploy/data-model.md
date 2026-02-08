# Data Model: Cloudflareデプロイメント

**Feature**: 002-cloudflare-deploy
**Date**: 2026-02-08

## Overview

Cloudflareデプロイメント機能のデータモデル。主に設定情報と認証情報を扱う。永続化されるデータは少なく、ほとんどが環境変数として管理される。

## Entities

### 1. Deployment Metadata

デプロイの実行に関するメタデータ。Cloudflare Workers側で自動管理されるため、アプリケーション側での明示的な定義は不要。

**属性:**
- `deploymentId`: string - デプロイの一意識別子 (Cloudflare生成)
- `timestamp`: Date - デプロイ実行日時
- `commitHash`: string - デプロイされたGitコミットハッシュ
- `status`: 'success' | 'failed' | 'in_progress' - デプロイステータス
- `url`: string - デプロイされたWorkerのURL

**関係性:**
- Cloudflare APIから取得可能
- `wrangler deployments list`コマンドで確認

**型定義:**
```typescript
// Cloudflare APIレスポンス型 (参照用)
interface DeploymentMetadata {
  id: string
  created_on: string
  modified_on: string
  source: 'api' | 'dash' | 'wrangler'
  author_email: string
  annotations?: {
    'workers/triggered_by'?: string
    'workers/branch'?: string
    'workers/commit_hash'?: string
  }
}
```

### 2. Environment Configuration

環境変数とシークレット。Cloudflareの環境変数システムで管理。

**属性:**
- `BASIC_AUTH_USER`: string - Basic認証のユーザー名
- `BASIC_AUTH_PASSWORD`: string - Basic認証のパスワード (シークレット)
- `ENVIRONMENT`: 'development' | 'preview' | 'production' - 環境識別子
- `APP_NAME`: string - アプリケーション名 (オプション)
- `VERSION`: string - アプリケーションバージョン (オプション)

**管理方法:**
- 開発環境: `.dev.vars` ファイル
- 本番環境: `wrangler secret put` コマンド
- 非機密情報: `wrangler.jsonc` の `vars` セクション

**型定義:**
```typescript
// worker-configuration.d.ts
interface Env {
  // Required for Basic Auth
  BASIC_AUTH_USER: string
  BASIC_AUTH_PASSWORD: string

  // Optional metadata
  ENVIRONMENT?: 'development' | 'preview' | 'production'
  APP_NAME?: string
  VERSION?: string

  // Future Cloudflare Bindings (例)
  // MY_KV_NAMESPACE?: KVNamespace
  // MY_D1_DB?: D1Database
  // MY_R2_BUCKET?: R2Bucket
}
```

### 3. Authentication State

認証状態。リクエストごとに検証され、永続化されない。

**属性:**
- `authHeader`: string - `Authorization` ヘッダー値
- `credentials`: { user: string, pass: string } - パース後の認証情報
- `isAuthenticated`: boolean - 認証成功フラグ

**ライフサイクル:**
- リクエストごとに生成
- ミドルウェアで検証
- レスポンス後に破棄

**型定義:**
```typescript
// 認証情報の型
interface BasicAuthCredentials {
  user: string
  pass: string
}

// 認証結果の型
interface AuthResult {
  success: boolean
  credentials?: BasicAuthCredentials
  error?: string
}
```

### 4. Wrangler Configuration

`wrangler.jsonc` で定義される設定。Cloudflare Workersのデプロイ設定。

**属性:**
- `name`: string - Worker名
- `compatibility_date`: string - 互換性日付
- `compatibility_flags`: string[] - 互換性フラグ
- `main`: string - エントリーポイント
- `vars`: Record<string, string> - 非機密環境変数
- `routes`: Route[] - カスタムドメインルート (オプション)
- `env`: Record<string, EnvironmentConfig> - 環境別設定

**型定義:**
```typescript
// wrangler.jsonc のスキーマ型
interface WranglerConfig {
  $schema?: string
  name: string
  compatibility_date: string
  compatibility_flags?: string[]
  main: string
  vars?: Record<string, string | number | boolean>
  routes?: Array<{
    pattern: string
    custom_domain?: boolean
  }>
  env?: Record<string, {
    name?: string
    vars?: Record<string, string | number | boolean>
  }>
}
```

## Validation Rules

### Environment Configuration
- `BASIC_AUTH_USER`: 3文字以上、英数字のみ
- `BASIC_AUTH_PASSWORD`: 8文字以上、推測されにくいパスワード
- `ENVIRONMENT`: 'development', 'preview', 'production' のいずれか

### Authentication State
- `authHeader`: `Basic ` で始まる文字列
- `credentials.user`: 空でないこと
- `credentials.pass`: 空でないこと

### Wrangler Configuration
- `name`: 小文字英数字とハイフンのみ、63文字以内
- `compatibility_date`: YYYY-MM-DD形式
- `main`: 有効なファイルパス

## State Transitions

### Deployment State
```
[Not Deployed]
    → [Building] (bun run build)
    → [Uploading] (wrangler deploy)
    → [Deployed] (success)
    → [Active] (serving traffic)

[Not Deployed]
    → [Building]
    → [Failed] (build error or deploy error)
```

### Authentication State (per request)
```
[Unauthenticated Request]
    → [Check Auth Header]
    → [Parse Credentials]
    → [Validate Credentials]
    → [Authenticated] or [Rejected]

[Authenticated]
    → [Process Request]
    → [Return Response]

[Rejected]
    → [Return 401 with WWW-Authenticate header]
```

## Security Considerations

### Secrets Management
1. **Never commit secrets to Git**: `.dev.vars` must be in `.gitignore`
2. **Use Cloudflare Secrets**: Store `BASIC_AUTH_PASSWORD` as secret, not environment variable
3. **Rotate credentials regularly**: Update secrets periodically
4. **Limit secret access**: Use API tokens with minimal required permissions

### Password Security
1. **Timing-safe comparison**: Use `crypto.subtle.timingSafeEqual()` to prevent timing attacks
2. **HTTPS only**: Basic Auth over HTTPS only (Cloudflare Workers default)
3. **Strong passwords**: Enforce password complexity requirements
4. **Hash comparison**: Future consideration for storing hashed passwords

## Data Flow

### Deployment Flow
```
Local Code
    → Build (Vite)
    → Bundle (Cloudflare Vite Plugin)
    → Upload (Wrangler)
    → Deploy (Cloudflare Workers)
    → Active (Edge Network)
```

### Authentication Flow
```
Client Request
    → Authorization Header
    → Basic Auth Middleware
    → Parse Base64 Credentials
    → Fetch Secrets from Env
    → Timing-Safe Comparison
    → [Success] → Next Middleware
    → [Failure] → 401 Response
```

### Configuration Flow
```
.dev.vars (local)
    → wrangler dev
    → Local Worker

wrangler.jsonc + Secrets
    → wrangler deploy
    → Cloudflare Workers
    → Production Environment
```

## Future Extensions

### Potential Additions
1. **Session Management**: Use Cloudflare KV for persistent sessions
2. **Rate Limiting**: Track authentication attempts per IP
3. **Audit Logging**: Log authentication events to Cloudflare Logs
4. **Multi-User Support**: Store multiple user credentials in KV
5. **OAuth Integration**: Replace Basic Auth with OAuth2
6. **Preview Environments**: Per-PR preview deployments with separate auth

### Database Considerations
- **Cloudflare KV**: Key-value storage for session data, configuration
- **Cloudflare D1**: SQL database for structured data (user accounts, logs)
- **Cloudflare R2**: Object storage for build artifacts, static assets

---

**Note**: このデータモデルは初期実装 (MVP) を対象としており、将来の拡張を考慮した設計となっています。
