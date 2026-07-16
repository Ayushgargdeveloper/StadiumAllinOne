export type RateLimitDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

type RateLimitOptions = {
  windowMs?: number;
  maxRequests?: number;
  maxTrackedIdentifiers?: number;
};

type ResolvedRateLimitOptions = Required<RateLimitOptions>;

type RateLimitBucket = {
  count: number;
  resetAtMs: number;
};

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 60;
const DEFAULT_MAX_TRACKED_IDENTIFIERS = 10_000;
const buckets = new Map<string, RateLimitBucket>();

export function checkInMemoryRateLimit(
  identifier: string,
  nowMs = Date.now(),
  options: RateLimitOptions = {}
): RateLimitDecision {
  const resolvedOptions = resolveOptions(options);
  const bucket = buckets.get(identifier);

  if (bucket === undefined || nowMs >= bucket.resetAtMs) {
    return startRateLimitWindow(identifier, nowMs, bucket, resolvedOptions);
  }

  if (bucket.count >= resolvedOptions.maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAtMs - nowMs) / 1_000))
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function resetInMemoryRateLimit(): void {
  buckets.clear();
}

function startRateLimitWindow(
  identifier: string,
  nowMs: number,
  previousBucket: RateLimitBucket | undefined,
  options: ResolvedRateLimitOptions
): RateLimitDecision {
  if (previousBucket === undefined) {
    ensureBucketCapacity(options.maxTrackedIdentifiers);
  }

  buckets.set(identifier, { count: 1, resetAtMs: nowMs + options.windowMs });
  return { allowed: true };
}

function resolveOptions(options: RateLimitOptions): ResolvedRateLimitOptions {
  return {
    windowMs: options.windowMs ?? DEFAULT_WINDOW_MS,
    maxRequests: options.maxRequests ?? DEFAULT_MAX_REQUESTS,
    maxTrackedIdentifiers: options.maxTrackedIdentifiers ?? DEFAULT_MAX_TRACKED_IDENTIFIERS
  };
}

function ensureBucketCapacity(maxTrackedIdentifiers: number): void {
  if (buckets.size < Math.max(1, maxTrackedIdentifiers)) {
    return;
  }

  const oldestIdentifier = buckets.keys().next().value;
  if (oldestIdentifier !== undefined) {
    buckets.delete(oldestIdentifier);
  }
}
