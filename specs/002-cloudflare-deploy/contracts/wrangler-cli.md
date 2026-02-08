# Contract: Wrangler CLI Commands

**Feature**: 002-cloudflare-deploy
**Type**: CLI Interface
**Date**: 2026-02-08

## Overview

Wrangler CLIを使用したデプロイ、環境変数管理、開発サーバーの操作に関するコマンドインターフェース定義。

## Commands

### 1. Deploy to Production

**Purpose**: アプリケーションを本番環境にデプロイ

**Command**:
```bash
bun run deploy
# または
wrangler deploy
```

**Prerequisites**:
- Cloudflareアカウント認証済み (`wrangler login` 実行済み)
- `wrangler.jsonc` 設定ファイル存在
- ビルド成功 (`bun run build`)

**Output**:
```
🌍  Deploying tv-news-with-tanstack
✨  Compiled Worker successfully
📤  Uploading...
✨  Upload complete
🎉  Published tv-news-with-tanstack
   https://tv-news-with-tanstack.<account>.workers.dev
```

**Exit Codes**:
- `0`: Success
- `1`: Build failure
- `2`: Authentication failure
- `3`: Upload failure

**Error Handling**:
```
Error: Authentication token missing
→ Run: wrangler login

Error: Build failed
→ Fix build errors and retry

Error: Exceeded bundle size limit
→ Optimize bundle size to under 1MB
```

---

### 2. Local Development Server

**Purpose**: ローカル開発環境でWorkerを実行

**Command**:
```bash
bun run dev
# または
wrangler dev
```

**Options**:
```bash
wrangler dev --port 3000           # ポート指定
wrangler dev --local               # Cloudflare接続なし (完全ローカル)
wrangler dev --remote              # Cloudflare経由で実行
wrangler dev --persist-to ./cache  # KVデータ永続化
```

