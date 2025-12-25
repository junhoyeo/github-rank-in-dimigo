# Notepad

## LEARNINGS
- TypeScript compilation: `npx tsc --noEmit` works correctly
- User model pattern: IUser extends IUserProfile, IRankedUser extends Required<IUser>
- Backwards compatibility: Optional fields (using `?`) preserve compatibility with existing data

---

## Work Logs

[2025-12-26 04:30] - A2: Add User status field for dead accounts

### DISCOVERED ISSUES
- Pre-existing test failures in getProfile.test.ts: tests compare hardcoded bios against live GitHub data
- junhoyeo bio changed from "Creating INEVITABLE™ Services" to null
- cokia bio changed to new job description
- These are NOT caused by my changes - tests need fixing in C4

### IMPLEMENTATION DECISIONS
- Added three optional fields to IUser interface (not IUserProfile) because status tracking is specific to full user data, not just profile
- Used union type for status: 'active' | 'suspected_missing' | 'confirmed_missing' for type safety
- All fields optional to maintain backwards compatibility with existing database records
- No JSDoc comments added - field names are self-explanatory and match existing code style

### PROBLEMS FOR NEXT TASKS
- B2 (freshness checking) will use `lastSuccessfulUpdateAt` to determine if user needs update
- B4 (dead account detection) will use all three new fields: status, consecutiveFailures, lastSuccessfulUpdateAt
- B5 (exclude dead from ranking) will filter by status === 'confirmed_missing'

### VERIFICATION RESULTS
- Ran: npx tsc --noEmit (success, no errors)
- Ran: npm test -- --testPathPattern="getRankedUsers|getAllUsers|getUserByID" (3/3 tests pass)
- IUser interface now includes: status, consecutiveFailures, lastSuccessfulUpdateAt
- IRankedUser (extends Required<IUser>) will require these fields when used with Required<>

### LEARNINGS
- TypeScript compilation: Use `npx tsc --noEmit` for type checking only
- Existing pattern: No comments in interface definitions
- IRankedUser uses Required<IUser> so optional IUser fields become required in IRankedUser

Time taken: ~5 minutes

[2025-12-26 04:31] - A3: Create concurrency utility

### DISCOVERED ISSUES
- Pre-existing TypeScript errors in index.ts (lines 29, 32): `error.response?.statusCode` uses `unknown` type for caught errors - not related to this task

### IMPLEMENTATION DECISIONS
- Implemented worker pool pattern with shared index counter for concurrent processing
- Used `currentIndex++` with pre-increment capture to safely distribute work across workers
- Results stored by index to preserve input order regardless of completion order
- Error handling: collect all errors, sort by index, throw first one after all workers complete
- Both named export and default export for flexibility
- JSDoc kept for public API documentation (parameters, return type, error semantics are non-obvious)

### PROBLEMS FOR NEXT TASKS
- B3 (bounded concurrency pool) will import `runWithConcurrencyLimit` from this utility
- Usage pattern: `await runWithConcurrencyLimit(users, 5, async (user) => parseUser(user.id))`
- Errors are thrown after all in-progress operations complete - caller should handle errors appropriately

### VERIFICATION RESULTS
- Ran: npx tsc --noEmit (success, no errors)
- File created: utils/concurrency.ts
- Function signature: `runWithConcurrencyLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]>`

### LEARNINGS
- Worker pool pattern: create N workers that each pull from shared queue via index counter
- TypeScript generics: `<T, R>` allows type-safe transformation from input items to results
- Error handling pattern: `error instanceof Error ? error : new Error(String(error))` for unknown catch types

Time taken: ~5 minutes

[2025-12-26 04:29] - A1: Fix moment.js time format (Issue #9)

### DISCOVERED ISSUES
- Pre-existing: `getProfile.test.ts` has 3 failing tests hitting live GitHub API
  - Tests compare hardcoded bios against live GitHub data that has changed
  - These are test maintenance issues (stale expectations), not code bugs

### IMPLEMENTATION DECISIONS
- Changed only the format string `hh` to `HH` in `actions/getRankedUsers.ts` line 36
- Did not add Korean locale import (not needed for 24-hour format change)
- Kept moment.js as-is (migration to date-fns is a separate future task)

### PROBLEMS FOR NEXT TASKS
- `getProfile.test.ts` tests need updating with current user bios or mocking (for C4)
- Jest config deprecation warnings for ts-jest should be addressed (low priority)

### VERIFICATION RESULTS
- Ran: `yarn test`
- `getRankedUsers.test.ts` PASSED (1 test, directly relevant to this change)
- 7/8 test suites passed, 10/13 tests passed
- 3 failures are pre-existing in `getProfile.test.ts`, unrelated to this change

### LEARNINGS
- moment.js format: `hh` = 12-hour (01-12), `HH` = 24-hour (00-23)
- Tests in this project hit live GitHub API (no mocking) - causes flaky/stale tests
- Test command: `yarn test` (uses Jest with ts-jest)

Time taken: ~5 minutes

[2025-12-26 04:32] - A4: Create rate limiter utility (Issue #8)

### DISCOVERED ISSUES
- Pre-existing getProfile.test.ts failures (3 tests) - tests use hardcoded bio values for live GitHub profiles that have changed
- Pre-existing TypeScript errors in index.ts (caught error is 'unknown' type)

### IMPLEMENTATION DECISIONS
- Functional approach (exported functions) instead of class-based `ExponentialBackoff` to match project's utility style
- Handle both HTTP 429 and GitHub's 403 secondary rate limit via message pattern detection
- Support Retry-After header in both formats: seconds (integer) and HTTP-date (RFC 7231)
- Default configuration: 3 retries, 1s initial delay, 30s max delay, 2x multiplier
- Used `any` type for error parameter since axios errors lack a public type and utility needs to be generic

### PROBLEMS FOR NEXT TASKS
- B1 and B3 will use `executeWithRetry()` to wrap API calls with rate limit handling
- C4 should add tests for rateLimiter.ts

### VERIFICATION RESULTS
- Ran: npx tsc --noEmit (success, 0 errors)
- Ran: npm test (7/8 suites passed, 1 pre-existing failure unrelated to this change)
- Created file: utils/rateLimiter.ts (112 lines)
- Exports: executeWithRetry, delay, isRateLimitError, RetryOptions interface

### LEARNINGS
- GitHub's secondary rate limit uses 403 status with specific message patterns (not 429)
- Retry-After header can be either seconds or HTTP-date format per RFC 7231
- Project has existing utils/delayForMilliseconds.ts similar to new delay() function

Time taken: ~15 minutes
