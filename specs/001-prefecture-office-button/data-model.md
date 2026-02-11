# Data Model: 都道府県庁舎所在地マーカー機能

**Date**: 2026-02-11
**Phase**: Phase 1 - Design & Contracts

---

## エンティティ概要

この機能では、以下の2つの主要なエンティティを扱います：

1. **Prefecture Office Location（庁舎所在地）**: 都道府県庁舎の地理的位置データ
2. **Prefecture（都道府県）**: 既存のGeoJSONデータで定義されている行政区分

## エンティティ詳細

### 1. Prefecture Office Location（庁舎所在地）

都道府県の庁舎（県庁所在地）の地理的位置を表すエンティティ。

#### 属性

| 属性名 | 型 | 必須 | 説明 | 制約 |
|--------|------|------|------|------|
| `code` | `string` | ✅ | 都道府県コード（2桁） | "01"〜"47"、ユニーク |
| `name` | `string` | ✅ | 都道府県名 | 空でない、例："北海道"、"東京都" |
| `officeName` | `string` | ✅ | 庁舎名 | 空でない、例："北海道庁"、"東京都庁" |
| `lat` | `number` | ✅ | 緯度（世界測地系WGS84） | -90.0 〜 90.0、小数点以下6桁精度 |
| `lon` | `number` | ✅ | 経度（世界測地系WGS84） | -180.0 〜 180.0、小数点以下6桁精度 |

#### TypeScript 型定義

```typescript
/**
 * 都道府県庁舎所在地データ
 */
export interface PrefectureOffice {
  /** 都道府県コード（2桁、ゼロパディング） */
  code: string;

  /** 都道府県名（例：「北海道」、「東京都」） */
  name: string;

  /** 庁舎名（例：「北海道庁」、「東京都庁」） */
  officeName: string;

  /** 緯度（世界測地系WGS84、小数点以下6桁精度） */
  lat: number;

  /** 経度（世界測地系WGS84、小数点以下6桁精度） */
  lon: number;
}

/**
 * 都道府県庁舎所在地データの配列
 */
export type PrefectureOfficeData = PrefectureOffice[];
```

#### バリデーションルール

```typescript
/**
 * 都道府県庁舎所在地データのバリデーション
 */
export function validatePrefectureOffice(office: unknown): office is PrefectureOffice {
  if (typeof office !== 'object' || office === null) {
    return false;
  }

  const o = office as Record<string, unknown>;

  // code: 2桁の文字列、"01"〜"47"
  if (typeof o.code !== 'string' || !/^(0[1-9]|[1-4][0-9])$/.test(o.code)) {
    return false;
  }

  // name: 空でない文字列
  if (typeof o.name !== 'string' || o.name.trim().length === 0) {
    return false;
  }

  // officeName: 空でない文字列
  if (typeof o.officeName !== 'string' || o.officeName.trim().length === 0) {
    return false;
  }

  // lat: 数値、-90.0 〜 90.0
  if (typeof o.lat !== 'number' || o.lat < -90.0 || o.lat > 90.0) {
    return false;
  }

  // lon: 数値、-180.0 〜 180.0
  if (typeof o.lon !== 'number' || o.lon < -180.0 || o.lon > 180.0) {
    return false;
  }

  return true;
}
```

#### データ例

```json
[
  {
    "code": "01",
    "name": "北海道",
    "officeName": "北海道庁",
    "lat": 43.064301,
    "lon": 141.346874
  },
  {
    "code": "13",
    "name": "東京都",
    "officeName": "東京都庁",
    "lat": 35.689487,
    "lon": 139.691706
  },
  {
    "code": "27",
    "name": "大阪府",
    "officeName": "大阪府庁",
    "lat": 34.686555,
    "lon": 135.519546
  }
]
```

### 2. Prefecture（都道府県）

既存のGeoJSONデータで定義されている都道府県エンティティ（参照のみ、変更なし）。

#### 既存属性（参照）

| 属性名 | 型 | 説明 |
|--------|------|------|
| `code` | `string` | 都道府県コード（2桁） |
| `name` | `string` | 都道府県名 |
| `geometry` | `GeoJSON.MultiPolygon` | 都道府県の境界線ポリゴン |

#### TypeScript 型定義（既存）

```typescript
/**
 * 既存のGeoJSONデータ構造（参照のみ）
 */
export interface PrefectureFeature {
  type: 'Feature';
  properties: {
    code: string;
    name: string;
  };
  geometry: {
    type: 'MultiPolygon';
    coordinates: number[][][][];
  };
}

export interface JapanMapData {
  type: 'FeatureCollection';
  features: PrefectureFeature[];
}
```

## エンティティ関係

