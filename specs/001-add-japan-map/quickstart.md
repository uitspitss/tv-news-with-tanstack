# Quick Start: Add Japan Map to Index Page

**Feature**: 001-add-japan-map
**Date**: 2026-02-10

このガイドでは、日本地図機能を最速で理解し、開発を開始するための情報を提供します。

## 5分で理解する

### 何を作るのか

インデックスページに日本の都道府県地図を表示し、ユーザーが以下の操作を行えるようにします：

- ✅ 地図をズーム・パンで拡大縮小
- ✅ 都道府県をホバーしてハイライト表示
- ✅ 都道府県をクリックして名前を表示
- ✅ キーボード（Tab/Enter/Space）で都道府県を選択
- ✅ エラー時に再試行ボタンを表示
- ✅ 読み込み中にローディング表示

### 技術スタック

| 技術 | 用途 |
|------|------|
| React Simple Maps | 地図レンダリング |
| GeoJSON | 都道府県境界データ |
| shadcn/ui | UIコンポーネント（Button, Tooltip, Alert, Skeleton） |
| Tailwind CSS v4 | CSSフレームワーク |
| React Suspense | ローディング管理 |
| Error Boundary | エラーハンドリング |

### アーキテクチャ概要

```text
┌─────────────────────────────────────────────┐
│           src/routes/index.tsx              │
│  (TanStack Router - インデックスページ)      │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│        React Suspense + Error Boundary      │
│  (ローディング・エラーハンドリング)           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       src/components/JapanMap.tsx           │
│  (メイン地図コンポーネント)                  │
│  ├─ React Simple Maps                       │
│  ├─ useMapInteraction (インタラクション)     │
│  └─ useKeyboardNav (キーボード操作)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│    public/data/japan-prefectures.json       │
│  (GeoJSON - 47都道府県データ)                │
└─────────────────────────────────────────────┘
```

## セットアップ（2分）

### 1. 依存関係のインストール

**✅ 完了済み**: 以下のパッケージは既にインストール済みです：

```bash
# 既にインストール済み
✅ react-simple-maps
✅ d3-geo
✅ shadcn/ui (button, tooltip, alert, skeleton)
✅ tailwindcss ^4.1.18
✅ tailwindcss-animate
```

新規追加する場合のみ：
```bash
bun install react-simple-maps d3-geo
```

### 2. GeoJSONデータの取得

```bash
# publicディレクトリ作成
mkdir -p public/data

# GeoJSONデータをダウンロード（piuccio/open-data-jp-prefectures-geojson）
curl -o public/data/japan-prefectures.json \
  https://raw.githubusercontent.com/piuccio/open-data-jp-prefectures-geojson/main/data/prefectures.json
```

**注意**: 実際のGeoJSONファイルのURLは調整が必要です。データソースの詳細は `research.md` を参照してください。

### 3. 型定義の追加

`src/lib/geo/japanGeoData.ts` を作成（詳細は `data-model.md` 参照）:

```typescript
export interface PrefectureProperties {
  name: string;
  code: string;
}

export interface Prefecture {
  type: 'Feature';
  properties: PrefectureProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface JapanMapData {
  type: 'FeatureCollection';
  features: Prefecture[];
}
```

## 開発の流れ（TDD）

このプロジェクトは**テストファースト開発**を採用しています。以下の順序で開発してください：

### Phase 1: テストを書く

```bash
# コンポーネントテストファイルを作成
touch src/components/JapanMap.test.tsx
```

**最初にテストケースを定義**:
```typescript
// src/components/JapanMap.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JapanMap } from './JapanMap';

describe('JapanMap', () => {
  it('should render map container', () => {
    render(<JapanMap />);
    expect(screen.getByRole('img', { name: /japan map/i })).toBeInTheDocument();
  });

  it('should display 47 prefectures', async () => {
    render(<JapanMap />);
    // GeoJSONデータが読み込まれたら47都道府県が表示される
    const prefectures = await screen.findAllByRole('button');
    expect(prefectures).toHaveLength(47);
  });
});
```

### Phase 2: テストが失敗することを確認

```bash
bun test src/components/JapanMap.test.tsx
# ❌ テストが失敗（コンポーネントが存在しないため）
```

### Phase 3: 最小限の実装

```typescript
// src/components/JapanMap.tsx
export function JapanMap() {
  return (
    <div role="img" aria-label="Japan Map">
      {/* React Simple Maps実装 */}
    </div>
  );
}
```

### Phase 4: テストが通ることを確認

```bash
bun test src/components/JapanMap.test.tsx
# ✅ テストが成功
```

### Phase 5: リファクタリング

テストを保持しながら、コードを改善します。

## 主要コンポーネント

### shadcn/ui コンポーネント（既にインストール済み）

| コンポーネント | 用途 | パス |
|--------------|------|------|
| `<Skeleton />` | 地図ローディング表示 | `src/components/ui/skeleton.tsx` |
| `<Alert />` | エラーメッセージ表示 | `src/components/ui/alert.tsx` |
| `<Button />` | 再試行ボタン | `src/components/ui/button.tsx` |
| `<Tooltip />` | 都道府県名表示 | `src/components/ui/tooltip.tsx` |

