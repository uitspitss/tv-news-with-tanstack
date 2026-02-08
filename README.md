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

## 📖 ドキュメント

- [Quickstart](./specs/001-dev-setup/quickstart.md) - 詳細なセットアップガイド
- [Constitution](./.specify/memory/constitution.md) - プロジェクト憲章
- [TanStack Start公式ドキュメント](https://tanstack.com/start)
- [Biome公式ドキュメント](https://biomejs.dev/)

## ⚖️ ライセンス

MIT
