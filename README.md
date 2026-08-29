# TV News with TanStack

TanStack Start (React)をベースにしたニュースアプリケーションプロジェクト

## 🚀 クイックスタート

### 前提条件

- **Git**: バージョン管理
- **curl**: ツールのダウンロード用

その他のツール（mise、bun、Node.js等）は以下の手順でインストールされます。

### セットアップ（10分）

```bash
# 1. miseのインストール
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc

# 2. ツールのインストール
mise install

# 3. 依存関係のインストール
bun install

# 4. 開発サーバー起動
bun run dev
```

ブラウザで http://localhost:3000 を開く

詳細な手順は [specs/001-dev-setup/quickstart.md](./specs/001-dev-setup/quickstart.md) を参照

### アクセス解析

デプロイ時のみ umami で計測します。GitHub Actions のシークレット `UMAMI_WEBSITE_ID`
を `VITE_UMAMI_WEBSITE_ID` としてビルドに渡しています（`.github/workflows/deploy.yml`）。

**ローカルでは何も設定しません。** 未設定なら計測タグ自体を出力しないので、
開発中のアクセスが計測に混ざりません。

## 📚 プロジェクト憲章

このプロジェクトは以下の5つのコア原則に従って開発されます：

1. **型安全性ファースト** - TypeScript strictモード必須
2. **パフォーマンス最適化** - TanStack Query + SSRで高速化
3. **テストファースト開発** - TDD必須、Red-Green-Refactorサイクル
4. **シンプルさとYAGNI** - 過剰設計を避け、必要最小限の実装
5. **CI/CD自動化** - 自動テスト・デプロイメント

詳細は [.specify/memory/constitution.md](./.specify/memory/constitution.md) を参照

## 🛠️ 開発コマンド

### 基本コマンド

```bash
bun run dev          # 開発サーバー起動
bun run build        # 本番ビルド
bun run serve        # 本番サーバー起動（ビルド後）
```

### コード品質

```bash
bun run check        # リント・フォーマット・インポート整理
bun run lint         # リントのみ
bun run format       # フォーマットのみ
bun run type-check   # 型チェック
bun run ci           # CI用チェック（書き込みなし）
```

### テスト

```bash
bun run test         # テスト実行
bun run test:ui      # テストUI起動
bun run test:coverage # カバレッジレポート生成
```

### Cloudflareデプロイ

#### 初回デプロイ手順

**1. Cloudflare認証（初回のみ）**
```bash
bunx wrangler login
```
ブラウザが開き、Cloudflareアカウントでの認証を求められます。認証が完了すると「Successfully logged in.」と表示されます。

**2. 認証確認**
```bash
bunx wrangler whoami
```
現在のCloudflareアカウント情報が表示されれば認証成功です。

**3. ローカルプレビュー（オプション）**
```bash
bun run preview:wrangler
```
本番環境と同じWorkers環境でローカルテストが可能です。

**4. 本番デプロイ**
```bash
bun run deploy
```
ビルドとデプロイが自動実行され、完了後にデプロイURLが表示されます：
```
https://<your-app>.workers.dev
```

**5. デプロイ確認**
```bash
curl -I https://<your-app>.workers.dev
```
HTTP 200 OKが返れば正常にデプロイされています。

#### トラブルシューティング

**認証エラーが出る場合**
```bash
# 再度ログイン
bunx wrangler login

# 認証状態を確認
bunx wrangler whoami
```

**デプロイに失敗する場合**
```bash
# ビルドのみ実行して問題を特定
bun run build

# wrangler設定を確認
cat wrangler.jsonc
```

#### Workers Subdomainの変更

デフォルトの`*.workers.dev`サブドメインを短縮・変更できます：

**手順**:
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. 右上のアカウントアイコン → **Manage Account** をクリック
3. 左メニューから **Account Details** を選択
4. **Workers Subdomain** セクションで「Change」をクリック
5. 新しいサブドメイン名を入力（例: `my-account-a1b2c3` → `myaccount`）
6. **Save** をクリック

**変更後**:
- すべてのWorkersのURLが自動的に更新されます
- 旧URL: `https://worker-name.old-subdomain.workers.dev`
- 新URL: `https://worker-name.new-subdomain.workers.dev`
- 再デプロイは**不要**（即座に反映）

**注意**:
- サブドメインは**アカウント全体**に適用されます
- 短く覚えやすい名前にすると便利です
- 一度変更すると、古いURLは使えなくなります

### CI/CD（継続的デプロイ）

#### GitHub Actions自動デプロイ設定

mainブランチへのプッシュで自動的にCloudflare Workersにデプロイされます。

**1. Cloudflare API Token作成**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) を開く
2. "Create Token" をクリック
3. "Edit Cloudflare Workers" テンプレートを選択
4. Permissionsを確認：
   - Account / Workers Scripts / Edit
   - Account / Account Settings / Read
5. "Continue to summary" → "Create Token"
6. 表示されたトークンをコピー（一度しか表示されません）

**2. Cloudflare Account ID取得**

```bash
bunx wrangler whoami
```

Account IDをコピーします。

**3. GitHub Secretsに追加**

GitHubリポジトリの Settings → Secrets and variables → Actions で以下を追加：

- `CLOUDFLARE_API_TOKEN`: 手順1で作成したAPI token
- `CLOUDFLARE_ACCOUNT_ID`: 手順2で取得したAccount ID

**4. 動作確認**

mainブランチにプッシュすると、GitHub Actionsが自動的に：
1. 依存関係のインストール
2. 型チェック
3. リント
4. テスト実行
5. ビルド
6. Cloudflare Workersへのデプロイ

を実行します。

**ワークフロー状況の確認**
```bash
# GitHubリポジトリのActionsタブで確認
# または
gh run list
gh run view <run-id>
```

