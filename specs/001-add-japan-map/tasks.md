# Tasks: Add Japan Map to Index Page

**Input**: Design documents from `/specs/001-add-japan-map/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: このプロジェクトは**テストファースト開発（TDD）**を採用しています。憲章原則IIIに従い、すべてのタスクでテストを最初に書きます。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: このタスクが属するユーザーストーリー（US1, US2, US3）
- 説明に正確なファイルパスを含める

## Path Conventions

このプロジェクトはTanStack Startの単一プロジェクト構造を採用：
- ソースコード: `src/`
- テスト: `tests/` および `src/**/*.test.tsx`
- 静的アセット: `public/`

---

## Phase 1: Setup (共有インフラ)

**目的**: プロジェクト初期化と依存関係のセットアップ

- [X] T001 React Leafletとleafletをインストール: `bun install react-leaflet leaflet @types/leaflet`
- [X] T002 [P] publicディレクトリを作成: `mkdir -p public/data`
- [X] T003 [P] src/hooksディレクトリを作成: `mkdir -p src/hooks`
- [X] T004 [P] src/lib/geoディレクトリを作成: `mkdir -p src/lib/geo`
- [X] T005 [P] tests/integrationディレクトリを作成: `mkdir -p tests/integration`

---

## Phase 2: Foundational (ブロッキング前提条件)

**目的**: すべてのユーザーストーリーの実装前に完了する必要があるコアインフラ

**⚠️ 重要**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません

- [X] T006 GeoJSON型定義を作成 in `src/lib/geo/japanGeoData.ts`
- [X] T007 [P] 地図ユーティリティ関数を作成 in `src/lib/geo/mapUtils.ts`
- [X] T008 GeoJSONデータをダウンロード・配置 in `public/data/japan-prefectures.json`
- [X] T009 GeoJSONデータ検証関数のテストを作成 in `src/lib/geo/mapUtils.test.ts`

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を並列開始可能

---

## Phase 3: User Story 1 - View Japan Map on Index Page (Priority: P1) 🎯 MVP

**Goal**: インデックスページに日本全国の都道府県地図を表示し、都道府県の境界線を明確に表示する

**Independent Test**: ブラウザでインデックスページ（`/`）を開き、日本地図が表示され、47都道府県の輪郭が確認できることで独立してテスト可能

### Tests for User Story 1

> **NOTE: TDD - これらのテストを最初に書き、実装前に失敗することを確認**

- [X] T010 [P] [US1] MapLoadingIndicatorコンポーネントのテストを作成 in `src/components/MapLoadingIndicator.test.tsx`
- [X] T011 [P] [US1] MapErrorFallbackコンポーネントのテストを作成 in `src/components/MapErrorFallback.test.tsx`
- [X] T012 [P] [US1] JapanMapコンポーネントの基本レンダリングテストを作成 in `src/components/JapanMap.test.tsx`

### Implementation for User Story 1

- [X] T013 [P] [US1] MapLoadingIndicatorコンポーネントを実装（Skeletonを使用）in `src/components/MapLoadingIndicator.tsx`
- [X] T014 [P] [US1] MapErrorFallbackコンポーネントを実装（Alert + Buttonを使用）in `src/components/MapErrorFallback.tsx`
- [X] T015 [US1] JapanMapコンポーネントの基本構造を実装 in `src/components/JapanMap.tsx`
- [X] T016 [US1] GeoJSONデータのfetch処理を追加 in `src/components/JapanMap.tsx`
- [X] T017 [US1] React LeafletのMapContainerとGeoJSONで地図をレンダリング in `src/components/JapanMap.tsx`
- [X] T018 [US1] 47都道府県すべてをGeoJSONコンポーネントで表示 in `src/components/JapanMap.tsx`
- [X] T019 [US1] React.memo()でJapanMapをメモ化 in `src/components/JapanMap.tsx`
- [X] T020 [US1] インデックスページにJapanMapを統合（React.lazyで遅延ロード、Leaflet CSSインポート）in `src/routes/index.tsx`
- [X] T021 [US1] SuspenseとError Boundaryでラップ in `src/routes/index.tsx`
- [X] T022 [US1] T010-T012のテストが通ることを確認
- [X] T023 [US1] 統合テストを作成・実行 in `tests/integration/japan-map.test.ts`

**Checkpoint**: ユーザーストーリー1は完全に機能し、独立してテスト可能

---

## Phase 4: User Story 2 - See Application Title (Priority: P1)

**Goal**: ページ上部にアプリケーション名「tv-news」を明確に表示する

**Independent Test**: インデックスページを開き、ヘッダーに「tv-news」というタイトルが表示されることで独立してテスト可能

### Tests for User Story 2

> **NOTE: TDD - これらのテストを最初に書き、実装前に失敗することを確認**

- [X] T024 [US2] タイトルヘッダー表示のテストを追加 in `src/routes/index.test.tsx`

### Implementation for User Story 2

- [X] T025 [US2] タイトルヘッダーをindex.tsxに追加 in `src/routes/index.tsx`
- [X] T026 [US2] Tailwind CSSでタイトルスタイリング（固定配置、z-index管理）in `src/routes/index.tsx`
- [X] T027 [US2] タイトルが地図の表示領域を妨げないことを確認
- [X] T028 [US2] T024のテストが通ることを確認

**Checkpoint**: ユーザーストーリー1と2の両方が独立して動作

---

## Phase 5: User Story 3 - Interact with Japan Map (Priority: P2)

**Goal**: ユーザーが地図をズーム・パンで操作し、都道府県をホバー・クリックして情報を確認でき、キーボードでも操作可能にする

**Independent Test**: ブラウザで地図を表示し、マウスホイールでズーム、ドラッグでパン、都道府県へのホバーでハイライト表示、キーボードでの都道府県選択が動作することで独立してテスト可能

### Tests for User Story 3

> **NOTE: TDD - これらのテストを最初に書き、実装前に失敗することを確認**

- [X] T029 [P] [US3] useMapInteractionフックのテストを作成 in `src/hooks/useMapInteraction.test.ts`
- [X] T030 [P] [US3] useKeyboardNavフックのテストを作成 in `src/hooks/useKeyboardNav.test.ts`
- [X] T031 [P] [US3] PrefectureTooltipコンポーネントのテストを作成 in `src/components/PrefectureTooltip.test.tsx`
- [X] T032 [US3] JapanMapインタラクションテストを追加 in `src/components/JapanMap.test.tsx`

### Implementation for User Story 3

- [X] T033 [P] [US3] useMapInteractionフックを実装（hover/click/focus状態管理）in `src/hooks/useMapInteraction.ts`
- [X] T034 [P] [US3] useKeyboardNavフックを実装（Tab/Enter/Space対応）in `src/hooks/useKeyboardNav.ts`
- [X] T035 [P] [US3] PrefectureTooltipコンポーネントを実装（shadcn/ui Tooltipを使用）in `src/components/PrefectureTooltip.tsx`
- [X] T036 [US3] MapContainerのズーム設定（minZoom/maxZoom）を追加 in `src/components/JapanMap.tsx`
- [X] T037 [US3] GeoJSONコンポーネントのonEachFeatureでhover/clickイベントを追加 in `src/components/JapanMap.tsx`
- [X] T038 [US3] useMapInteractionをJapanMapに統合 in `src/components/JapanMap.tsx`
- [X] T039 [US3] PrefectureTooltipをGeoJSON layerに統合（Leaflet popup/tooltip使用）in `src/components/JapanMap.tsx`
- [X] T040 [US3] キーボードナビゲーションを実装（tabIndex、aria-label、role属性）in `src/components/JapanMap.tsx`
- [X] T041 [US3] useKeyboardNavをJapanMapに統合 in `src/components/JapanMap.tsx`
- [X] T042 [US3] フォーカスインジケーターのスタイリング（WCAG 2.1 AA準拠）in `src/components/JapanMap.tsx`
- [X] T043 [US3] useCallback()でイベントハンドラーをメモ化 in `src/components/JapanMap.tsx`
- [X] T044 [US3] T029-T032のすべてのテストが通ることを確認
- [X] T045 [US3] 統合テストを拡張（インタラクション検証）in `tests/integration/japan-map.test.ts`

**Checkpoint**: すべてのユーザーストーリーが独立して機能

---

## Phase 6: Polish & Cross-Cutting Concerns

**目的**: 複数のユーザーストーリーに影響する改善

- [X] T046 [P] パフォーマンス最適化: GeoJSON最適化（不要属性削除、座標精度調整）
- [X] T047 [P] レスポンシブデザイン検証（320px〜4K解像度）
- [X] T048 [P] 200ms遅延ローディング表示の調整
- [X] T049 [P] エラーメッセージの日本語化・改善
- [X] T050 コードクリーンアップとリファクタリング
- [X] T051 [P] 型定義の最終確認（TypeScript strict mode）
- [X] T052 [P] アクセシビリティ最終検証（WCAG 2.1 AA準拠）
- [X] T053 [P] ドキュメント更新（README.md, quickstart.md）
- [X] T054 quickstart.mdの検証手順を実行
- [X] T055 全テストを実行: `bun test`
- [X] T056 ビルド検証: `bun run build`
- [X] T057 本番環境でのスモークテスト

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - 即座に開始可能
- **Foundational (Phase 2)**: Setup完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべてFoundational完了に依存
  - 各ストーリーは他のストーリーと独立（人員があれば並列実行可能）
  - または優先順位順に順次実行（P1 → P1 → P2）
- **Polish (Phase 6)**: すべての必要なユーザーストーリー完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational完了後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P1)**: Foundational完了後に開始可能 - 他のストーリーへの依存なし（US1と並列実行可能）
- **User Story 3 (P2)**: Foundational完了後に開始可能 - US1の地図コンポーネントが必要だが、独立してテスト可能

### Within Each User Story

- **TDD順序（必須）**:
  1. テストを書く
  2. テストが失敗することを確認
  3. 実装
  4. テストが通ることを確認
  5. リファクタリング
- モデル/型定義 → フック/ユーティリティ → コンポーネント
- コア実装 → 統合 → 最適化

### Parallel Opportunities

- **Phase 1**: T002, T003, T004, T005は並列実行可能
- **Phase 2**: T007, T009は並列実行可能
- **Phase 3**: T010, T011, T012（テスト）は並列実行可能 / T013, T014（UI実装）は並列実行可能
- **Phase 5**: T029, T030, T031（テスト）は並列実行可能 / T033, T034, T035（フック/コンポーネント）は並列実行可能
- **Phase 6**: T046-T049, T051-T053は並列実行可能
- **複数人での開発**: Foundational完了後、US1とUS2を並列開発可能

---

## Parallel Example: User Story 3

```bash
# User Story 3のすべてのテストを並列実行:
Task: "useMapInteractionフックのテストを作成 in src/hooks/useMapInteraction.test.ts"
Task: "useKeyboardNavフックのテストを作成 in src/hooks/useKeyboardNav.test.ts"
Task: "PrefectureTooltipコンポーネントのテストを作成 in src/components/PrefectureTooltip.test.tsx"

