import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  RATE_LIMITS,
  RateLimitConfig,
} from "../lib/rate-limit";

describe("Rate Limiting", () => {
  beforeEach(() => {
    // Note: In a real implementation, you'd want to reset the store between tests
    // For now, we'll use unique identifiers per test
  });

  it("should allow requests within limit", () => {
    const config: RateLimitConfig = {
      limit: 5,
      windowSeconds: 60,
      prefix: "test1",
    };
    const identifier = `user-${Date.now()}-1`;

    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(identifier, config);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4 - i);
    }
  });

  it("should block requests over limit", () => {
    const config: RateLimitConfig = {
      limit: 3,
      windowSeconds: 60,
      prefix: "test2",
    };
    const identifier = `user-${Date.now()}-2`;

    // Use up all requests
    for (let i = 0; i < 3; i++) {
      checkRateLimit(identifier, config);
    }

    // Next request should be blocked
    const blockedResult = checkRateLimit(identifier, config);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
    expect(blockedResult.resetIn).toBeGreaterThan(0);
  });

  it("should have correct limit value in result", () => {
    const config: RateLimitConfig = {
      limit: 10,
      windowSeconds: 60,
      prefix: "test3",
    };
    const identifier = `user-${Date.now()}-3`;

    const result = checkRateLimit(identifier, config);
    expect(result.limit).toBe(10);
  });

  it("should use preset configurations correctly", () => {
    const identifier = `user-${Date.now()}-preset`;

    // Test workflow run preset (30/min)
    const workflowResult = checkRateLimit(identifier, RATE_LIMITS.workflowRun);
    expect(workflowResult.limit).toBe(30);
    expect(workflowResult.success).toBe(true);

    // Test auth preset (5/min)
    const authIdentifier = `auth-${Date.now()}`;
    const authResult = checkRateLimit(authIdentifier, RATE_LIMITS.auth);
    expect(authResult.limit).toBe(5);
    expect(authResult.success).toBe(true);
  });

  it("should track different identifiers separately", () => {
    const config: RateLimitConfig = {
      limit: 2,
      windowSeconds: 60,
      prefix: "test4",
    };
    const user1 = `user1-${Date.now()}`;
    const user2 = `user2-${Date.now()}`;

    // Exhaust user1's limit
    checkRateLimit(user1, config);
    checkRateLimit(user1, config);
    const user1Blocked = checkRateLimit(user1, config);
    expect(user1Blocked.success).toBe(false);

    // User2 should still have full limit
    const user2Result = checkRateLimit(user2, config);
    expect(user2Result.success).toBe(true);
    expect(user2Result.remaining).toBe(1);
  });
});
