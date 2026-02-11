# Research: Add Japan Map to Index Page

**Date**: 2026-02-10
**Feature**: 001-add-japan-map

## Overview

この機能では、indexページに日本の都道府県地図を表示する必要があります。仕様書では「mapcn」ライブラリの使用が指定されていましたが、調査の結果、mapcnは日本の都道府県地図の表示には適していないことが判明しました。

## Key Decisions

### 0. UIコンポーネントライブラリの選択

**Decision**: shadcn/ui + Tailwind CSS を使用する

**Rationale**:
- **アクセシビリティ自動確保**: @radix-uiベースで、WCAG 2.1 AA準拠が標準（憲章原則 I）
- **型安全性**: TypeScript完全対応（憲章原則 I）
- **パフォーマンス**: コンポーネント単位でインストール、バンドルサイズ最小化（憲章原則 II）
- **シンプルさ**: コピー&ペースト型、依存関係最小限（憲章原則 IV）
- **Tailwind CSS v4対応**: 最新のCSSフレームワークと統合

**使用コンポーネント**:
- `<Button />` - 再試行ボタン
- `<Tooltip />` - 都道府県名表示
- `<Alert />` - エラーメッセージ
- `<Skeleton />` - ローディング表示

### 1. 地図ライブラリの選択

**Decision**: React Leaflet + GeoJSON データソースを使用する

**Rationale**:
- **mapcnの制限**: mapcnは世界地図ベースのタイルマップライブラリで、日本の都道府県境界を個別に操作する機能がない
- **React Leafletの利点**:
  - TypeScript完全対応（憲章原則 I: 型安全性ファースト）
  - **軽量**: 42KB (gzipped) - パフォーマンス原則(II)に準拠
  - **GeoJSONネイティブサポート**: `<GeoJSON>` コンポーネントで直接対応
  - **大規模エコシステム**: 週間1,442,759ダウンロード、"Key ecosystem project"評価
  - 豊富な学習リソースとコミュニティサポート
  - ズーム・パン・タイルレイヤー機能が標準搭載
  - 宣言的APIでReact統合が容易

**Alternatives Considered**:
1. **mapcn** - 世界地図には優れているが、都道府県レベルの操作には不適
2. **react-simple-maps** - メンテナンス不活発（過去12ヶ月リリースなし）、小規模コミュニティ
3. **@react-map/japan** - 日本専用だがドキュメント不足、最終更新が9ヶ月前
4. **Mapbox GL JS** - 高性能だが有料プランが必要、バンドルサイズ大
5. **D3.js直接使用** - 学習コスト高、React統合に追加実装必要

**React Leaflet選択の決定的理由**:
- react-simple-mapsと比較して圧倒的に大きなユーザーベース（週間140万DL vs 数千DL）
- メンテナンス状況は両方とも停滞気味だが、React Leafletの方がエコシステムが安定
- バンドルサイズ42KBで軽量（パフォーマンス原則II準拠）
- GeoJSONのネイティブサポートにより実装がシンプル（原則IV準拠）

### 2. GeoJSONデータソース

**Decision**: piuccio/open-data-jp-prefectures-geojsonを使用

**Rationale**:
- 国土情報課の公式データベース（高精度）
- 都道府県境界を含む完全なGeoJSONデータ
- パブリックドメインで商用利用可能
- GitHubでオープンソースとして公開

**Data Source**: https://github.com/piuccio/open-data-jp-prefectures-geojson

### 3. インタラクション実装戦略

**Decision**: React Leafletの組み込み機能を使用

**機能マッピング**:
- **ズーム/パン**: `<MapContainer>` のズーム/パン機能（標準搭載）
- **ホバー**: `<GeoJSON>` の `onEachFeature` + Leaflet layer イベント（`mouseover`/`mouseout`）
- **クリック**: Leaflet layer の `click` イベント
- **キーボードナビゲーション**: カスタムフックで実装（`useKeyboardNav`）+ Leaflet layer の `keydown` イベント

### 4. ローディング・エラーハンドリング戦略

**Decision**: React Suspense + Error Boundaryパターン

**Rationale**:
- TanStack Startとの自然な統合
- 宣言的なエラーハンドリング
- 憲章原則III（テストファースト）に準拠しやすい構造

**Implementation Pattern**:
```tsx
<Suspense fallback={<MapLoadingIndicator />}>
  <ErrorBoundary fallback={<MapErrorFallback />}>
    <JapanMap />
  </ErrorBoundary>
</Suspense>
```

### 5. パフォーマンス最適化

**Decision**: GeoJSONデータの事前最適化 + メモ化

**Strategies**:
- **GeoJSON最適化**: 座標精度の調整、不要な属性削除でファイルサイズ削減
- **メモ化**: `React.memo()` でMapコンポーネントの不要な再レンダリングを防止
- **遅延ロード**: 地図コンポーネントを `React.lazy()` で動的インポート
- **Leaflet最適化**: タイルレイヤーのキャッシング活用、ベクタータイル使用オプション

**根拠**: 憲章原則II（パフォーマンス最適化）に準拠。React Leafletは42KBと軽量で、パフォーマンス目標を達成可能。

### 6. アクセシビリティ実装

**Decision**: ARIA属性 + カスタムキーボードナビゲーション

**Implementation**:
- 各都道府県に `role="button"` と `tabIndex` 属性
- `aria-label` で都道府県名を提供
- カスタムキーボードハンドラーで Tab/Enter/Space キーをサポート
- フォーカス状態の視覚的インジケーター（WCAG 2.1 AA準拠）

