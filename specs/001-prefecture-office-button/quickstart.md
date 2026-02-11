# Quick Start: 都道府県庁舎所在地マーカー機能

**Date**: 2026-02-11
**Phase**: Phase 1 - Design & Contracts

---

## 概要

このガイドでは、都道府県庁舎所在地マーカー機能の開発を迅速に開始するための手順を説明します。

## 前提条件

- Node.js 22（miseで管理）
- Bun（パッケージマネージャー）
- Git
- 既存のJapanMap機能が実装済み

## セットアップ

### 1. ブランチの確認

```bash
# 現在のブランチを確認
git branch

# 001-prefecture-office-button ブランチにいることを確認
# もし違う場合は、以下でチェックアウト
git checkout 001-prefecture-office-button
```

### 2. 依存関係のインストール

```bash
# 必要な依存関係はすでにインストール済み
# Leaflet と React Leaflet は既存の地図機能で使用中
bun install
```

### 3. データファイルの準備

#### 庁舎所在地データの取得と変換

```bash
# スクリプトディレクトリを作成（まだなければ）
mkdir -p scripts

# CSVデータを取得
curl https://raw.githubusercontent.com/dataofjapan/land/master/prefecturalCapital.csv \
  -o scripts/prefecturalCapital.csv

# JSON変換スクリプトを実行（後で作成）
bun run scripts/convert-capital-data.ts
```

**convert-capital-data.ts** の内容（TDDで実装）:

```typescript
// scripts/convert-capital-data.ts
import { readFileSync, writeFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

interface CSVRow {
  id: string;
  nam_ja: string;
  lat: string;
  lon: string;
}

interface PrefectureOffice {
  code: string;
  name: string;
  officeName: string;
  lat: number;
  lon: number;
}

// CSVを読み込み
const csvContent = readFileSync('scripts/prefecturalCapital.csv', 'utf-8');
const records: CSVRow[] = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

// JSON形式に変換
const prefectureOffices: PrefectureOffice[] = records.map((row) => ({
  code: row.id.padStart(2, '0'), // ゼロパディング
  name: row.nam_ja,
  officeName: `${row.nam_ja}${row.nam_ja.endsWith('都') || row.nam_ja.endsWith('道') || row.nam_ja.endsWith('府') || row.nam_ja.endsWith('県') ? '庁' : ''}`,
  lat: parseFloat(row.lat),
  lon: parseFloat(row.lon),
}));

// JSONファイルとして保存
writeFileSync(
  'public/data/prefecture-offices.json',
  JSON.stringify(prefectureOffices, null, 2),
  'utf-8'
);

console.log(`✅ 変換完了: ${prefectureOffices.length}件の庁舎所在地データを生成しました`);
```

## 開発ワークフロー

### テストファースト開発（TDD）

憲章に従い、**すべてのコードはテストを先に書く**必要があります。

#### ステップ 1: テストを書く

```typescript
// src/lib/geo/prefectureOfficeData.test.ts
import { describe, it, expect } from 'vitest';
import { validatePrefectureOffice } from './prefectureOfficeData';

describe('validatePrefectureOffice', () => {
  it('should validate a correct prefecture office object', () => {
    const validOffice = {
      code: '01',
      name: '北海道',
      officeName: '北海道庁',
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(validOffice)).toBe(true);
  });

  it('should reject invalid prefecture code', () => {
    const invalidOffice = {
      code: '99', // 無効（48以上）
      name: '北海道',
      officeName: '北海道庁',
      lat: 43.064301,
      lon: 141.346874,
    };

    expect(validatePrefectureOffice(invalidOffice)).toBe(false);
  });

  // 他のテストケース...
});
```

#### ステップ 2: テストが失敗することを確認

```bash
bun test src/lib/geo/prefectureOfficeData.test.ts
```

#### ステップ 3: 実装を書く

