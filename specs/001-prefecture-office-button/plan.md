# Implementation Plan: 都道府県庁舎所在地ボタン表示

**Branch**: `001-prefecture-office-button` | **Date**: 2026-02-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-prefecture-office-button/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

日本地図上の47都道府県すべての庁舎所在地（県庁所在地）にインタラクティブなマーカー（ボタン）を追加する。ユーザーはマーカーをホバーして庁舎名を確認でき、クリックして都道府県名をポップアップで表示できる。キーボードナビゲーションもサポートし、WCAG 2.1 AA準拠のアクセシビリティを確保する。

技術的アプローチ: 既存のJapanMapコンポーネント（Leaflet + React Leaflet）を拡張し、新しい庁舎所在地データレイヤーを追加する。マーカーは既存の地図ローディング後に非同期で読み込まれ、エラー時には自動リトライと手動リトライオプションを提供する。

## Technical Context

**Language/Version**: TypeScript 5.x（strictモード）、Node.js 22（mise管理）
**Primary Dependencies**:
- React 19（TanStack Start経由）
- TanStack Start（フルスタックフレームワーク）
- TanStack Router（型安全ルーティング）
- Leaflet 1.9+（地図ライブラリ）
- React Leaflet 4+（Reactバインディング）

**Storage**: 静的JSONファイル（public/data/prefecture-offices.json - 新規作成）
**Testing**: Vitest（ユニット・統合）、React Testing Library（コンポーネント）、Playwright（E2E）
**Target Platform**: Web（モダンブラウザ: Chrome、Firefox、Safari、Edge）
**Project Type**: Web application（既存のTanStack Startアプリケーションに機能追加）
**Performance Goals**:
- マーカー表示: 地図読み込み後2秒以内
- ホバー応答: 100ミリ秒以内
- クリック応答: 1秒以内
- 初期ページロード: 3G接続で2秒未満（憲章目標）

**Constraints**:
- WCAG 2.1 AA準拠（コントラスト比4.5:1、クリック領域44×44px）
- キーボードナビゲーション必須（Tab、Enter、Space、矢印キー）
- 既存の地図機能との視覚的一貫性
- SSR/ハイドレーション互換性

**Scale/Scope**:
- 47都道府県固定（スケーラビリティ懸念なし）
- 新規コンポーネント: 3-5個（マーカーレイヤー、ポップアップ、データフック）
- 新規データファイル: 1個（庁舎所在地座標）
- 既存コンポーネント拡張: 1個（JapanMap）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 型安全性ファースト ✅

- [x] TypeScript strictモード使用
- [x] すべてのコンポーネントpropsに型定義
- [x] すべてのデータモデル（庁舎所在地エンティティ）に型定義
- [x] すべてのAPIコントラクト（座標データ）に型定義
- [x] 状態管理構造（マーカー状態、ポップアップ状態）に型定義

**Status**: ✅ PASS - すべての新規コードはTypeScript strictモードで記述

### II. パフォーマンス最適化 ✅

- [x] TanStack Queryの活用（既存の地図機能で使用中）
- [x] SSR対応（ClientOnlyコンポーネントで既に対応）
- [x] メモ化（useCallback、React.memoを使用）
- [x] 非同期データ読み込み（マーカーは地図読み込み後に非同期で追加）
- [x] パフォーマンス目標達成（2秒以内のマーカー表示）

**Status**: ✅ PASS - パフォーマンス目標が明確で実現可能

### III. テストファースト開発 ✅

- [x] TDDワークフローを採用
- [x] ユニットテスト: データ変換、座標計算、状態管理ロジック
- [x] コンポーネントテスト: マーカーレイヤー、ポップアップ、インタラクション
- [x] 統合テスト: 地図とマーカーの統合、データ読み込み
- [x] E2Eテスト: マーカーホバー、クリック、キーボードナビゲーション

**Status**: ✅ PASS - 包括的なテスト戦略を計画

### IV. シンプルさとYAGNI ✅

- [x] 必要最小限の機能（都道府県名のみ表示）
- [x] 早すぎる抽象化を回避（具体的なマーカーコンポーネントのみ）
- [x] 既存の地図機能を拡張（新規地図フレームワーク不要）
- [x] Out of Scopeが明確（詳細情報、公式サイトリンクなど）

**Status**: ✅ PASS - シンプルで焦点が絞られた実装

### V. CI/CD自動化 ✅

