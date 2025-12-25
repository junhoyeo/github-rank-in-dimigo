# Work Plan: github-rank-in-dimigo Improvements

## Summary

Transform the GitHub ranking tool from slow web scraping with sequential processing to a fast, robust system using GitHub GraphQL API with concurrent processing.

**Key Changes:**
- ❌ NO Rust rewrite (I/O-bound workload, not worth it)
- ✅ Replace web scraping with GitHub GraphQL API
- ✅ Add bounded concurrency (5 parallel requests)
- ✅ Implement freshness checking (skip recently updated)
- ✅ Handle dead accounts gracefully

**Estimated Total Time:** ~6-7 hours (with parallelization)

---

## Currently In Progress
None (C3 completed)

## Task List

### 🟢 PHASE 1: Foundation Tasks (Parallelizable)

- [x] **A1: Fix moment.js time format (Issue #9)** ✅ COMPLETED 2025-12-26
  - **File:** `actions/getRankedUsers.ts` (line 36)
  - **Change:** `hh:mm:ss` → `HH:mm:ss` (24-hour format)
  - **Effort:** 15min
  - **Parallelizable:** YES (with A2, A3, A4)
  - **Acceptance Criteria:**
    - [x] Times display in 24-hour format (e.g., "14:30:00" not "02:30:00")
    - [x] Existing tests pass

- [x] **A2: Add User status field (Issue #42)** ✅ COMPLETED 2025-12-26
  - **File:** `models/User.ts`
  - **Change:** Add `status?: 'active' | 'suspected_missing' | 'confirmed_missing'`
  - **Effort:** 15min
  - **Parallelizable:** YES (with A1, A3, A4)
  - **Acceptance Criteria:**
    - [x] IUser interface includes optional status field
    - [x] Backwards compatible with existing data

- [x] **A3: Create concurrency utility (Issue #8)** ✅ COMPLETED 2025-12-26
  - **New File:** `utils/concurrency.ts`
  - **Effort:** 30min
  - **Parallelizable:** YES (with A1, A2, A4)
  - **Acceptance Criteria:**
    - [x] `runWithConcurrencyLimit<T>(items, limit, fn)` function works
    - [x] Processes `limit` items concurrently
    - [x] Handles partial failures gracefully

- [x] **A4: Create rate limiter utility (Issue #8)** ✅ COMPLETED 2025-12-26
  - **New File:** `utils/rateLimiter.ts`
  - **Effort:** 30min
  - **Parallelizable:** YES (with A1, A2, A3)
  - **Acceptance Criteria:**
    - [x] `executeWithRetry(fn)` retries with 1s, 2s, 4s delays on 429/403
    - [x] Max 3 retries before throwing

---

### 🟡 PHASE 2: Core Processing Improvements (Sequential)

- [x] **B1: Replace web scraping with GraphQL API (Issue #8)** ✅ COMPLETED 2025-12-26
  - **Files:** `actions/parseUser/getStars.ts`, `utils/githubGraphQL.ts` (new)
  - **Effort:** 1.5h
  - **Parallelizable:** NO (depends on A3, A4)
  - **Acceptance Criteria:**
    - [x] Uses `GITHUB_TOKEN` env variable
    - [x] GraphQL query fetches all repos with stargazerCount
    - [x] Handles pagination correctly
    - [x] Falls back to web scraping if no token provided

- [x] **B2: Implement freshness checking (Issue #8)** ✅ COMPLETED 2025-12-26
  - **Files:** `actions/parseUser/index.ts`
  - **Effort:** 1h
  - **Parallelizable:** NO (depends on A2)
  - **Acceptance Criteria:**
    - [x] Users updated <24h ago are skipped
    - [x] `SKIP_IF_UPDATED_WITHIN_SECONDS` env variable controls threshold
    - [x] `FORCE_UPDATE=1` bypasses freshness check
    - [x] Log indicates skipped users

- [x] **B3: Implement bounded concurrency pool (Issue #8)** ✅ COMPLETED 2025-12-26
  - **File:** `index.ts`
  - **Effort:** 1h
  - **Parallelizable:** NO (depends on A3, B1, B2)
  - **Acceptance Criteria:**
    - [x] Processes 5 users concurrently (configurable via `CONCURRENCY` env)
    - [x] Oldest users (by updatedAt) processed first
    - [x] Rate limiting handled via exponential backoff
    - [x] Fixed 3-second delays removed

- [x] **B4: Dead account detection (Issue #42)** ✅ COMPLETED 2025-12-26
  - **Files:** `actions/parseUser/index.ts`, `database/updateUser.ts`
  - **Effort:** 1h
  - **Parallelizable:** NO (depends on A2, B3)
  - **Acceptance Criteria:**
    - [x] 404 responses set status to `suspected_missing`
    - [x] Consecutive 404s (3+) set status to `confirmed_missing`
    - [x] Successful fetch sets status to `active`
    - [x] Processing continues after 404 (doesn't break loop)

- [x] **B5: Exclude dead accounts from ranking (Issue #42)** ✅ COMPLETED 2025-12-26
  - **File:** `actions/getRankedUsers.ts`
  - **Effort:** 30min
  - **Parallelizable:** NO (depends on B4)
  - **Acceptance Criteria:**
    - [x] `confirmed_missing` users excluded from HTML output
    - [x] `active` and `suspected_missing` users still appear

---

### 🔵 PHASE 3: Polish & CI (After Phase 2)

- [x] **C1: Sort ALLOWLIST at runtime (Issue #15)** ✅ COMPLETED 2025-12-26
  - **File:** `actions/parseAllowList.ts`
  - **Effort:** 15min
  - **Parallelizable:** YES (with C2, C3)
  - **Acceptance Criteria:**
    - [x] ALLOWLIST parsed in case-insensitive alphabetical order
    - [x] Duplicates removed

- [x] **C2: Sort database output alphabetically (Issue #15)** ✅ COMPLETED 2025-12-26
  - **File:** `database/getAllUsers.ts` or end of `index.ts`
  - **Effort:** 30min
  - **Parallelizable:** YES (with C1, C3)
  - **Acceptance Criteria:**
    - [x] Users returned/saved alphabetically by ID (case-insensitive)
    - [x] Git diff is clean/minimal

- [x] **C3: Add CI verification for sorting (Issue #15)** ✅ COMPLETED 2025-12-26
  - **New File:** `scripts/verify-sorted.ts`, update `.github/workflows/Update.yml`
  - **Effort:** 30min
  - **Parallelizable:** YES (with C1, C2)
  - **Acceptance Criteria:**
    - [x] CI fails on unsorted ALLOWLIST in PRs
    - [x] Clear error message

- [ ] **C4: Update tests for new functionality**
  - **Files:** All `*.test.ts` files
  - **Effort:** 1h
  - **Parallelizable:** NO (depends on all above)
  - **Acceptance Criteria:**
    - [ ] All existing tests pass
    - [ ] New tests for GraphQL, freshness, dead accounts, sorting

---

## Execution Order Diagram

```
PHASE 1 (Parallel - ~30min wall time)
├── A1: Fix moment format         [15min] ─┐
├── A2: Add status field          [15min] ─┼── Execute simultaneously
├── A3: Concurrency utility       [30min] ─┤
└── A4: Rate limiter utility      [30min] ─┘

PHASE 2 (Sequential - ~5 hours)
├── B1: GraphQL star counting     [1.5h]  ← Depends on A3, A4
├── B2: Freshness checking        [1h]    ← Depends on A2
├── B3: Concurrency pool          [1h]    ← Depends on A3, B1, B2
├── B4: Dead account detection    [1h]    ← Depends on A2, B3
└── B5: Exclude dead from ranking [30min] ← Depends on B4

PHASE 3 (Mostly Parallel - ~1.5h wall time)
├── C1: Sort ALLOWLIST            [15min] ─┐
├── C2: Sort database output      [30min] ─┼── Execute simultaneously
├── C3: CI verification           [30min] ─┤
└── C4: Update tests              [1h]    ─┘ (after C1-C3)
```

---

## Configuration

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `GITHUB_TOKEN` | (required for GraphQL) | GitHub Personal Access Token |
| `CONCURRENCY` | `5` | Number of parallel requests |
| `SKIP_IF_UPDATED_WITHIN_SECONDS` | `86400` (24h) | Freshness threshold |
| `FORCE_UPDATE` | `0` | Set to `1` to bypass freshness check |

---

## Commit Strategy

Each task should have a descriptive commit:
- `fix(moment): use 24-hour format in timestamps (#9)`
- `feat(user): add status field for dead account tracking (#42)`
- `feat(utils): add concurrency pool utility (#8)`
- `feat(utils): add exponential backoff rate limiter (#8)`
- `feat(api): replace web scraping with GitHub GraphQL (#8)`
- `feat(core): add freshness checking to skip recent users (#8)`
- `feat(core): implement bounded concurrency processing (#8)`
- `feat(core): detect and track dead accounts (#42)`
- `feat(rank): exclude confirmed dead accounts from output (#42)`
- `feat(parse): sort ALLOWLIST alphabetically (#15)`
- `feat(db): sort database output alphabetically (#15)`
- `ci: add verification for sorted ALLOWLIST (#15)`
- `test: update tests for new functionality`

---

## Notes

### Decisions Made
1. **No Rust rewrite** - I/O-bound workload, TypeScript optimization is sufficient
2. **GraphQL with fallback** - Use GraphQL when token available, fall back to scraping
3. **24h freshness** - Skip users updated within last 24 hours
4. **5 concurrent requests** - Balance between speed and rate limits
5. **Status field approach** - Track dead accounts with status progression, not auto-removal
6. **CI verification only** - No pre-commit hook, rely on CI for ALLOWLIST sorting
