/**
 * Runs async functions with a bounded concurrency limit.
 * Useful for API calls where you want to limit parallel requests.
 *
 * @param items - Array of items to process
 * @param limit - Maximum number of concurrent operations
 * @param fn - Async function to apply to each item
 * @returns Promise resolving to results in the same order as input items
 * @throws First error encountered (after all in-progress operations complete)
 */
export async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  if (limit <= 0) {
    throw new Error("Concurrency limit must be greater than 0");
  }

  const results: R[] = new Array(items.length);
  const errors: Array<{ index: number; error: Error }> = [];
  let currentIndex = 0;

  async function processNext(): Promise<void> {
    while (currentIndex < items.length) {
      const index = currentIndex++;
      const item = items[index];

      try {
        results[index] = await fn(item);
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }
  }

  const workerCount = Math.min(limit, items.length);
  const workers: Promise<void>[] = [];

  for (let i = 0; i < workerCount; i++) {
    workers.push(processNext());
  }

  await Promise.all(workers);

  if (errors.length > 0) {
    errors.sort((a, b) => a.index - b.index);
    throw errors[0].error;
  }

  return results;
}

export default runWithConcurrencyLimit;