```text
┌─────────────────────────┐
│ Prefecture              │
│ (既存GeoJSONデータ)      │
├─────────────────────────┤
│ code: string            │◄─────┐
│ name: string            │      │ 1:1
│ geometry: MultiPolygon  │      │
└─────────────────────────┘      │
                                  │
                                  │
┌─────────────────────────┐      │
│ PrefectureOffice        │      │
│ (新規データ)             │      │
├─────────────────────────┤      │
│ code: string            │──────┘
│ name: string            │
│ officeName: string      │
│ lat: number             │
│ lon: number             │
└─────────────────────────┘
```

**関係性**: PrefectureOffice と Prefecture は `code` プロパティで 1:1 の関係を持つ。各都道府県には1つの庁舎所在地が対応する。

## 状態管理データ構造

### マーカーインタラクション状態

マーカーのホバー、選択、フォーカス状態を管理するための拡張型定義。

```typescript
/**
 * マーカーインタラクション状態（既存のMapInteractionStateを拡張）
 */
export interface ExtendedMapInteractionState {
  // 既存の都道府県ポリゴン状態
  hoveredPrefecture: string | null;
  selectedPrefecture: string | null;
  focusedPrefecture: string | null;

  // 新規追加: 庁舎所在地マーカー状態
  hoveredCapital: string | null;    // ホバー中の都道府県コード
  selectedCapital: string | null;   // 選択中の都道府県コード
  focusedCapital: string | null;    // フォーカス中の都道府県コード（キーボードナビゲーション）
}
```

### ポップアップ表示状態

```typescript
/**
 * ポップアップ表示状態
 */
export interface PopupState {
  /** ポップアップが表示されている都道府県コード（nullの場合は非表示） */
  prefectureCode: string | null;

  /** ポップアップの位置（緯度・経度） */
  position: { lat: number; lon: number } | null;

  /** ポップアップに表示する都道府県名 */
  prefectureName: string | null;
}
```

## データフローチャート

```text
┌─────────────────────────────────┐
│ Static Data Source              │
│ /public/data/                   │
│ prefecture-offices.json         │
└─────────────┬───────────────────┘
              │
              │ Fetch at runtime
              ▼
┌─────────────────────────────────┐
│ usePrefectureOffices Hook       │
│ (Custom Hook)                   │
├─────────────────────────────────┤
│ - Fetch JSON data               │
│ - Validate data                 │
│ - Error handling with retry     │
│ - Cache in state                │
└─────────────┬───────────────────┘
              │
              │ Provide data to component
              ▼
┌─────────────────────────────────┐
│ PrefectureOfficeMarkers         │
│ (React Component)               │
├─────────────────────────────────┤
│ - Render markers on map         │
│ - Handle user interactions      │
│ - Manage marker states          │
└─────────────┬───────────────────┘
              │
              │ Update state
              ▼
┌─────────────────────────────────┐
│ useMapInteraction Hook          │
│ (Extended)                      │
├─────────────────────────────────┤
│ - hoveredCapital                │
│ - selectedCapital               │
│ - focusedCapital                │
└─────────────────────────────────┘
```

## データ変換

### CSV から JSON への変換

リサーチで選定したdataofjapan/landのCSVデータを、アプリケーションで使用するJSON形式に変換する。

**入力（CSV）**:
```csv
id,nam_ja,lat,lon
1,北海道,43.064301,141.346874
13,東京都,35.689487,139.691706
```

**出力（JSON）**:
```json
[
  {
    "code": "01",
    "name": "北海道",
    "officeName": "北海道庁",
    "lat": 43.064301,
    "lon": 141.346874
  },
  {
    "code": "13",
    "name": "東京都",
    "officeName": "東京都庁",
    "lat": 35.689487,
    "lon": 139.691706
  }
]
```

**変換ロジック**:
- `id` → `code`: ゼロパディングで2桁に変換（1 → "01"）
- `nam_ja` → `name`: そのまま
- `nam_ja` → `officeName`: 「〜庁」を追加（北海道 → 北海道庁、東京都 → 東京都庁）
- `lat`, `lon`: そのまま（number型）

## ファイル配置

```text
src/lib/geo/
├── prefectureOfficeData.ts     # 型定義、バリデーション関数
└── prefectureOfficeUtils.ts    # データ変換ユーティリティ

public/data/
└── prefecture-offices.json     # 静的データファイル（ビルド時生成）

scripts/
└── convert-capital-data.ts     # CSV→JSON変換スクリプト
```

## スキーマバージョニング

### Version 1.0.0（初版）

- PrefectureOffice エンティティの初期定義
- 5つの必須プロパティ: code, name, officeName, lat, lon
- Prefecture エンティティとの 1:1 関係

### 将来の拡張可能性（Out of Scope）

以下は現在のスコープ外ですが、将来の拡張として検討可能：
- 住所情報（address）
- 電話番号（phone）
- 公式ウェブサイトURL（website）
- 営業時間（businessHours）
- バリアフリー情報（accessibility）

---

**作成日**: 2026-02-11
**最終更新**: 2026-02-11
**バージョン**: 1.0.0
