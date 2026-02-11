# Quickstart: 開発環境構築

**Feature**: 001-dev-setup
**Target Time**: 10分以内
**Last Updated**: 2026-02-08

このガイドに従って、tv-news-with-tanstackプロジェクトの開発環境を10分以内にセットアップできます。

---

## 前提条件

以下がインストールされていることを確認してください：

- **Git**: バージョン管理
- **curl**: ツールのダウンロード用

その他のツール（mise、bun、Node.js等）はこの手順でインストールされます。

---

## セットアップ手順

### ステップ 1: リポジトリのクローン（30秒）

```bash
git clone <repository-url> tv-news-with-tanstack
cd tv-news-with-tanstack
```

---

### ステップ 2: miseのインストールと設定（2分）

```bash
# miseをインストール
curl https://mise.run | sh

# PATHに追加（bashの場合）
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc
source ~/.bashrc

# （zshの場合はこちら）
# echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc
# source ~/.zshrc

# インストール確認
mise --version
```

---

### ステップ 3: Node.jsとbunのインストール（2分）

```bash
# プロジェクトで定義されたツールをインストール
# .mise.tomlファイルを読み込んで自動的にNode.jsとbunをインストール
mise install

# インストール確認
node --version   # v22.x.x が表示されるはず
bun --version    # 最新バージョンが表示されるはず
```

---

### ステップ 4: 依存関係のインストール（3分）

```bash
# すべての依存関係をインストール
bun install

# インストール完了を確認
ls node_modules  # 依存関係がインストールされていることを確認
```

---

### ステップ 5: 開発サーバーの起動（30秒）

```bash
# 開発サーバーを起動
bun run dev
```

以下のような出力が表示されます：

```
  VITE v6.0.0  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### ステップ 6: ブラウザで確認（30秒）

ブラウザで以下のURLにアクセス：

```
http://localhost:3000
```

TanStack Startのウェルカムページが表示されれば、セットアップ完了です！

---

## エディタ設定（VS Code）（オプション・2分）

### Biome拡張機能のインストール

1. VS Codeを開く
2. 拡張機能パネル（Ctrl+Shift+X / Cmd+Shift+X）を開く
3. 「Biome」を検索してインストール
4. VS Codeを再起動

### ワークスペース設定の確認

プロジェクトには既に `.vscode/settings.json` が含まれており、以下が自動設定されます：

- 保存時の自動フォーマット
- 保存時のインポート整理
- Biomeをデフォルトフォーマッターに設定

---

## 開発に役立つコマンド

### 基本コマンド

```bash
# 開発サーバー起動
bun run dev

# 本番ビルド
bun run build

# 本番サーバー起動（ビルド後）
bun run serve

# コード品質チェック（lint + format + import整理）
bun run check

# 型チェック
bun run type-check

# テスト実行
bun run test

# テストUI起動
bun run test:ui
```

### コード品質コマンド

```bash
# リントのみ
bun run lint

# フォーマットのみ
bun run format

# CI用チェック（書き込みなし）
bun run ci
```

---

## トラブルシューティング

### miseが見つからない

**症状**: `mise: command not found`

**解決方法**:
```bash
# PATHを手動で追加
export PATH="$HOME/.local/bin:$PATH"

# または、シェル設定ファイルを再読み込み
source ~/.bashrc  # bashの場合
source ~/.zshrc   # zshの場合
```

---

### Node.jsバージョンが古い

**症状**: Node.js v18未満がインストールされている

**解決方法**:
```bash
# miseで正しいバージョンをインストール
mise install node@22

# 確認
node --version  # v22.x.x
```

---

### 依存関係のインストールが失敗する

**症状**: `bun install`でエラーが発生

**解決方法**:
```bash
# キャッシュをクリア
rm -rf node_modules
rm bun.lockb

# 再インストール
bun install
```

---

### ポート3000が既に使用されている

**症状**: `Error: listen EADDRINUSE: address already in use :::3000`

**解決方法**:
```bash
# オプション1: 使用中のプロセスを停止
lsof -ti:3000 | xargs kill -9

# オプション2: 別のポートで起動
bun run dev -- --port 3001
```

---

### Biomeの自動フォーマットが動作しない

**症状**: VS Codeでファイル保存時にフォーマットされない

**解決方法**:
1. Biome拡張機能がインストールされているか確認
2. VS Codeを再起動
3. `.vscode/settings.json`が存在するか確認
4. 手動でフォーマット: `Shift+Alt+F` (Windows/Linux) / `Shift+Option+F` (Mac)

---

## 次のステップ

開発環境のセットアップが完了しました。次は以下を確認してください：

1. **プロジェクト憲章を読む**: `.specify/memory/constitution.md`
   - コア原則（型安全性、パフォーマンス、TDD、シンプルさ、CI/CD）を理解

2. **TanStack Startのドキュメントを確認**:
   - ルーティングの仕組み
   - サーバー関数の使い方
   - TanStack Queryとの統合

3. **最初のコミットを作成**:
   ```bash
   git add .
   git commit -m "chore: setup development environment"
   ```

4. **pre-commitフックの動作確認**:
   - 意図的にリントエラーを作成してコミット
   - フックがエラーを検出してコミットをブロックすることを確認

---

## 検証チェックリスト

セットアップが正しく完了したか、以下を確認してください：

- [ ] `mise --version` が動作する
- [ ] `node --version` が v22.x.x を表示する
- [ ] `bun --version` が最新バージョンを表示する
- [ ] `bun install` がエラーなく完了する
- [ ] `bun run dev` で開発サーバーが起動する
- [ ] `http://localhost:3000` でページが表示される
- [ ] `bun run check` がエラーなく完了する
- [ ] `bun run type-check` がエラーなく完了する
- [ ] `bun run test` がサンプルテストを実行する
- [ ] VS CodeでTypeScriptの型エラーが表示される
- [ ] VS Codeでファイル保存時に自動フォーマットされる

すべてチェックできたら、開発を開始する準備が整いました！

---

## 追加リソース

- [TanStack Start公式ドキュメント](https://tanstack.com/start)
- [mise公式ドキュメント](https://mise.jdx.dev/)
- [Bun公式ドキュメント](https://bun.sh/docs)
- [Biome公式ドキュメント](https://biomejs.dev/)
- [Vitest公式ドキュメント](https://vitest.dev/)

---

**セットアップ時間**: 約10分（目標達成！✅）
