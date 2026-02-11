# Tasks: 開発環境構築

**Input**: Design documents from `/specs/001-dev-setup/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: このフィーチャーは設定ファイル中心のため、設定検証タスクを含みます。

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Web application with TanStack Start structure
- Root-level configuration files
- `src/` for source code
- `.github/`, `.husky/`, `.vscode/` for tooling

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: TanStack Startプロジェクトの初期化

- [ ] T001 TanStack Startプロジェクトを作成（bun create @tanstack/start@latest）

**Checkpoint**: プロジェクト構造が作成され、基本的な依存関係がインストールされている

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: すべてのUser Storiesの前提となる基本設定

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] .gitignoreファイルを作成（node_modules, .output, dist等を除外）
- [ ] T003 [P] package.jsonにtype="module"を設定
- [ ] T004 基本的な開発サーバー起動確認（bun run dev）

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - プロジェクト初期化と依存関係インストール (Priority: P1) 🎯 MVP

**Goal**: 開発者が10分以内にリポジトリクローンから開発サーバー起動まで完了できる

**Independent Test**: `mise install && bun install && bun run dev`を実行して、http://localhost:3000でページが表示されることを確認

### Implementation for User Story 1

- [ ] T005 [P] [US1] .mise.tomlファイルを作成（Node.js 22, bun latest）
- [ ] T006 [P] [US1] package.jsonのenginesフィールドを追加（node >=22.0.0, bun >=1.0.0）
- [ ] T007 [US1] package.jsonのscriptsセクションを更新（dev, build, serve）
- [ ] T008 [US1] vite.config.tsを確認・調整（tanstackStart(), viteReact()の順序確認）
- [ ] T009 [US1] READMEを作成（quickstart.mdの内容を統合）

**Checkpoint**: At this point, User Story 1 should be fully functional - developers can clone and start dev server in 10 minutes

---

## Phase 4: User Story 2 - 型チェックとリンティングの設定 (Priority: P2)

**Goal**: TypeScript strictモードとBiomeによるリント・フォーマットが動作する

**Independent Test**: 意図的に型エラーを含むコードを書き、`bun run type-check`と`bun run check`でエラーが検出されることを確認

### Implementation for User Story 2

- [ ] T010 [P] [US2] tsconfig.jsonを更新（strict: true, strictNullChecks: true, paths設定）
- [ ] T011 [P] [US2] Biomeをインストール（bun add -D -E @biomejs/biome）
- [ ] T012 [US2] biome.jsonを作成（formatter, linter設定）
- [ ] T013 [P] [US2] package.jsonにBiomeスクリプトを追加（format, lint, check, ci）
- [ ] T014 [P] [US2] package.jsonにtype-checkスクリプトを追加（tsc --noEmit）
- [ ] T015 [P] [US2] .vscode/settings.jsonを作成（Biome設定、formatOnSave）
- [ ] T016 [US2] 既存コードにstrictモード適用後の型エラーを修正

**Checkpoint**: TypeScript strictモードが有効で、Biomeによるリント・フォーマットが機能している

---

## Phase 5: User Story 3 - テスト環境の構築 (Priority: P3)

**Goal**: Vitest, React Testing Library, MSWがセットアップされ、サンプルテストが実行可能

**Independent Test**: `bun run test`を実行して、サンプルテストが10秒以内に完了することを確認

### Implementation for User Story 3

- [ ] T017 [P] [US3] Vitestとjsdomをインストール（bun add -D vitest @vitest/ui jsdom）
- [ ] T018 [P] [US3] React Testing Libraryをインストール（bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event）
- [ ] T019 [P] [US3] MSWをインストール（bun add -D msw）
- [ ] T020 [P] [US3] vitest.config.tsを作成（jsdom environment, globals, coverage設定）
- [ ] T021 [P] [US3] src/test/setup.tsを作成（@testing-library/jest-domインポート）
- [ ] T022 [US3] サンプルテストファイルを作成（src/routes/index.test.tsx）
- [ ] T023 [P] [US3] package.jsonにテストスクリプトを追加（test, test:ui, test:coverage）
- [ ] T024 [US3] サンプルテストが実行されることを確認

**Checkpoint**: Vitestが動作し、サンプルテストが実行可能

---

## Phase 6: User Story 4 - CI/CD基盤の準備 (Priority: P4)

**Goal**: GitHub Actionsとpre-commitフックが設定され、自動チェックが動作する

**Independent Test**: 意図的にリントエラーのあるコードをコミットし、pre-commitフックがブロックすることを確認。PRを作成してCIが実行されることを確認。

### Implementation for User Story 4

- [ ] T025 [P] [US4] .github/workflows/ci.ymlを作成（mise, bun, lint, type-check, test）
- [ ] T026 [P] [US4] Huskyをインストール（bunx husky-init && bun install）
- [ ] T027 [US4] .husky/pre-commitファイルを編集（bunx --bun biome check --staged --write）
- [ ] T028 [US4] .husky/pre-commitに実行権限を付与（chmod +x .husky/pre-commit）
- [ ] T029 [P] [US4] package.jsonにprepareスクリプトを追加（husky install）
- [ ] T030 [US4] pre-commitフックの動作確認（リントエラーでコミットがブロックされることを確認）

**Checkpoint**: CI/CDパイプラインとpre-commitフックが機能している

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: ドキュメント整備と最終検証

- [ ] T031 [P] READMEに開発コマンド一覧を追加
- [ ] T032 [P] READMEにトラブルシューティングセクションを追加
- [ ] T033 [P] READMEに憲章へのリンクを追加
- [ ] T034 quickstart.mdの検証チェックリストをすべて実行
- [ ] T035 Success Criteria（SC-001～SC-007）の検証

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Foundational
  - US2 (P2): Can start after Foundational (independent of US1)
  - US3 (P3): Can start after Foundational (independent of US1, US2)
  - US4 (P4): Can start after Foundational (independent of US1, US2, US3)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - Can work independently
- **User Story 2 (P2)**: No dependencies on other stories - Can work independently
- **User Story 3 (P3)**: No dependencies on other stories - Can work independently
- **User Story 4 (P4)**: No dependencies on other stories - Can work independently

### Within Each User Story

- Tasks marked [P] can run in parallel within the same story
- Tasks without [P] should run after their dependencies complete
- For User Story 1:
  - T005, T006 can run in parallel
  - T007, T008 depend on package.json existing (after T006)
- For User Story 2:
  - T010, T011, T013, T014, T015 can run in parallel
  - T012 depends on T011 (Biome must be installed first)
  - T016 should run after all config files are in place
- For User Story 3:
  - T017, T018, T019, T020, T021, T023 can run in parallel
  - T022, T024 should run after config files are created
- For User Story 4:
  - T025, T026, T029 can run in parallel
  - T027, T028 depend on T026 (Husky must be installed first)
  - T030 should run last to verify

### Parallel Opportunities

```bash
# After Foundational phase completes, these can all start in parallel:
Task: "Create .mise.toml" (US1)
Task: "Update tsconfig.json" (US2)
Task: "Install Vitest" (US3)
Task: "Create GitHub Actions workflow" (US4)

