# Tasks: Cloudflareデプロイメント

**Input**: Design documents from `/specs/002-cloudflare-deploy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: テスト駆動開発（TDD）を採用。憲章III（テストファースト開発）に準拠し、各ユーザーストーリーの実装前にテストを作成します。

**Organization**: タスクはユーザーストーリーごとにグループ化され、各ストーリーを独立して実装・テスト可能にします。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存関係なし）
- **[Story]**: タスクが属するユーザーストーリー（例: US1, US2, US3, US4）
- 説明には正確なファイルパスを含める

## Path Conventions

プロジェクト構造（plan.mdより）:
- ルートディレクトリ: `vite.config.ts`, `wrangler.jsonc`, `worker-configuration.d.ts`, `.dev.vars`
- アプリケーションコード: `app/routes/`, `app/middleware/`, `app/router.tsx`
- テスト: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- CI/CD: `.github/workflows/`

---

## Phase 1: Setup (共通インフラストラクチャ)

**Purpose**: プロジェクト初期化とCloudflare統合の基本構造

- [x] T001 Install Cloudflare dependencies: `bun add -d @cloudflare/vite-plugin wrangler`
- [x] T002 [P] Create Cloudflare environment type definitions in `worker-configuration.d.ts`
- [x] T003 [P] Create Wrangler configuration file `wrangler.jsonc` with nodejs_compat flag
- [x] T004 [P] Update Vite configuration in `vite.config.ts` to include cloudflare plugin
- [x] T005 [P] Add `.dev.vars` to `.gitignore`
- [x] T006 [P] Update package.json scripts for Cloudflare deployment

---

## Phase 2: Foundational (ブロッキング前提条件)

**Purpose**: すべてのユーザーストーリーが依存するコアインフラストラクチャ

**⚠️ CRITICAL**: このフェーズが完了するまで、ユーザーストーリーの作業は開始できません

- [x] T007 Create `.dev.vars` template file with BASIC_AUTH_USER and BASIC_AUTH_PASSWORD placeholders
- [x] T008 [P] Setup Cloudflare authentication: `bunx wrangler login` (documented in README)
- [x] T009 [P] Verify Cloudflare account connection: `bunx wrangler whoami` (documented in README)

**Checkpoint**: 基盤準備完了 - ユーザーストーリーの実装を並列開始可能

---

## Phase 3: User Story 1 - 本番環境への初回デプロイ (Priority: P1) 🎯 MVP

**Goal**: 開発者がローカル環境からCloudflare Workersに1コマンドでデプロイし、公開URLでアプリケーションにアクセスできる

**Independent Test**: `bun run deploy`を実行し、出力されたURLでアプリケーションが正常に表示されることを確認

### Tests for User Story 1 (TDD)

> **NOTE: これらのテストを最初に書き、実装前に失敗することを確認**

- [ ] T010 [P] [US1] Write integration test for deployment process in `tests/integration/deploy.test.ts`
  - Verify build succeeds
  - Verify wrangler deploy command succeeds
  - Verify deployment returns valid URL

### Implementation for User Story 1

- [ ] T011 [US1] Verify Vite build works correctly: `bun run build`
- [ ] T012 [US1] Test local deployment preview: `bunx wrangler dev`
- [ ] T013 [US1] Perform first production deployment: `bunx wrangler deploy`
- [ ] T014 [US1] Verify deployed application is accessible at public URL
- [ ] T015 [US1] Document deployment process in project README.md

**Checkpoint**: US1完了 - アプリケーションがCloudflare Workersで動作し、公開URLでアクセス可能

---

## Phase 4: User Story 2 - 環境変数とシークレットの管理 (Priority: P2)

**Goal**: 開発者が機密情報を安全にCloudflare環境に設定し、アプリケーションから読み取れる

**Independent Test**: 環境変数を設定してデプロイし、アプリケーションがその値を正しく読み取ることを確認

### Tests for User Story 2 (TDD)

- [ ] T016 [P] [US2] Write unit test for environment variable access in `tests/unit/config/env.test.ts`
  - Verify Env interface types
  - Verify environment variable reading from context

### Implementation for User Story 2

- [ ] T017 [P] [US2] Add environment variable definitions to `worker-configuration.d.ts` Env interface
- [ ] T018 [P] [US2] Create development environment variables in `.dev.vars`
- [ ] T019 [US2] Set production secrets using `bunx wrangler secret put BASIC_AUTH_USER`
- [ ] T020 [US2] Set production secrets using `bunx wrangler secret put BASIC_AUTH_PASSWORD`
- [ ] T021 [US2] Verify secrets are set: `bunx wrangler secret list`
- [ ] T022 [US2] Test environment variable access in local dev: `bunx wrangler dev`
- [ ] T023 [US2] Deploy and verify production secrets work correctly

**Checkpoint**: US1 and US2 both work independently - environment variables are securely managed

---

## Phase 5: User Story 3 - Basic認証によるアクセス制限 (Priority: P3)

**Goal**: 開発者がBasic認証を有効化し、正しい認証情報でのみアプリケーションにアクセスできるようにする

**Independent Test**: Basic認証を設定後、認証なしで401エラー、正しい認証情報で200 OKを確認

### Tests for User Story 3 (TDD)

> **NOTE: これらのテストを最初に書き、実装前に失敗することを確認**

- [ ] T024 [P] [US3] Write unit tests for Basic Auth middleware in `tests/unit/middleware/auth.test.ts`
  - Test no Authorization header returns 401
  - Test invalid credentials return 401
  - Test valid credentials proceed to next()
  - Test timing-safe comparison function
  - Test Base64 parsing function
- [ ] T025 [P] [US3] Write E2E test for Basic Auth in `tests/e2e/auth.spec.ts`
  - Test unauthenticated access returns 401
  - Test correct credentials return 200
  - Test incorrect credentials return 401

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create Basic Auth middleware in `app/middleware/auth.ts`
  - Implement timing-safe string comparison function
  - Implement Base64 credential parsing function
  - Implement basicAuthMiddleware with TanStack Start createMiddleware
- [ ] T027 [US3] Add BasicAuthCredentials and AuthResult type definitions to `worker-configuration.d.ts`
- [ ] T028 [US3] Apply middleware globally in `app/router.tsx`
- [ ] T029 [US3] Test Basic Auth locally with `bunx wrangler dev`
- [ ] T030 [US3] Deploy with Basic Auth enabled: `bun run deploy`
- [ ] T031 [US3] Verify authentication with curl: `curl -u admin:password [URL]`
- [ ] T032 [US3] Verify unauthenticated access returns 401: `curl -I [URL]`

**Checkpoint**: US1, US2, US3 all work independently - Basic authentication protects the application

---

## Phase 6: User Story 4 - 継続的デプロイの設定 (Priority: P4)

**Goal**: GitリポジトリのmainブランチへのプッシュでCloudflareへ自動デプロイされる

**Independent Test**: mainブランチにコミットをプッシュし、GitHub Actionsで自動デプロイが実行されることを確認

### Tests for User Story 4 (TDD)

- [ ] T033 [P] [US4] Write integration test for CI/CD workflow validation in `tests/integration/ci-cd.test.ts`
  - Verify workflow YAML syntax
  - Verify required secrets are documented

### Implementation for User Story 4

- [ ] T034 [P] [US4] Create GitHub Actions workflow file `.github/workflows/deploy.yml`
  - Configure Bun setup (oven-sh/setup-bun@v1)
  - Add build step: `bun run build`
  - Add test step: `bun test`
  - Add lint step: `bun run lint`
  - Add Cloudflare deployment with cloudflare/wrangler-action@v3
- [ ] T035 [US4] Create Cloudflare API token with Workers edit permissions
- [ ] T036 [US4] Add GitHub Secrets: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID
- [ ] T037 [US4] Test CI/CD by pushing to main branch
- [ ] T038 [US4] Verify GitHub Actions workflow executes successfully
- [ ] T039 [US4] Verify automatic deployment completes
- [ ] T040 [US4] Document CI/CD setup in README.md

**Checkpoint**: All user stories work independently - continuous deployment automates the release process

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 複数のユーザーストーリーに影響する改善

- [ ] T041 [P] Add comprehensive deployment documentation to README.md
- [ ] T042 [P] Create troubleshooting guide based on quickstart.md
- [ ] T043 [P] Add custom domain configuration documentation (manual DNS setup)
- [ ] T044 [P] Verify all TypeScript types are properly defined (Constitution Check I)
- [ ] T045 [P] Run performance validation: verify bundle size < 1MB
- [ ] T046 [P] Security audit: verify no secrets in Git history
- [ ] T047 Run full test suite: `bun test`
- [ ] T048 Run quickstart.md validation end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 依存関係なし - すぐに開始可能
- **Foundational (Phase 2)**: Setupの完了に依存 - すべてのユーザーストーリーをブロック
- **User Stories (Phase 3-6)**: すべてFoundational完了に依存
  - その後、ユーザーストーリーは並列実行可能（人員がいる場合）
  - または優先順位順に順次実行（P1 → P2 → P3 → P4）
- **Polish (Phase 7)**: 必要なすべてのユーザーストーリーの完了に依存

### User Story Dependencies

- **User Story 1 (P1)**: Foundational (Phase 2) 完了後に開始可能 - 他ストーリーへの依存なし
- **User Story 2 (P2)**: Foundational (Phase 2) 完了後に開始可能 - US1と統合するが独立してテスト可能
- **User Story 3 (P3)**: Foundational (Phase 2) 完了後に開始可能 - US1, US2を使用するが独立してテスト可能
- **User Story 4 (P4)**: Foundational (Phase 2) 完了後に開始可能 - US1のデプロイプロセスを自動化するが独立してテスト可能

### Within Each User Story

- テストは実装前に書き、失敗することを確認（TDD）
- ミドルウェア実装前に型定義
- ローカルテスト後に本番デプロイ
- ストーリー完了後に次の優先順位へ

### Parallel Opportunities

- Setup内のすべての[P]タスクは並列実行可能
- Foundational内のすべての[P]タスクは並列実行可能
- Foundational完了後、すべてのユーザーストーリーは並列開始可能（チーム人数が許せば）
- 各ストーリー内の[P]マークのテストは並列実行可能
- 異なるユーザーストーリーは異なるチームメンバーが並列作業可能

---

## Parallel Example: User Story 3

```bash
# US3のすべてのテストを同時に起動:
Task: "Write unit tests for Basic Auth middleware in tests/unit/middleware/auth.test.ts"
Task: "Write E2E test for Basic Auth in tests/e2e/auth.spec.ts"