# User Story 3のフック実装を並列実行:
Task: "useMapInteractionフックを実装 in src/hooks/useMapInteraction.ts"
Task: "useKeyboardNavフックを実装 in src/hooks/useKeyboardNav.ts"
Task: "PrefectureTooltipコンポーネントを実装 in src/components/PrefectureTooltip.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2のみ)

1. Phase 1: Setup完了
2. Phase 2: Foundational完了（重要 - すべてのストーリーをブロック）
3. Phase 3: User Story 1完了
4. Phase 4: User Story 2完了
5. **STOP and VALIDATE**: US1 + US2を独立してテスト
6. デプロイ/デモ準備完了

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立テスト → デプロイ/デモ（地図表示MVP）
3. User Story 2追加 → 独立テスト → デプロイ/デモ（タイトル追加）
4. User Story 3追加 → 独立テスト → デプロイ/デモ（インタラクション追加）
5. 各ストーリーが既存機能を壊さずに価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チーム全体でSetup + Foundationalを完了
2. Foundational完了後:
   - 開発者A: User Story 1（地図表示）
   - 開発者B: User Story 2（タイトル）- US1と並列可能
   - 開発者C: User Story 3はUS1完了を待つ（または他のタスク）
3. 各ストーリーが独立して完了・統合

---