#### 環境変数（Secrets）の設定

本番環境のシークレット（Basic認証など）は別途設定が必要です：

```bash
# Basic認証のユーザー名とパスワードを設定
bunx wrangler secret put BASIC_AUTH_USER
bunx wrangler secret put BASIC_AUTH_PASSWORD

# 設定確認
bunx wrangler secret list
```

**注意**: GitHub ActionsからデプロイされたWorkerには、wranglerで設定したsecretsが引き継がれます。

### カスタムドメイン設定

独自ドメインでアプリケーションを公開する場合の手順：

**1. Cloudflareにドメインを追加**

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) でドメインを追加
2. ネームサーバーをCloudflareに変更（ドメインレジストラで設定）
3. DNSレコードが有効になるまで待機（最大48時間、通常は数分）

**2. カスタムドメインをWorkerに紐付け**

```bash
# wrangler.jsonc にルート設定を追加
{
  "name": "tv-news-with-tanstack",
  "routes": [
    {
      "pattern": "example.com/*",
      "zone_name": "example.com"
    }
  ]
}
```

または、Cloudflare Dashboardから設定：

1. Workers & Pages → アプリケーションを選択
2. Settings → Triggers → Custom Domains
3. "Add Custom Domain" をクリック
4. ドメイン名を入力（例: `app.example.com`）
5. "Add Domain" をクリック

**3. DNS設定確認**

Cloudflare DNSで自動的にCNAMEレコードが作成されます：

```
app.example.com CNAME <worker-name>.<account>.workers.dev
```

**4. デプロイと確認**

```bash
# カスタムドメイン設定後に再デプロイ
bun run deploy

# 動作確認
curl -I https://app.example.com
```

**注意**:
- HTTPSは自動的に有効化されます（Cloudflare SSL/TLS）
- Basic認証はカスタムドメインでも有効です
- *.workers.devドメインも引き続き利用可能です

## 🔧 技術スタック

### コアフレームワーク
- **TanStack Start (React)** - フルスタックフレームワーク
- **TypeScript** - strictモード有効
- **Vite** - 高速ビルドツール

### ツール
- **mise** - ランタイムマネージャー（Node.js 22）
- **bun** - 高速パッケージマネージャー
- **Biome** - リンター・フォーマッター（ESLint + Prettier統合）
- **lefthook** - Gitフック管理

### テスト
- **Vitest** - ユニット・統合テスト
- **React Testing Library** - コンポーネントテスト
- **MSW** - APIモック
- **Playwright** - E2Eテスト（将来予定）

## 📁 プロジェクト構造

```
/
├── .github/workflows/  # GitHub Actions CI/CD
├── .vscode/           # VS Code設定
├── src/
│   ├── routes/        # TanStack Startルート
│   ├── components/    # Reactコンポーネント
│   ├── lib/          # ユーティリティ
│   └── test/         # テストセットアップ
├── public/           # 静的アセット
├── specs/            # 機能仕様・実装計画
├── .mise.toml        # ランタイムバージョン管理
├── lefthook.yml      # Gitフック設定
├── biome.json        # Biome設定
├── tsconfig.json     # TypeScript設定
├── vite.config.ts    # Vite設定
└── vitest.config.ts  # Vitest設定
```

## 🎯 次のステップ

1. **VS Code拡張機能をインストール**
   - Biome (リント・フォーマット)
   - TypeScript (型チェック)

2. **憲章を読む**
   - `.specify/memory/constitution.md`
   - プロジェクトの原則を理解

3. **最初のコミット**
   ```bash
   git add .
   git commit -m "feat: initial development environment setup"
   ```

## 🐛 トラブルシューティング

### miseが見つからない
```bash
export PATH="$HOME/.local/bin:$PATH"
source ~/.bashrc  # または ~/.zshrc
```

### ポート3000が使用中
```bash
# 使用中のプロセスを停止
lsof -ti:3000 | xargs kill -9

# または別のポートで起動
bun run dev -- --port 3001
```

### Biomeの自動フォーマットが動作しない
1. Biome拡張機能がインストールされているか確認
2. VS Codeを再起動
3. `.vscode/settings.json`が存在するか確認

### Cloudflareデプロイが失敗する

**認証エラー（401/403）**
```bash
# ログイン状態を確認
bunx wrangler whoami

# 再ログイン
bunx wrangler login
```

**ビルドエラー**
```bash
# 依存関係を再インストール
rm -rf node_modules bun.lock
bun install

# 型チェック
bun run type-check

# ローカルビルドを確認
bun run build
```

**GitHub Actions失敗**
1. GitHub Secretsが正しく設定されているか確認
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. API Tokenの権限を確認（Workers Scripts: Edit必須）
3. ワークフローログで詳細を確認：
   ```bash
   gh run list
   gh run view <run-id> --log-failed
   ```

**デプロイ後に500エラー**
```bash
# Cloudflare Workersのログを確認
bunx wrangler tail

# 環境変数が設定されているか確認
bunx wrangler secret list
```

**Basic認証が動作しない**
```bash
# シークレットが設定されているか確認
bunx wrangler secret list

# シークレットを再設定
bunx wrangler secret put BASIC_AUTH_USER
bunx wrangler secret put BASIC_AUTH_PASSWORD

# 再デプロイ
bun run deploy
```

## 📖 ドキュメント

- [Quickstart](./specs/001-dev-setup/quickstart.md) - 詳細なセットアップガイド
- [Constitution](./.specify/memory/constitution.md) - プロジェクト憲章
- [TanStack Start公式ドキュメント](https://tanstack.com/start)
- [Biome公式ドキュメント](https://biomejs.dev/)

## ⚖️ ライセンス

ライセンスは設定していません。著作権はすべて留保されます（All rights reserved）。