# Within User Story 2, these can run in parallel:
Task: "Update tsconfig.json"
Task: "Install Biome"
Task: "Add type-check script"
Task: "Create VS Code settings"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T004)
3. Complete Phase 3: User Story 1 (T005-T009)
4. **STOP and VALIDATE**: Verify that new developers can set up in 10 minutes
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (P1) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (P2) → Test independently → Improved DX with linting
4. Add User Story 3 (P3) → Test independently → Test environment ready
5. Add User Story 4 (P4) → Test independently → CI/CD complete
6. Polish (Phase 7) → Final validation → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T004)
2. Once Foundational is done:
   - Developer A: User Story 1 (T005-T009)
   - Developer B: User Story 2 (T010-T016)
   - Developer C: User Story 3 (T017-T024)
   - Developer D: User Story 4 (T025-T030)
3. Stories complete and integrate independently
4. Team collaborates on Polish phase (T031-T035)

---

## Notes

- [P] tasks = different files, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify configurations work before moving to next story
- Commit after each user story completion
- Stop at any checkpoint to validate story independently
- This feature is configuration-heavy, so most work is file creation/editing

---

## Validation Checklist (Per User Story)

### User Story 1 Validation
- [ ] `mise --version` works
- [ ] `mise install` installs Node.js 22 and bun
- [ ] `bun install` completes without errors
- [ ] `bun run dev` starts server in < 5 seconds
- [ ] http://localhost:3000 shows welcome page
- [ ] Total setup time < 10 minutes (SC-001)

### User Story 2 Validation
- [ ] `bun run type-check` detects type errors in < 1 second (SC-002)
- [ ] `bun run check` runs lint and format
- [ ] VS Code auto-formats on save in < 500ms (SC-004)
- [ ] Intentional type errors are caught immediately

### User Story 3 Validation
- [ ] `bun run test` executes sample tests in < 10 seconds (SC-003)
- [ ] `bun run test:ui` opens Vitest UI
- [ ] `bun run test:coverage` generates coverage report
- [ ] Sample test passes

### User Story 4 Validation
- [ ] Pre-commit hook blocks commits with lint errors
- [ ] GitHub Actions workflow runs on PR creation
- [ ] CI pipeline completes in < 3 minutes (SC-005)
- [ ] All CI checks (lint, type-check, test) pass

### Final Validation (Phase 7)
- [ ] All SC-001 through SC-007 success criteria are met
- [ ] README is complete and accurate
- [ ] quickstart.md checklist all items pass
- [ ] 100% of developers can set up following README (SC-007)
