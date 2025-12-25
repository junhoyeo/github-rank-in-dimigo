export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRateLimitError(error: any): boolean {
  if (!error) {
    return false;
  }

  const status = error.response?.status ?? error.status;

  if (status === 429) {
    return true;
  }

  // GitHub's secondary rate limit returns 403 with specific message patterns
  if (status === 403) {
    const message = (error.response?.data?.message ?? error.message ?? '').toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('abuse detection') ||
      message.includes('secondary rate limit') ||
      message.includes('too many requests')
    );
  }

  return false;
}

function getRetryAfterMs(error: any): number | null {
  const retryAfter = error.response?.headers?.['retry-after'];
  if (!retryAfter) {
    return null;
  }

  // Retry-After can be seconds (integer) or HTTP-date (RFC 7231)
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  const date = Date.parse(retryAfter);
  if (!isNaN(date)) {
    return Math.max(0, date - Date.now());
  }

  return null;
}

export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;
  let currentDelayMs = config.initialDelayMs;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!isRateLimitError(error)) {
        throw error;
      }

      if (attempt >= config.maxRetries) {
        console.error(
          `[RateLimiter] Max retries (${config.maxRetries}) exceeded. Giving up.`
        );
        throw error;
      }

      const retryAfterMs = getRetryAfterMs(error);
      const delayMs = retryAfterMs !== null
        ? Math.min(retryAfterMs, config.maxDelayMs)
        : Math.min(currentDelayMs, config.maxDelayMs);

      console.warn(
        `[RateLimiter] Rate limited (attempt ${attempt + 1}/${config.maxRetries + 1}). ` +
        `Retrying in ${delayMs}ms...`
      );

      await delay(delayMs);

      currentDelayMs = Math.min(
        currentDelayMs * config.backoffMultiplier,
        config.maxDelayMs
      );
    }
  }

  throw lastError;
}

export default executeWithRetry;
