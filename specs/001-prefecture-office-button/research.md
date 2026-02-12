# Research: 都道府県庁舎所在地マーカー機能

**Date**: 2026-02-11
**Phase**: Phase 0 - Outline & Research

---

## 1. 庁舎所在地データソース

### Decision
**dataofjapan/land の prefecturalCapital.csv** を推奨データソースとして選定します。

### Rationale

**データの完全性**:
- 47都道府県すべてのデータを網羅
- 座標精度が小数点以下6桁で統一されており、高精度
- 座標系: 世界測地系（WGS84）- Leafletと互換性あり

**ライセンス**:
- GitHubで公開、オープンデータとして利用可能
- 商用利用可能

**データ形式**:
- CSV形式（JSONへの変換が容易）
- UTF-8エンコーディング
- シンプルな構造（id, nam_ja, lat, lon）

**データ構造例**:
```csv
id,nam_ja,lat,lon
1,北海道,43.064301,141.346874
13,東京都,35.689487,139.691706
```

### Alternatives Considered

1. **国土地理院API**: APIコールが必要でレイテンシーあり。47件の静的データには過剰。
2. **ASTI アマノ技研**: 2026年1月時点の最新データだが、CSVダウンロードのみ。CI/CD統合が複雑。
3. **four4to6/pref_lat_lon**: JSON形式で便利だが、更新頻度不明。

### Implementation Notes

**推奨アプローチ**: ビルド時の静的データ生成

```bash
# データ取得スクリプト
curl https://raw.githubusercontent.com/dataofjapan/land/master/prefecturalCapital.csv \
  -o scripts/prefecturalCapital.csv

# JSON変換（Bunスクリプト）
bun run scripts/convert-capital-data.ts
```

**TypeScript型定義**:
```typescript
interface PrefecturalCapital {
  id: string;          // "01" - "47"
  name: string;        // "北海道", "東京都"
  lat: number;         // 43.064301
  lon: number;         // 141.346874
}
```

**既存のGeoJSONとの統合**:
- 既存: `/public/data/japan-prefectures.json`（境界線データ）
- 追加: `/public/data/prefectural-capitals.json`（庁舎座標）
- `code`または`id`プロパティで両者を関連付け

---

## 2. Leaflet マーカーベストプラクティス

### Decision
**DOM ベースの L.divIcon + L.Marker** を使用し、カスタム SVG/HTML アイコンで実装します。

### Rationale

**パフォーマンス**:
- **47個のマーカーは少量** - Canvas最適化は不要
- Canvas vs DOM: 「10,000個以上のマーカー」で初めてボトルネックになる
- DOMベースでも現代のブラウザで高速

**柔軟性とカスタマイズ性**:
- DOMベースはCSSスタイリング、ホバーエフェクト、アニメーションが容易
- React Leafletとの統合がスムーズ

**アクセシビリティ**:
- **DOM要素はキーボードナビゲーション対応が容易**
- ARIA属性の付与が可能
- スクリーンリーダー対応

**カスタムアイコン実装パターン**:
```typescript
import L from 'leaflet';

const capitalIcon = L.divIcon({
  className: 'prefecture-capital-marker',
  html: `<div class="marker-icon">
    <svg><!-- カスタムアイコン --></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

<Marker
  position={[lat, lon]}
  icon={capitalIcon}
  eventHandlers={{
    click: handleClick,
    mouseover: handleMouseOver,
  }}
>
  <Popup>{prefectureName}</Popup>
</Marker>
```

### Alternatives Considered

1. **Canvas レンダリング**: 大量マーカーでのパフォーマンス向上が利点だが、47個には過剰。カスタマイズが困難。
2. **マーカークラスタリング**: 密集地域での視認性向上が利点だが、47個では不要。日本地図では適度に分散。
3. **React コンポーネントマーカー**: JSXで記述可能だが、追加依存関係とContext更新問題あり。

### Implementation Notes

**アクセシビリティ必須事項**:
```typescript
<Marker
  position={[lat, lon]}
  icon={capitalIcon}
  alt={`${prefectureName}庁舎`}  // スクリーンリーダー用
>
  <Popup>
    <div role="dialog" aria-label={`${prefectureName}の情報`}>
      {/* 内容 */}
    </div>
  </Popup>
</Marker>
```

**スタイリング戦略**:
```css
.prefecture-capital-marker {
  transition: transform 0.2s ease;
}

.prefecture-capital-marker:hover {
  transform: scale(1.2);
}