- [x] 既存のCI/CDパイプラインを使用
- [x] Pre-commitフック（Biome linter）
- [x] CIパイプライン（すべてのテスト実行）
- [x] 自動デプロイメント（mainマージ後）

**Status**: ✅ PASS - 既存の自動化を活用

### 総合評価

**Status**: ✅ **ALL GATES PASSED**

違反なし。すべての原則に準拠した計画。Phase 0リサーチに進むことができます。

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
│   ├── JapanMap.tsx                    # 既存 - 拡張対象
│   ├── PrefectureOfficeMarkers.tsx     # 新規 - マーカーレイヤーコンポーネント
│   ├── PrefectureOfficePopup.tsx       # 新規 - ポップアップコンポーネント
│   └── ui/                             # 既存 - shadcn/uiコンポーネント
├── hooks/
│   ├── useMapInteraction.ts            # 既存 - マーカーインタラクション用に拡張
│   └── usePrefectureOffices.ts         # 新規 - 庁舎所在地データフック
├── lib/
│   └── geo/
│       ├── mapUtils.ts                 # 既存 - データ読み込みユーティリティ
│       └── prefectureOfficeData.ts     # 新規 - 庁舎所在地データ型定義
└── routes/
    └── index.tsx                       # 既存 - メインページ（変更なし）

public/
└── data/
    ├── japan-prefectures.json          # 既存 - 都道府県境界線データ
    └── prefecture-offices.json         # 新規 - 庁舎所在地座標データ

src/components/
├── JapanMap.test.tsx                   # 既存 - 拡張テスト追加
├── PrefectureOfficeMarkers.test.tsx    # 新規 - マーカーコンポーネントテスト
└── PrefectureOfficePopup.test.tsx      # 新規 - ポップアップコンポーネントテスト

tests/
└── e2e/
    └── prefecture-office-markers.spec.ts  # 新規 - E2Eテスト
```

**Structure Decision**: TanStack Startの標準的なWebアプリケーション構造を使用。既存のJapanMapコンポーネントを拡張し、新規のマーカーレイヤーとポップアップコンポーネントを追加する。データは既存のGeoJSONパターンに従い、公開ディレクトリに静的ファイルとして配置する。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

違反なし。すべての原則に準拠した設計。

---

## Phase 0: Outline & Research ✅

**Status**: 完了
**Output**: `research.md`

### 完了したリサーチタスク

1. ✅ 庁舎所在地データソース調査
   - **Decision**: dataofjapan/land の prefecturalCapital.csv
   - **Rationale**: 47都道府県すべてのデータ、高精度座標、オープンライセンス

2. ✅ Leaflet マーカーベストプラクティス
   - **Decision**: DOM ベースの L.divIcon + L.Marker
   - **Rationale**: 47個の少量マーカー、柔軟性、アクセシビリティ対応容易

3. ✅ React Leaflet での状態管理
   - **Decision**: 既存の useMapInteraction フックを拡張
   - **Rationale**: コードベースの一貫性、学習コスト最小化

---

## Phase 1: Design & Contracts ✅

**Status**: 完了
**Outputs**: `data-model.md`, `contracts/`, `quickstart.md`, `CLAUDE.md`（更新）

### 完了した設計タスク

1. ✅ データモデル定義
   - PrefectureOffice エンティティ（5属性）
   - Prefecture エンティティとの 1:1 関係
   - バリデーションルール
   - 状態管理データ構造

2. ✅ APIコントラクト生成
   - JSON Schema: `contracts/prefecture-office-data.json`
   - 47件の配列、厳密な型定義

3. ✅ クイックスタートガイド
   - TDDワークフロー
   - セットアップ手順
   - デバッグ方法
   - よくある問題と解決策

4. ✅ Agent context更新
   - CLAUDE.md に新規技術を追加

### Constitution Check（Phase 1完了後の再評価）

**Status**: ✅ **ALL GATES PASSED**

すべての設計がConstitutionの5つの原則に準拠：
- ✅ 型安全性: TypeScript strictモード、すべてのエンティティに型定義
- ✅ パフォーマンス: メモ化、非同期読み込み、47件の軽量データ
- ✅ テストファースト: TDDワークフローをquickstart.mdで明示
- ✅ シンプルさ: YAGNIに従い、必要最小限の機能のみ
- ✅ CI/CD: 既存パイプラインを活用

---

## Phase 2: Task Decomposition

**Status**: 保留中（`/speckit.tasks` コマンドで生成）

Phase 2は `/speckit.plan` コマンドの範囲外です。次のコマンドで進めてください：

```bash
/speckit.tasks
```
