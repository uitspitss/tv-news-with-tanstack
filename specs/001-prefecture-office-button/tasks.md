# Tasks: 都道府県庁舎所在地ボタン表示

**Input**: Design documents from `/specs/001-prefecture-office-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are included based on the project constitution requirement for TDD (Test-Driven Development).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

このプロジェクトはTanStack Startの標準的なWebアプリケーション構造を使用します：
- `src/` - ソースコード
- `public/` - 静的ファイル
- `scripts/` - ビルドスクリプト
- テストファイルは対応するコンポーネントと同じディレクトリに配置

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: プロジェクト初期化とデータ準備

- [x] T001 Create data conversion script in scripts/convert-capital-data.ts
- [x] T002 [P] Download prefecture capital CSV data to scripts/prefecturalCapital.csv
- [x] T003 Run data conversion script to generate public/data/prefecture-offices.json
- [x] T004 [P] Create TypeScript type definitions in src/lib/geo/prefectureOfficeData.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: コアインフラストラクチャ - すべてのユーザーストーリーの前提条件

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業を開始できません

- [x] T005 Extend useMapInteraction hook to support capital markers in src/hooks/useMapInteraction.ts
- [x] T006 [P] Create validation function for prefecture office data in src/lib/geo/prefectureOfficeData.ts
- [x] T007 [P] Create custom hook usePrefectureOffices for data fetching in src/hooks/usePrefectureOffices.ts

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を並行して開始可能

---

## Phase 3: User Story 1 - 庁舎所在地の視覚的識別 (Priority: P1) 🎯 MVP

**Goal**: ユーザーが日本地図上で各都道府県の庁舎所在地（県庁所在地）を一目で識別できるようにする

**Independent Test**: 地図を読み込み、すべての都道府県（47都道府県）の庁舎所在地にマーカーが表示されていることを確認する。この機能単体で「どこに県庁があるか」という情報を提供できる。

### Tests for User Story 1

> **NOTE: これらのテストを最初に書き、実装前に失敗することを確認すること**

- [x] T008 [P] [US1] Create unit test for prefecture office data validation in src/lib/geo/prefectureOfficeData.test.ts
- [x] T009 [P] [US1] Create unit test for usePrefectureOffices hook in src/hooks/usePrefectureOffices.test.ts
- [x] T010 [P] [US1] Create component test for PrefectureOfficeMarkers in src/components/PrefectureOfficeMarkers.test.tsx

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement PrefectureOfficeMarkers component in src/components/PrefectureOfficeMarkers.tsx
- [x] T012 [US1] Integrate PrefectureOfficeMarkers into JapanMap component in src/components/JapanMap.tsx
- [x] T013 [US1] Add CSS styles for capital markers in src/components/JapanMap.tsx (inline styles section)
- [x] T014 [US1] Implement hover tooltip for capital markers in src/components/PrefectureOfficeMarkers.tsx
- [x] T015 [US1] Add marker size responsiveness based on zoom level in src/components/PrefectureOfficeMarkers.tsx
- [x] T016 [US1] Update JapanMap tests to include marker rendering in src/components/JapanMap.test.tsx

**Checkpoint**: ✅ User Story 1が完全に機能し、独立してテスト可能であること

---

## Phase 4: User Story 2 - 庁舎所在地の詳細情報へのアクセス (Priority: P2)

**Goal**: ユーザーが庁舎所在地マーカーをクリックすることで、その都道府県名をポップアップで確認できるようにする

**Independent Test**: 任意の庁舎所在地マーカーをクリックし、都道府県名がポップアップで表示されることを確認する。この機能単体で「クリックによる都道府県名の確認」という価値を提供できる。

### Tests for User Story 2

- [x] T017 [P] [US2] Create component test for PrefectureOfficePopup in src/components/PrefectureOfficePopup.test.tsx
- [x] T018 [US2] Add integration test for marker click and popup display in src/components/JapanMap.test.tsx

### Implementation for User Story 2

- [x] T019 [P] [US2] Create PrefectureOfficePopup component in src/components/PrefectureOfficePopup.tsx
- [x] T020 [US2] Implement click event handler for markers in src/components/PrefectureOfficeMarkers.tsx
- [x] T021 [US2] Integrate popup state management with useMapInteraction hook in src/components/PrefectureOfficeMarkers.tsx
- [x] T022 [US2] Add popup close functionality (click outside or close button) in src/components/PrefectureOfficePopup.tsx
- [x] T023 [US2] Handle multiple marker clicks (close previous, open new) in src/components/PrefectureOfficeMarkers.tsx
- [x] T024 [US2] Add ARIA attributes for popup accessibility in src/components/PrefectureOfficePopup.tsx

**Checkpoint**: ✅ User Story 1とUser Story 2の両方が独立して動作すること

---

## Phase 5: User Story 3 - キーボードによるアクセシビリティ (Priority: P3)

**Goal**: キーボードのみを使用するユーザーが、庁舎所在地マーカーにアクセスし、アクションを実行できるようにする

**Independent Test**: マウスを使用せず、Tabキーとエンターキーのみを使用して、任意の庁舎所在地マーカーにフォーカスし、アクションを実行できることを確認する。

### Tests for User Story 3

- [x] T025 [P] [US3] Create keyboard navigation test for markers in src/components/PrefectureOfficeMarkers.test.tsx
- [ ] T026 [US3] Create E2E test for keyboard accessibility in tests/e2e/prefecture-office-markers.spec.ts (スキップ - E2Eテストは別途実施)

### Implementation for User Story 3

- [x] T027 [P] [US3] Add tabindex and role attributes to markers in src/components/PrefectureOfficeMarkers.tsx
- [x] T028 [US3] Implement keyboard event handlers (Tab, Enter, Space) in src/components/PrefectureOfficeMarkers.tsx
- [ ] T029 [US3] Implement arrow key navigation between markers in src/components/PrefectureOfficeMarkers.tsx (スキップ - 基本的なキーボードナビゲーションは実装済み)
- [x] T030 [US3] Add visual focus indicator styles (WCAG AA compliant) in src/components/JapanMap.tsx (inline styles section)
- [x] T031 [US3] Ensure popup can be closed with Escape key in src/components/PrefectureOfficePopup.tsx
- [x] T032 [US3] Add aria-label for screen readers to markers in src/components/PrefectureOfficeMarkers.tsx

**Checkpoint**: ✅ すべてのユーザーストーリーが独立して機能すること

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [x] T033 [P] Add error retry logic (1 auto-retry + manual retry button) in src/hooks/usePrefectureOffices.ts
- [x] T034 [P] Implement error boundary integration for marker failures in src/components/JapanMap.tsx
- [x] T035 [P] Add loading state handling (async marker addition) in src/components/PrefectureOfficeMarkers.tsx
- [x] T036 [P] Optimize marker rendering with React.memo in src/components/PrefectureOfficeMarkers.tsx
- [x] T037 [P] Add useMemo for marker data processing in src/components/PrefectureOfficeMarkers.tsx
- [x] T038 [P] Add useCallback for event handlers in src/components/PrefectureOfficeMarkers.tsx
- [x] T039 [P] Implement data欠落 handling (log warning, no user notification) in src/hooks/usePrefectureOffices.ts
- [x] T040 [P] Add performance monitoring for marker rendering (should be < 2 seconds) in src/components/PrefectureOfficeMarkers.tsx
- [x] T041 Code cleanup and refactoring across all new components
- [x] T042 Run quickstart.md validation to ensure all steps work
- [x] T043 [P] Update project documentation in CLAUDE.md with implementation notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-5)**: すべてFoundationalフェーズの完了に依存
  - ユーザーストーリーは並行して進行可能（スタッフがいれば）
  - または優先度順に順次実行（P1 → P2 → P3）
- **Polish (Phase 6)**: すべての必要なユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2)の後に開始可能 - 他のストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2)の後に開始可能 - US1と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational (Phase 2)の後に開始可能 - US1/US2と統合するが独立してテスト可能

### Within Each User Story

- テストは実装前に書き、失敗することを確認すること
- コンポーネント実装の前にフック実装
- コア実装の前に統合
- 次の優先度に移る前にストーリー完了

### Parallel Opportunities

- Phase 1のすべての[P]タスクは並行実行可能
- Phase 2のすべての[P]タスクは並行実行可能
- Foundationalフェーズ完了後、すべてのユーザーストーリーは並行開始可能（チーム容量があれば）
- 各ユーザーストーリー内の[P]マークされたテストは並行実行可能
- 各ユーザーストーリー内の[P]マークされたコンポーネントは並行実行可能
- 異なるユーザーストーリーは異なるチームメンバーによって並行作業可能

---

## Parallel Example: User Story 1

```bash
# User Story 1のすべてのテストを一緒に起動:
Task: "Create unit test for prefecture office data validation in src/lib/geo/prefectureOfficeData.test.ts"
Task: "Create unit test for usePrefectureOffices hook in src/hooks/usePrefectureOffices.test.ts"
Task: "Create component test for PrefectureOfficeMarkers in src/components/PrefectureOfficeMarkers.test.tsx"