```typescript
// src/lib/geo/prefectureOfficeData.ts
export interface PrefectureOffice {
  code: string;
  name: string;
  officeName: string;
  lat: number;
  lon: number;
}

export function validatePrefectureOffice(office: unknown): office is PrefectureOffice {
  if (typeof office !== 'object' || office === null) {
    return false;
  }

  const o = office as Record<string, unknown>;

  if (typeof o.code !== 'string' || !/^(0[1-9]|[1-4][0-9])$/.test(o.code)) {
    return false;
  }

  if (typeof o.name !== 'string' || o.name.trim().length === 0) {
    return false;
  }

  if (typeof o.officeName !== 'string' || o.officeName.trim().length === 0) {
    return false;
  }

  if (typeof o.lat !== 'number' || o.lat < -90.0 || o.lat > 90.0) {
    return false;
  }

  if (typeof o.lon !== 'number' || o.lon < -180.0 || o.lon > 180.0) {
    return false;
  }

  return true;
}
```

#### ステップ 4: テストが通ることを確認

```bash
bun test src/lib/geo/prefectureOfficeData.test.ts
```

### コンポーネント実装の流れ

1. **データフックの実装** (`usePrefectureOffices`)
   - テスト作成
   - データフェッチロジック
   - エラー処理とリトライ

2. **マーカーコンポーネントの実装** (`PrefectureOfficeMarkers`)
   - テスト作成
   - マーカーレンダリング
   - イベントハンドラー

3. **ポップアップコンポーネントの実装** (`PrefectureOfficePopup`)
   - テスト作成
   - ポップアップUI
   - アクセシビリティ対応

4. **JapanMapコンポーネントの拡張**
   - 既存テストの拡張
   - マーカーレイヤーの統合

## 開発サーバーの起動

```bash
# 開発サーバーを起動
bun dev

# ブラウザで開く
# http://localhost:3000
```

## テストの実行

```bash
# すべてのテストを実行
bun test

# 特定のファイルのテストを実行
bun test src/components/PrefectureOfficeMarkers.test.tsx

# ウォッチモード
bun test --watch

# カバレッジレポート
bun test --coverage
```

## リンティングとフォーマット

```bash
# リンティング
bun run lint

# 自動修正
bun run lint:fix

# フォーマット（Biomeを使用）
bun run format
```

## デバッグ

### React DevTools

1. ブラウザ拡張機能をインストール
2. Components タブで `PrefectureOfficeMarkers` を検索
3. Props と State を確認

### Leaflet デバッグ

```typescript
// マーカーのデバッグログ
useEffect(() => {
  console.log('Markers rendered:', capitalMarkers.length);
  console.log('Hovered capital:', hoveredCapital);
  console.log('Selected capital:', selectedCapital);
}, [capitalMarkers, hoveredCapital, selectedCapital]);
```

### ブラウザDevTools

- **Console**: エラーメッセージとログを確認
- **Network**: JSONデータの読み込みを確認
- **Performance**: レンダリングパフォーマンスを測定

## よくある問題と解決策

### 問題 1: マーカーが表示されない

**解決策**:
- JSONデータが正しく読み込まれているか確認
- ブラウザのコンソールでエラーを確認
- Leafletマップが正しく初期化されているか確認

```bash
# データファイルの存在確認
ls -la public/data/prefecture-offices.json

# JSONの構文確認
cat public/data/prefecture-offices.json | jq .
```

### 問題 2: ホバーイベントが動作しない

**解決策**:
- マーカーに`eventHandlers`が正しく設定されているか確認
- イベントハンドラーが`useCallback`でメモ化されているか確認
- CSSの`pointer-events`が無効になっていないか確認

### 問題 3: テストが失敗する

**解決策**:
- テストファイルのimportパスを確認
- モックデータが正しいか確認
- 非同期処理に`async/await`を使用しているか確認

## 次のステップ

1. `/speckit.tasks` を実行してタスクリストを生成
2. タスクを依存関係順に実装
3. 各タスク完了後にテストを実行
4. すべてのテストが通ったらコミット

## 参考資料

- [仕様書](./spec.md)
- [実装計画](./plan.md)
- [リサーチ結果](./research.md)
- [データモデル](./data-model.md)
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [Vitest Documentation](https://vitest.dev/)

---

**作成日**: 2026-02-11
**最終更新**: 2026-02-11