## TDD Workflow (憲章原則III - 絶対必須)

このプロジェクトは**テストファースト開発**を採用しています。各タスクで以下のワークフローに従ってください：

### ステップ1: テストを書く

- 実装前に、期待される動作を定義するテストを書く
- 例: T010（MapLoadingIndicatorのテスト）を最初に書く

### ステップ2: ユーザー承認を得る

- テストシナリオが要件と一致することを確認
- 必要に応じて、テストケースをレビュー

### ステップ3: テストが失敗することを確認

- テストを実行し、正しい理由で失敗することを確保
- `bun test src/components/MapLoadingIndicator.test.tsx`

### ステップ4: 実装

- テストを通す最小限のコードを書く
- 例: T013（MapLoadingIndicator実装）

### ステップ5: テストが通ることを確認

- 実装が要件を満たすことを確認
- `bun test src/components/MapLoadingIndicator.test.tsx`

### ステップ6: リファクタリング

- テストをグリーンに保ちながらコードを改善
- パフォーマンス最適化、可読性向上

---

## Notes

- **[P]タスク** = 異なるファイル、依存関係なし、並列実行可能
- **[Story]ラベル** = タスクと特定のユーザーストーリーの紐付けでトレーサビリティを確保
- 各ユーザーストーリーは独立して完了・テスト可能
- **TDD必須**: 実装前にテストを検証
- 各タスクまたは論理グループ後にコミット
- 任意のチェックポイントでストーリーを独立して検証可能
- 避けるべき: 曖昧なタスク、同じファイルでの競合、ストーリーの独立性を壊す相互依存

---

## Summary

**合計タスク数**: 57タスク

**ユーザーストーリー別タスク数**:
- Setup: 5タスク
- Foundational: 4タスク
- User Story 1 (P1 - 地図表示): 14タスク
- User Story 2 (P1 - タイトル): 5タスク
- User Story 3 (P2 - インタラクション): 17タスク
- Polish: 12タスク

**並列実行機会**:
- Phase 1: 4並列（T002-T005）
- Phase 2: 2並列（T007, T009）
- Phase 3: 最大3並列（テスト、UI実装）
- Phase 5: 最大3並列（テスト、フック実装）
- Phase 6: 最大8並列（最適化、検証、ドキュメント）

**MVP推奨スコープ**: User Story 1 + User Story 2（Phase 1-4）

**各ストーリーの独立テスト基準**:
- **US1**: ブラウザで`/`を開き、47都道府県の地図が表示される
- **US2**: ページ上部に「tv-news」タイトルが表示される
- **US3**: ズーム、パン、ホバー、クリック、キーボード操作が動作する
