import { describe, expect, it } from "vitest";
import { checkInMemoryRateLimit, resetInMemoryRateLimit } from "./rateLimiter";

describe("checkInMemoryRateLimit", () => {
  it("allows requests within the configured window and rejects excess requests", () => {
    resetInMemoryRateLimit();

    expect(checkInMemoryRateLimit("client-a", 1_000, { windowMs: 10_000, maxRequests: 2 })).toEqual({
      allowed: true
    });
    expect(checkInMemoryRateLimit("client-a", 2_000, { windowMs: 10_000, maxRequests: 2 })).toEqual({
      allowed: true
    });
    expect(checkInMemoryRateLimit("client-a", 3_000, { windowMs: 10_000, maxRequests: 2 })).toEqual({
      allowed: false,
      retryAfterSeconds: 8
    });
  });

  it("resets the request bucket after the window expires", () => {
    resetInMemoryRateLimit();

    expect(checkInMemoryRateLimit("client-b", 1_000, { windowMs: 1_000, maxRequests: 1 })).toEqual({
      allowed: true
    });
    expect(checkInMemoryRateLimit("client-b", 2_000, { windowMs: 1_000, maxRequests: 1 })).toEqual({
      allowed: true
    });
  });

  it("bounds tracked identifiers by evicting the oldest bucket", () => {
    resetInMemoryRateLimit();
    const options = { windowMs: 10_000, maxRequests: 1, maxTrackedIdentifiers: 2 };

    checkInMemoryRateLimit("client-a", 1_000, options);
    checkInMemoryRateLimit("client-b", 1_000, options);
    checkInMemoryRateLimit("client-c", 1_000, options);

    expect(checkInMemoryRateLimit("client-a", 2_000, options)).toEqual({ allowed: true });
  });
});