**使用例**:
```tsx
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
```

### JapanMap.tsx（メインコンポーネント）

**責務**:
- GeoJSONデータの読み込み
- React Simple Mapsで地図をレンダリング
- ホバー・クリック・キーボードイベントの管理
- 都道府県名の表示

**Props**:
```typescript
interface JapanMapProps {
  /** 初期ズームレベル（デフォルト: 1） */
  initialZoom?: number;
  /** 初期中心座標（デフォルト: [138, 36]） */
  initialCenter?: [number, number];
  /** 都道府県クリック時のコールバック */
  onPrefectureClick?: (prefectureCode: string) => void;
}
```

### useMapInteraction（カスタムフック）

**責務**:
- ホバー状態の管理
- クリック状態の管理
- フォーカス状態の管理

**返り値**:
```typescript
interface MapInteractionReturn {
  hoveredPrefecture: string | null;
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;
  handleMouseEnter: (prefectureCode: string) => void;
  handleMouseLeave: () => void;
  handleClick: (prefectureCode: string) => void;
}
```

### useKeyboardNav（カスタムフック）

**責務**:
- Tab キーで都道府県間を移動
- Enter/Space キーで都道府県を選択
- フォーカス状態の管理

**返り値**:
```typescript
interface KeyboardNavReturn {
  focusedIndex: number;
  handleKeyDown: (event: KeyboardEvent) => void;
  moveFocus: (direction: 'next' | 'prev') => void;
}
```

## テスト戦略

### ユニットテスト（Vitest）

**対象**:
- `useMapInteraction` - インタラクション状態管理
- `useKeyboardNav` - キーボードナビゲーション
- `mapUtils.ts` - ユーティリティ関数

**実行コマンド**:
```bash
bun test src/hooks/useMapInteraction.test.ts
bun test src/hooks/useKeyboardNav.test.ts
bun test src/lib/geo/mapUtils.test.ts
```

### コンポーネントテスト（React Testing Library）

**対象**:
- `JapanMap.tsx` - 地図コンポーネント
- `MapLoadingIndicator.tsx` - ローディングUI
- `MapErrorFallback.tsx` - エラーUI
- `PrefectureTooltip.tsx` - ツールチップ

**実行コマンド**:
```bash
bun test src/components/JapanMap.test.tsx
bun test src/components/MapLoadingIndicator.test.tsx
bun test src/components/MapErrorFallback.test.tsx
bun test src/components/PrefectureTooltip.test.tsx
```

### 統合テスト

**対象**:
- GeoJSONデータの読み込み
- ズーム/パン操作
- ホバー・クリック・キーボードの統合動作

**実行コマンド**:
```bash
bun test tests/integration/japan-map.test.ts
```

## よくある問題と解決策

### Q1: GeoJSONデータが読み込めない

**症状**: `404 Not Found` エラー

**解決策**:
1. `public/data/japan-prefectures.json` が存在するか確認
2. ファイルパスが正しいか確認（`/data/japan-prefectures.json`）
3. Viteの静的アセット設定を確認

### Q2: 地図が表示されない

**症状**: 空白のページ

**解決策**:
1. ブラウザのコンソールでエラーを確認
2. React Simple Mapsのバージョンを確認（`^3.0.0`）
3. GeoJSONデータの形式を確認（`validateJapanMapData` 関数を使用）

### Q3: パフォーマンスが悪い

**症状**: 地図の操作が重い

**解決策**:
1. `React.memo()` でコンポーネントをメモ化
2. GeoJSONをTopoJSON形式に変換
3. 座標精度を下げる（小数点以下3桁）

### Q4: キーボードナビゲーションが動作しない

**症状**: Tab キーで移動できない

**解決策**:
1. 各都道府県に `tabIndex` 属性が設定されているか確認
2. フォーカススタイルが適用されているか確認
3. `role="button"` が設定されているか確認

## 次のステップ

1. **詳細な実装計画**: `plan.md` を参照
2. **データモデル**: `data-model.md` でTypeScript型定義を確認
3. **タスクリスト**: `/speckit.tasks` コマンドで実装タスクを生成
4. **テンプレート**: `.specify/templates/` でテストテンプレートを確認

## 参考リンク

- [React Simple Maps 公式ドキュメント](https://www.react-simple-maps.io/)
- [GeoJSON 仕様](https://geojson.org/)
- [TanStack Router ドキュメント](https://tanstack.com/router/latest)
- [Vitest ドキュメント](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

## 開発チェックリスト

開発を始める前に、以下を確認してください：

- [x] 依存関係がインストールされている（`react-simple-maps`, `d3-geo`, `shadcn/ui`, `tailwindcss`）
- [ ] GeoJSONデータが配置されている（`public/data/japan-prefectures.json`）
- [ ] 型定義が作成されている（`src/lib/geo/japanGeoData.ts`）
- [ ] テスト環境が整っている（`bun test` が動作する）
- [ ] TDDワークフローを理解している（テスト→失敗→実装→成功→リファクタリング）
- [ ] 憲章の原則を理解している（型安全性、パフォーマンス、テストファースト、シンプルさ、CI/CD）

---

**準備ができたら、`/speckit.tasks` コマンドでタスクリストを生成し、実装を開始してください！**