# User Story 1の並列可能な実装タスクを一緒に起動:
Task: "Implement PrefectureOfficeMarkers component in src/components/PrefectureOfficeMarkers.tsx"
```

---

## Parallel Example: User Story 2

```bash
# User Story 2のすべてのテストを一緒に起動:
Task: "Create component test for PrefectureOfficePopup in src/components/PrefectureOfficePopup.test.tsx"

# User Story 2の並列可能な実装タスクを一緒に起動:
Task: "Create PrefectureOfficePopup component in src/components/PrefectureOfficePopup.tsx"
```

---

## Parallel Example: User Story 3

```bash
# User Story 3のすべてのテストを一緒に起動:
Task: "Create keyboard navigation test for markers in src/components/PrefectureOfficeMarkers.test.tsx"

# User Story 3の並列可能な実装タスクを一緒に起動:
Task: "Add tabindex and role attributes to markers in src/components/PrefectureOfficeMarkers.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1を完了: Setup
2. Phase 2を完了: Foundational（重要 - すべてのストーリーをブロック）
3. Phase 3を完了: User Story 1
4. **停止して検証**: User Story 1を独立してテスト
5. 準備ができればデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP！）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ
4. User Story 3追加 → 独立してテスト → デプロイ/デモ
5. 各ストーリーは以前のストーリーを壊すことなく価値を追加

### Parallel Team Strategy

複数の開発者がいる場合：

1. チームでSetup + Foundationalを一緒に完了
2. Foundationalが完了したら：
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. ストーリーは独立して完了し、統合される

---

## Notes

- [P]タスク = 異なるファイル、依存関係なし
- [Story]ラベルはタスクを特定のユーザーストーリーにマッピング（追跡性）
- 各ユーザーストーリーは独立して完了可能でテスト可能であるべき
- 実装前にテストが失敗することを確認
- 各タスクまたは論理的なグループの後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証
- 避けるべき: 曖昧なタスク、同じファイルの競合、ストーリーの独立性を壊すクロスストーリー依存関係
