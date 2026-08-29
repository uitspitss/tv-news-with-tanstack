# tv-news-with-tanstack

日本地図上から各地のテレビ局を選び、その局のニュース YouTube チャンネルを再生するアプリ。

<https://tv-news.u7s.dev/>

- 47 都道府県の県庁所在地にマーカー、放送エリアに局名ラベルを表示
- 局名をクリックするとプレイヤーが開き、選択状態が URL に入る（`?broadcast=ntv`）
- その URL を直接開けば状態が復元される

## 動かす

**前提**: Git と curl。それ以外（mise / Bun / Node.js）は以下で入ります。

```bash
curl https://mise.run | sh
echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc && source ~/.bashrc

mise install
bun install
bun run dev
```

<http://localhost:3000> を開きます。

**パッケージマネージャは Bun です。** npm / npx / yarn / pnpm は使いません。

## コマンド

| 操作 | コマンド |
|---|---|
| 開発サーバー | `bun run dev` |
| 本番ビルド | `bun run build` |
| ビルド結果を配る | `bun run serve` |
| リント・整形 | `bun run check`（`bun run ci` は書き込みなし） |
| 型チェック | `bun run type-check` |
| 未使用依存の検出 | `bun run knip` |
| テスト（unit + Storybook） | `bun run test` |
| E2E | `bun run test:e2e` |
| Storybook | `bun run storybook` |

## テストの三層

| | 起動するもの | 見るもの |
|---|---|---|
| Vitest `unit`（jsdom） | なし | ロジック、DOM 構造 |
| Vitest `storybook`（browser mode） | Chromium | 1 コンポーネントの見た目と操作 |
| Playwright | Chromium ＋ 本番ビルドのサーバー | ページ配信、SSR/hydration、URL ↔ 状態 |

`bun run test` に E2E は含みません。詳細は [AGENTS.md](./AGENTS.md) を参照。

## 地図

ベースマップは [OpenFreeMap](https://openfreemap.org/)（API キー不要・リクエスト数無制限・商用可）。
ベクタータイルなので `@maplibre/maplibre-gl-leaflet` で MapLibre GL を Leaflet のレイヤーとして
挟んでいます。局名ラベルを主役にするため、道路と地名のレイヤーは非表示にしています。

**帰属表示は ODbL 上の義務**です。消さないでください。画面内に見えていることを E2E で検証しています。

`maplibre-gl` は v5 系に固定しています。**v6 に上げると地図が無言で真っ黒になります**
（[AGENTS.md](./AGENTS.md) の「地図タイル」参照）。

## デプロイ

main への push で Cloudflare Workers に自動デプロイされます（`.github/workflows/deploy.yml`）。

GitHub の Settings → Secrets and variables → Actions に以下が必要です。

| シークレット | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | "Edit Cloudflare Workers" テンプレートで作成 |
| `CLOUDFLARE_ACCOUNT_ID` | `bunx wrangler whoami` で確認 |
| `UMAMI_WEBSITE_ID` | アクセス解析。未設定なら計測タグを出力しない |

手元からデプロイする場合は `bun run deploy`（初回のみ `bunx wrangler login`）。

### アクセス解析

デプロイ時のみ umami で計測します。`UMAMI_WEBSITE_ID` が `VITE_UMAMI_WEBSITE_ID` として
ビルドに渡されます。**ローカルでは何も設定しません**（開発中のアクセスを混ぜないため）。

`VITE_` 接頭辞の変数はクライアントバンドルに埋め込まれ、ブラウザから読めます。
秘密にすべき値を置かないでください。

## 技術スタック

- **TanStack Start (React)** / **TanStack Router** — フルスタック、型安全なルーティング
- **TypeScript** strict / **Vite** / **Bun**
- **Leaflet** + **react-leaflet** + **MapLibre GL** — 地図
- **Tailwind CSS**
- **Biome** — リント・整形 / **lefthook** — Git フック
- **Vitest** + **Testing Library** + **Storybook** / **Playwright** — テスト
- **Cloudflare Workers** — ホスティング

## 開発ルール

[AGENTS.md](./AGENTS.md) が Single Source of Truth です。`CLAUDE.md` はそれを import しているだけ。

## トラブルシューティング

**mise が見つからない**

```bash
export PATH="$HOME/.local/bin:$PATH" && source ~/.bashrc  # または ~/.zshrc
```

**ポート 3000 が使用中**

```bash
lsof -ti:3000 | xargs kill -9
```

**Biome の自動整形が効かない** — VS Code の Biome 拡張を入れて再起動し、`.vscode/settings.json` を確認。

**地図が真っ黒** — `maplibre-gl` が v6 になっていないか確認（v5 系に固定が必要）。