# US3の並列実装タスク:
Task: "Create Basic Auth middleware in app/middleware/auth.ts"
Task: "Add type definitions to worker-configuration.d.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1のみ)

1. Phase 1: Setupを完了
2. Phase 2: Foundationalを完了（CRITICAL - すべてのストーリーをブロック）
3. Phase 3: User Story 1を完了
4. **STOP and VALIDATE**: US1を独立してテスト
5. 準備ができたらデプロイ/デモ

### Incremental Delivery

1. Setup + Foundational完了 → 基盤準備完了
2. User Story 1追加 → 独立してテスト → デプロイ/デモ（MVP!）
3. User Story 2追加 → 独立してテスト → デプロイ/デモ
4. User Story 3追加 → 独立してテスト → デプロイ/デモ
5. User Story 4追加 → 独立してテスト → デプロイ/デモ
6. 各ストーリーは前のストーリーを壊さずに価値を追加

### Parallel Team Strategy

複数の開発者がいる場合:

1. チームでSetup + Foundationalを一緒に完了
2. Foundational完了後:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
   - Developer D: User Story 4
3. ストーリーは独立して完了し統合

---

## Notes

- [P] タスク = 異なるファイル、依存関係なし
- [Story] ラベルはタスクを特定のユーザーストーリーにマッピング（トレーサビリティ用）
- 各ユーザーストーリーは独立して完了・テスト可能
- 実装前にテストが失敗することを確認（TDD）
- 各タスクまたは論理グループ後にコミット
- 任意のチェックポイントで停止してストーリーを独立して検証
- 避ける: 曖昧なタスク、同じファイルの競合、独立性を壊すクロスストーリー依存関係
- 憲章準拠: 型安全性（TypeScript strict）、パフォーマンス（バンドル<1MB）、テストファースト（TDD）、シンプルさ（YAGNI）、CI/CD自動化