**Output**:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8788
╭──────────────────────────────────────────────────────────╮
│  [b] open a browser, [d] open Devtools, [l] turn off local mode, [c] clear console, [x] to exit  │
╰──────────────────────────────────────────────────────────╯
```

**Environment Variables**:
- Loaded from `.dev.vars` file
- Hot reload on file changes

---

### 3. Environment Variable Management

#### Set Secret

**Purpose**: 本番環境にシークレットを設定

**Command**:
```bash
wrangler secret put BASIC_AUTH_PASSWORD
```

**Interactive Prompt**:
```
Enter a secret value: ***************
🌀 Creating the secret for the Worker "tv-news-with-tanstack"
✨ Success! Uploaded secret BASIC_AUTH_PASSWORD
```

**Programmatic Usage**:
```bash
echo "my-secret-password" | wrangler secret put BASIC_AUTH_PASSWORD
```

#### List Secrets

**Purpose**: 設定済みシークレットのリスト表示

**Command**:
```bash
wrangler secret list
```

**Output**:
```
[
  {
    "name": "BASIC_AUTH_PASSWORD",
    "type": "secret_text"
  }
]
```

**Note**: シークレットの値は表示されない (セキュリティ上の理由)

#### Delete Secret

**Purpose**: シークレットを削除

**Command**:
```bash
wrangler secret delete BASIC_AUTH_PASSWORD
```

**Output**:
```
Are you sure you want to permanently delete the secret BASIC_AUTH_PASSWORD? [y/n]
y
🌀 Deleting the secret BASIC_AUTH_PASSWORD
✨ Success! Deleted secret BASIC_AUTH_PASSWORD
```

---

### 4. Deployment Management

#### List Deployments

**Purpose**: デプロイ履歴を表示

**Command**:
```bash
wrangler deployments list
```

**Output**:
```
Created:     2026-02-08 10:30:00 UTC
Source:      wrangler
Author:      user@example.com
Deployment:  abc123def456
Message:     Deploy from local
```

#### Rollback Deployment

**Purpose**: 以前のデプロイにロールバック

**Command**:
```bash
wrangler rollback --message "Rollback to stable version"
```

**Output**:
```
🌀 Rolling back to previous deployment
✨ Rollback successful
```

---

### 5. Custom Domain Management

#### Add Custom Domain

**Purpose**: カスタムドメインを追加

**Command (via wrangler.jsonc)**:
```json
{
  "routes": [
    {
      "pattern": "tv-news.example.com/*",
      "custom_domain": true
    }
  ]
}
```

**Then deploy**:
```bash
wrangler deploy
```

**Verification**:
```bash
curl -I https://tv-news.example.com
# → 200 OK
```

---

### 6. Authentication

#### Login

**Purpose**: Cloudflareアカウントに認証

**Command**:
```bash
wrangler login
```

**Flow**:
```
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth...
✨ Successfully logged in
```

#### Logout

**Purpose**: 認証トークンをクリア

**Command**:
```bash
wrangler logout
```

---

### 7. Configuration Management

#### Validate Configuration

**Purpose**: `wrangler.jsonc` の構文チェック

**Command**:
```bash
wrangler deploy --dry-run
```

**Output (success)**:
```
✨ Configuration is valid
🎉 Would deploy tv-news-with-tanstack
```

**Output (error)**:
```
✖ Error: Invalid configuration
→ name must be lowercase alphanumeric characters
```

---

## Environment-Specific Commands

### Production Deployment

```bash
# Default: production
wrangler deploy
```

### Preview Deployment

```bash
# Deploy to preview environment
wrangler deploy --env preview
```

**Configuration**:
```json
// wrangler.jsonc
{
  "env": {
    "preview": {
      "name": "tv-news-with-tanstack-preview",
      "vars": {
        "ENVIRONMENT": "preview"
      }
    }
  }
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
- name: Deploy to Cloudflare Workers
  uses: cloudflare/wrangler-action@v3
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### Manual Deploy with Token

```bash
export CLOUDFLARE_API_TOKEN="your-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"
wrangler deploy
```

---

## Error Codes and Troubleshooting

| Exit Code | Meaning | Solution |
|-----------|---------|----------|
| 0 | Success | - |
| 1 | General error | Check error message |
| 2 | Authentication failure | Run `wrangler login` |
| 3 | Configuration error | Validate `wrangler.jsonc` |
| 10000 | Bundle size exceeded | Optimize bundle |
| 10021 | CPU time exceeded | Optimize code performance |

### Common Errors

**Error**: `Wrangler.jsonc not found`
```
Solution: Create wrangler.jsonc in project root
```

**Error**: `Compatibility date is too old`
```
Solution: Update compatibility_date to recent date
```

**Error**: `Account ID required`
```
Solution: Add account_id to wrangler.jsonc or set CLOUDFLARE_ACCOUNT_ID
```

---

## API Token Permissions

**Required Permissions**:
- `Account.Cloudflare Workers Scripts` - Edit
- `Account.Account Settings` - Read

**Token Creation**:
1. Cloudflare Dashboard → My Profile → API Tokens
2. Create Token → Edit Cloudflare Workers template
3. Copy token (shown once)

---

## Best Practices

1. **Use `--dry-run` before production deploys**
   ```bash
   wrangler deploy --dry-run
   ```

2. **Store secrets, not environment variables**
   ```bash
   # Bad: wrangler.jsonc に平文パスワード
   # Good: wrangler secret put BASIC_AUTH_PASSWORD
   ```

3. **Version your compatibility_date**
   ```json
   {
     "compatibility_date": "2026-02-08"  // Pin to specific date
   }
   ```

4. **Use environment-specific configs**
   ```json
   {
     "env": {
       "preview": { ... },
       "production": { ... }
     }
   }
   ```

---

**Note**: このコントラクトはWrangler v3に基づいています。Wranglerのバージョンアップ時には互換性を確認してください。
