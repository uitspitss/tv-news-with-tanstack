# Implementation Plan: Add Japan Map to Index Page

**Branch**: `001-add-japan-map` | **Date**: 2026-02-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-add-japan-map/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

インデックスページに日本の都道府県地図を追加し、ユーザーが地図をズーム・パン操作し、都道府県をホバー・クリックして情報を確認できるようにする。当初「mapcn」ライブラリが指定されていたが、調査の結果、都道府県レベルの操作には不適と判明。代わりに**React Leaflet + GeoJSONデータ**を採用し、TypeScript型安全性、パフォーマンス最適化、アクセシビリティ要件を満たす実装を行う。

## Technical Context

**Language/Version**: TypeScript 5.x (strictモード) + Node.js 22 (miseで管理)
**Primary Dependencies**:
- React 19.2+ (UI)
- TanStack Start 1.159+ (SSR/ルーティング)
- TanStack Router 1.158+ (型安全ルーティング)
- react-leaflet ^5.0.0 (React用Leafletコンポーネント)
- leaflet ^1.9.4 (地図レンダリング・インタラクション)
- @types/leaflet ^1.9.12 (TypeScript型定義)
- shadcn/ui (UIコンポーネント: Button, Tooltip, Alert, Skeleton)
- Tailwind CSS ^4.1.18 (CSSフレームワーク)
- @radix-ui/* (アクセシビリティプリミティブ)

**Storage**: 静的GeoJSONファイル（public/data/japan-prefectures.json）
**Testing**:
- Vitest (ユニット・統合テスト)
- React Testing Library (コンポーネントテスト)
- MSW (APIモック - 将来のAPI統合用)

**Target Platform**: Cloudflare Workers（SSR） + モダンブラウザ（ES6+、Canvas/SVG サポート）
**Project Type**: Web（TanStack Startフルスタック）
**Performance Goals**:
- 初期ページロード: 3秒以内（3G接続）
- 地図レンダリング: 60fps維持
- インタラクション応答: < 100ms
- GeoJSONファイルサイズ: < 500KB
- Leafletライブラリサイズ: 42KB (gzipped)

**Constraints**:
- ブラウザビューポートの90%以上を地図が占有
- 320px〜4K解像度まで対応
- WCAG 2.1 Level AA準拠（フォーカスインジケーター 3:1コントラスト比）
- 200ms遅延後のローディング表示
- 0.5秒以内の都道府県名表示

**Scale/Scope**:
- 1機能（日本地図表示）
- 47都道府県の操作
- 単一ページ（indexルート）
- 約3〜5コンポーネント

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ 原則 I: 型安全性ファースト

**Status**: 合格

- TypeScript strictモード有効（tsconfig.json）
- React Leaflet は TypeScript型定義を提供（@types/leaflet も使用）
- 全コンポーネントにprops型定義を適用
- GeoJSONデータに型定義を追加（PrefectureProperties interface）
- Leaflet型定義により地図API呼び出しも型安全

### ✅ 原則 II: パフォーマンス最適化

**Status**: 合格

**対応策**:
- React.memo()でMapコンポーネントをメモ化
- React.lazy()で地図コンポーネントを動的インポート
- GeoJSON最適化（不要な属性削除、座標精度調整）
- useCallback()でイベントハンドラーをメモ化
- Leaflet軽量バンドル（42KB gzipped）
- 初期ページロード目標: 3秒（SC-001）
- 60fps維持（パフォーマンス目標）

### ✅ 原則 III: テストファースト開発（絶対必須）

**Status**: 合格

**テスト計画**:
1. **最初にテストを書く** - コンポーネント仕様からテストケースを作成
2. **ユーザー承認** - テストシナリオが要件と一致するか確認
3. **テストが失敗** - 実装前にテストが正しく失敗することを確認
4. **実装** - テストを通す最小限のコード
5. **テストが通る** - 全テストが合格
6. **リファクタリング** - テストを保持しながら改善

**テストカバレッジ**:
- **Unit**: 地図データ変換、キーボードナビゲーションロジック
- **Component**: ホバー/クリックイベント、キーボード操作、エラー/ローディング状態
- **Integration**: GeoJSONデータ読み込み、ズーム/パン操作

### ✅ 原則 IV: シンプルさとYAGNI

**Status**: 合格

**適用内容**:
- 今必要な機能のみ実装（都道府県表示、基本インタラクション）
- 早すぎる抽象化を回避（3コンポーネント程度のシンプル構造）
- 複雑な状態管理ライブラリ不使用（React標準state/Suspenseで十分）
- 継承より合成（React Composition）

**回避事項**:
- ニュースデータ統合（将来の機能）
- 高度な地図機能（ルート描画、複雑なアニメーション）
- 過剰な設定オプション

### ✅ 原則 V: CI/CD自動化

**Status**: 合格

**自動化内容**:
- Pre-commitフック: biome（リント・フォーマット）、型チェック（既存設定を利用）
- CIパイプライン: GitHub Actions（既存）で全テスト実行
- ビルド検証: `bun run build` で本番ビルド確認
- デプロイメント: Cloudflare Workers（既存パイプライン利用）

### 📊 Constitution Check結果

| 原則 | ステータス | 備考 |
|------|----------|------|
| I. 型安全性ファースト | ✅ 合格 | TypeScript strict、全型定義 |
| II. パフォーマンス最適化 | ✅ 合格 | メモ化、遅延ロード、TopoJSON |
| III. テストファースト開発 | ✅ 合格 | TDDワークフロー遵守 |
| IV. シンプルさとYAGNI | ✅ 合格 | 最小限の実装、早すぎる抽象化なし |
| V. CI/CD自動化 | ✅ 合格 | 既存パイプライン活用 |

**総合判定**: ✅ **全原則合格 - Phase 0研究への進行を承認**

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/                       # shadcn/ui コンポーネント（自動生成）
│   │   ├── button.tsx            # Button コンポーネント
│   │   ├── tooltip.tsx           # Tooltip コンポーネント
│   │   ├── alert.tsx             # Alert コンポーネント
│   │   └── skeleton.tsx          # Skeleton コンポーネント
│   ├── JapanMap.tsx              # メイン地図コンポーネント
│   ├── JapanMap.test.tsx         # コンポーネントテスト
│   ├── MapLoadingIndicator.tsx   # ローディングUI（Skeletonを使用）
│   ├── MapErrorFallback.tsx      # エラーUI（Alert + Buttonを使用）
│   └── PrefectureTooltip.tsx     # 都道府県名表示（Tooltipを使用）
├── hooks/
│   ├── useKeyboardNav.ts         # キーボードナビゲーション
│   ├── useKeyboardNav.test.ts    # フックテスト
│   └── useMapInteraction.ts      # 地図インタラクション管理
├── lib/
│   ├── geo/
│   │   ├── japanGeoData.ts       # GeoJSON型定義
│   │   └── mapUtils.ts           # 地図ユーティリティ関数
│   └── geo/mapUtils.test.ts      # ユーティリティテスト
├── routes/
│   └── index.tsx                 # インデックスページ（既存ファイルを更新）
└── test/
    └── setup.ts                  # テスト設定（既存）

public/
└── data/
    └── japan-prefectures.json    # GeoJSONデータ（新規）

tests/                            # 既存のテストディレクトリ
└── integration/
    └── japan-map.test.ts         # 統合テスト（新規）
```

**Structure Decision**:

TanStack Startの単一プロジェクト構造（Webアプリケーション）を採用。既存の `src/` ディレクトリ構造を活用し、以下の方針で実装：

1. **コンポーネント配置**: `src/components/` に地図関連コンポーネントを追加
2. **カスタムフック**: `src/hooks/` にキーボードナビゲーションとインタラクションロジックを分離
3. **ユーティリティ**: `src/lib/geo/` に地図専用ライブラリを配置
4. **ルート更新**: 既存の `src/routes/index.tsx` を更新して地図を表示
5. **静的データ**: `public/data/` にGeoJSONファイルを配置（静的アセット）
6. **テスト配置**: コンポーネントと同じディレクトリに `.test.tsx` ファイル、統合テストは `tests/integration/`

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**該当なし** - すべての憲章原則に合格しており、正当化が必要な違反はありません。

---

## Phase 0: Research (完了)

### 実施内容

✅ **調査完了** - `research.md` に以下を記録：

1. **地図ライブラリの選択**
   - 当初指定の「mapcn」が都道府県表示に不適と判明
   - React Leaflet + GeoJSON を採用決定（軽量42KB、週間140万DL）
   - 代替案（react-simple-maps、@react-map/japan、D3.js、Mapbox）も評価

2. **GeoJSONデータソース**
   - piuccio/open-data-jp-prefectures-geojson を採用
   - 国土情報課の公式データ（高精度）
   - パブリックドメインで商用利用可能

3. **インタラクション実装戦略**
   - React Leafletの組み込み機能を活用
   - ズーム/パン: `<MapContainer>` 標準機能
   - ホバー/クリック: `<GeoJSON>` onEachFeature + Leaflet layer イベント
   - キーボード: カスタムフック実装

4. **パフォーマンス最適化戦略**
   - GeoJSON最適化（座標精度調整、不要属性削除）
   - React.memo() でメモ化
   - React.lazy() で遅延ロード
   - Leaflet軽量バンドル（42KB gzipped）

5. **アクセシビリティ実装**
   - ARIA属性（role, aria-label, tabIndex）
   - カスタムキーボードナビゲーション
   - WCAG 2.1 Level AA準拠のフォーカスインジケーター

### 成果物

- ✅ `research.md` - 全技術決定を文書化
- ✅ 全ての「NEEDS CLARIFICATION」を解決

---

## Phase 1: Design & Contracts (完了)

### 実施内容

✅ **データモデル定義** - `data-model.md` に以下を記録：

1. **エンティティ定義**
   - Prefecture（都道府県）
   - JapanMapData（日本地図データ）
   - MapInteractionState（インタラクション状態）
   - MapLoadingState（読み込み状態）

2. **TypeScript型定義**
   - 全エンティティの型定義
   - バリデーションルール
   - 状態遷移図

3. **データフロー**
   - GeoJSON読み込みフロー
   - エラーハンドリングフロー
   - インタラクション状態管理

✅ **契約定義** - `contracts/japan-map-data.schema.json`:
- GeoJSON FeatureCollection の JSON Schema
- 47都道府県のバリデーションルール
- Polygon/MultiPolygon のジオメトリ定義

✅ **クイックスタート** - `quickstart.md`:
- 5分で理解する概要
- セットアップ手順
- TDD開発フロー
- よくある問題と解決策

✅ **エージェントコンテキスト更新**:
- `CLAUDE.md` に新技術を追加（TypeScript、静的GeoJSON、Web構造）

### 成果物

- ✅ `data-model.md` - 完全なデータモデル定義
- ✅ `contracts/japan-map-data.schema.json` - JSON Schema
- ✅ `quickstart.md` - 開発者向けガイド
- ✅ `CLAUDE.md` - 更新済みエージェントコンテキスト

---

## Phase 1: Constitution Re-check (完了)

### 再評価結果

すべての原則に引き続き合格：

| 原則 | Phase 0前 | Phase 1後 | 変更 |
|------|----------|----------|------|
| I. 型安全性ファースト | ✅ 合格 | ✅ 合格 | 型定義完成 |
| II. パフォーマンス最適化 | ✅ 合格 | ✅ 合格 | 最適化戦略確定 |
| III. テストファースト開発 | ✅ 合格 | ✅ 合格 | テスト構造明確化 |
| IV. シンプルさとYAGNI | ✅ 合格 | ✅ 合格 | シンプル構造維持 |
| V. CI/CD自動化 | ✅ 合格 | ✅ 合格 | 既存パイプライン活用 |

**総合判定**: ✅ **全原則維持 - Phase 2（タスク生成）への進行を承認**

---

## Next Steps

このプランニングフェーズは完了しました。次は実装タスクの生成です：

```bash
/speckit.tasks
```

これにより、以下が生成されます：
- `tasks.md` - 依存関係順にソートされた実装タスクリスト
- 各タスクにテストファーストの明確な受入基準
- 優先順位付けとブロッキング関係の定義

実装は**必ずTDDワークフローに従ってください**：
1. テストを書く → 2. ユーザー承認 → 3. テストが失敗 → 4. 実装 → 5. テストが通る → 6. リファクタリング