.prefecture-capital-marker:focus {
  outline: 3px solid #0066cc; /* WCAG AA準拠 */
}
```

**パフォーマンス最適化**:
- `useMemo` でマーカー配列をメモ化
- `useCallback` でイベントハンドラーをメモ化
- `React.memo` でマーカーコンポーネントをラップ

---

## 3. React Leaflet での状態管理

### Decision
既存の **useMapInteraction フック** を拡張し、マーカー状態を追加します。`useState` + `useCallback` + `useMemo` のパターンを採用します。

### Rationale

**既存コードとの一貫性**:
- 現在のプロジェクトは既に `useMapInteraction` フックで都道府県の状態管理を実装済み
- 同じパターンを拡張することで、学習コストとメンテナンスコストを最小化

**状態管理の分離**:
```typescript
// 既存
interface MapInteractionState {
  hoveredPrefecture: string | null;
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;
}

// 拡張
interface MapInteractionState {
  hoveredPrefecture: string | null;
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;
  // マーカー用状態を追加
  hoveredCapital: string | null;
  selectedCapital: string | null;
  focusedCapital: string | null;
}
```

**useRef vs useState の使い分け**:

| 用途 | 推奨 | 理由 |
|------|------|------|
| マップインスタンス | `useRef` | 再レンダリング不要、Leaflet APIアクセス用 |
| 選択状態 | `useState` | UI更新が必要、React管理下 |
| ホバー状態 | `useState` | ツールチップ表示に必要 |
| イベントハンドラー | `useCallback` | 参照安定性確保、メモ化 |

### Alternatives Considered

1. **グローバル状態管理（Zustand, Jotai）**: 追加依存関係、学習コスト、47個の状態には過剰。
2. **useReducer パターン**: ボイラープレート増加、シンプルな状態には過剰。
3. **Leaflet のネイティブイベント管理のみ**: React コンポーネントとの同期困難。

### Implementation Notes

**フック拡張の具体例**:

```typescript
// src/hooks/useMapInteraction.ts の拡張

export interface MapInteractionState {
  // 既存
  hoveredPrefecture: string | null;
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;

  // 新規追加
  hoveredCapital: string | null;
  selectedCapital: string | null;
  focusedCapital: string | null;
}

export function useMapInteraction(): MapInteractionReturn {
  // 既存の状態
  const [hoveredPrefecture, setHoveredPrefecture] = useState<string | null>(null);
  const [selectedPrefecture, setSelectedPrefecture] = useState<string | null>(null);
  const [focusedPrefecture, setFocusedPrefecture] = useState<string | null>(null);

  // 新規追加: マーカー用状態
  const [hoveredCapital, setHoveredCapital] = useState<string | null>(null);
  const [selectedCapital, setSelectedCapital] = useState<string | null>(null);
  const [focusedCapital, setFocusedCapital] = useState<string | null>(null);

  // マーカー用ハンドラー
  const handleCapitalMouseEnter = useCallback((code: string) => {
    setHoveredCapital(code);
  }, []);

  const handleCapitalClick = useCallback((code: string) => {
    setSelectedCapital((prev) => prev === code ? null : code);
  }, []);

  // ... 既存ハンドラーと新規ハンドラーを返す
}
```

**メモリリーク防止**:

```typescript
useEffect(() => {
  if (!markerRef.current) return;

  const marker = markerRef.current;

  // イベントリスナー登録
  marker.on('mouseover', () => handleCapitalMouseEnter(prefectureCode));
  marker.on('mouseout', () => handleCapitalMouseLeave());
  marker.on('click', () => handleCapitalClick(prefectureCode));

  // クリーンアップ関数（メモリリーク防止）
  return () => {
    marker.off('mouseover');
    marker.off('mouseout');
    marker.off('click');
  };
}, [prefectureCode, handleCapitalMouseEnter, handleCapitalMouseLeave, handleCapitalClick]);
```

**パフォーマンス最適化チェックリスト**:

- [ ] `useMemo` でマーカー配列をメモ化
- [ ] `useCallback` でイベントハンドラーをメモ化
- [ ] マーカーコンポーネントを `React.memo` でラップ
- [ ] 不要な再レンダリングを React DevTools でプロファイリング
- [ ] Chrome DevTools Performance タブでボトルネック検証

---

## まとめ

### 推奨実装アプローチ

1. **データソース**: dataofjapan/land の CSV をビルド時に JSON 変換して使用
2. **マーカー実装**: DOM ベースの `L.divIcon` でカスタムアイコン
3. **状態管理**: 既存の `useMapInteraction` フックを拡張

### 実装順序

1. データ取得・変換スクリプトの作成
2. TypeScript型定義の追加
3. `useMapInteraction` フックの拡張
4. マーカーコンポーネントの実装
5. アクセシビリティ対応（ARIA、キーボードナビゲーション）
6. スタイリング・アニメーション
7. テスト作成（TDD）

### 注意事項

- **アクセシビリティは必須**: alt属性、ARIA、キーボードナビゲーション
- **メモリリーク対策**: useEffect のクリーンアップを徹底
- **パフォーマンス**: 47個でも useMemo/useCallback を適用
- **既存コードとの整合性**: パターンを踏襲し、一貫性を維持