## Technical Dependencies

| 依存関係 | バージョン | 目的 |
|---------|----------|------|
| react-leaflet | ^5.0.0 | React用Leafletコンポーネント |
| leaflet | ^1.9.4 | 地図描画・インタラクション（react-leafletの依存関係） |
| @types/leaflet | ^1.9.12 | Leaflet TypeScript型定義 |
| shadcn/ui | latest | UIコンポーネントライブラリ |
| tailwindcss | ^4.1.18 | CSSフレームワーク |
| tailwindcss-animate | ^1.0.7 | アニメーションプラグイン |
| @radix-ui/* | latest | アクセシブルなプリミティブ（shadcn/ui依存） |

## Performance Targets

| メトリック | 目標値 | 根拠 |
|-----------|--------|------|
| 初期ロード時間 | < 3秒 | 仕様SC-001 |
| GeoJSONファイルサイズ | < 500KB | パフォーマンス原則II |
| 再レンダリング時間 | < 16ms (60fps) | パフォーマンス原則II |
| インタラクション応答時間 | < 100ms | 知覚可能な遅延なし |

## Best Practices Identified

### React Leaflet使用のベストプラクティス

1. **MapContainer の設定**:
   ```tsx
   <MapContainer
     center={[36, 138]}
     zoom={5}
     minZoom={5}
     maxZoom={10}
     style={{ height: '100vh', width: '100%' }}
   >
     <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
   </MapContainer>
   ```

2. **GeoJSON レイヤーのスタイリングとイベント**:
   ```tsx
   <GeoJSON
     data={japanPrefectures}
     style={(feature) => ({
       fillColor: '#3388ff',
       weight: 2,
       opacity: 1,
       color: 'white',
       fillOpacity: 0.7
     })}
     onEachFeature={(feature, layer) => {
       layer.on({
         mouseover: (e) => e.target.setStyle({ fillColor: '#CFD8DC' }),
         mouseout: (e) => e.target.setStyle({ fillColor: '#3388ff' }),
         click: (e) => console.log(feature.properties.name)
       });
     }}
   />
   ```

3. **TypeScript型定義**:
   ```tsx
   import type { Map as LeafletMap } from 'leaflet';
   import type { GeoJSON as GeoJSONType } from 'geojson';

   interface PrefectureProperties {
     name: string;
     code: string;
   }
   ```

### パフォーマンス最適化のベストプラクティス

1. **メモ化の戦略的使用**:
   - GeoJSON レイヤーのスタイル関数をメモ化
   - イベントハンドラーを `useCallback` でメモ化
   - MapContainer を `React.memo()` でラップ

2. **GeoJSON最適化**:
   - 不要な属性を削除（properties に必要なデータのみ残す）
   - 座標精度を調整（小数点以下3-4桁で十分）
   - ファイルサイズを500KB未満に維持

3. **遅延ロード戦略**:
   - 地図コンポーネントを動的インポート（`React.lazy()`）
   - Leaflet CSS を非同期ロード
   - GeoJSONデータを別チャンクに分離

## Integration Patterns

### TanStack Router統合

```tsx
// routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import 'leaflet/dist/leaflet.css' // Leaflet CSS をインポート

const JapanMapPage = lazy(() => import('@/components/JapanMapPage'))

export const Route = createFileRoute('/')({
  component: JapanMapPage,
})
```

### TanStack Query統合（将来の拡張用）

```tsx
// hooks/useJapanMapData.ts
import { useQuery } from '@tanstack/react-query'
import type { FeatureCollection } from 'geojson'

export function useJapanMapData() {
  return useQuery<FeatureCollection>({
    queryKey: ['japanMap'],
    queryFn: () => fetch('/data/japan-prefectures.json').then(r => r.json()),
    staleTime: Infinity, // GeoJSONデータは静的
  })
}
```

## Testing Strategy

### Unit Tests (Vitest)
- GeoJSON レイヤーのレンダリングロジック
- イベントハンドラーのロジック
- キーボードナビゲーション関数

### Component Tests (React Testing Library)
- 都道府県のホバー/クリック動作（Leaflet layer イベント）
- MapContainer の初期化
- キーボードナビゲーション
- エラー状態の表示
- ローディング状態の表示

### Integration Tests
- GeoJSONデータの読み込みとレンダリング
- Leaflet インタラクション（ズーム/パン）
- TanStack Router統合
- Leaflet CSS の読み込み確認

## Open Questions & Risks

### Resolved
- ✅ mapcnの適合性 → 不適、React Simple Mapsを採用
- ✅ GeoJSONデータソース → piuccio/open-data-jp-prefectures-geojson
- ✅ インタラクション実装 → React Simple Maps標準機能
- ✅ アクセシビリティ → ARIA + カスタムキーボードハンドラー

### Remaining
なし（全ての主要な技術的決定が完了）

## References

- [React Leaflet 公式ドキュメント](https://react-leaflet.js.org/)
- [Leaflet 公式ドキュメント](https://leafletjs.com/)
- [Using GeoJSON with Leaflet](https://leafletjs.com/examples/geojson/)
- [How to use Leaflet with TypeScript | MapTiler](https://docs.maptiler.com/leaflet/examples/ts-get-started/)
- [Step-by-Step Guide: Integrating Leaflet and React.js with GeoJSON](https://medevel.com/leafletjs-reactjs-maps-geojson/)
- [piuccio/open-data-jp-prefectures-geojson](https://github.com/piuccio/open-data-jp-prefectures-geojson)
- [WCAG 2.1 Level AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
