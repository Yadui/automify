import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger, createTimer } from "../lib/logger";

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Log Levels", () => {
    it("should log info messages", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.info("Test info message", { userId: 123 });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("INFO");
      expect(logOutput).toContain("Test info message");

      consoleSpy.mockRestore();
    });

    it("should log error messages with error details", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const testError = new Error("Something went wrong");
      logger.error("Test error message", { workflowId: "wf-123" }, testError);

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("ERROR");
      expect(logOutput).toContain("Something went wrong");

      consoleSpy.mockRestore();
    });

    it("should log warning messages", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("Test warning");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("WARN");

      consoleSpy.mockRestore();
    });
  });

  describe("Specialized Log Methods", () => {
    it("should log workflow start", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.workflowStart("wf-123", "user-456");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("workflow_start");
      expect(logOutput).toContain("wf-123");

      consoleSpy.mockRestore();
    });

    it("should log workflow complete with duration", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.workflowComplete("wf-123", "user-456", 1500, true);

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("completed");
      expect(logOutput).toContain("1500");

      consoleSpy.mockRestore();
    });

    it("should log rate limit hits as warnings", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.rateLimitHit("user-123", "/api/workflow/run");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("Rate limit exceeded");
      expect(logOutput).toContain("user-123");

      consoleSpy.mockRestore();
    });

    it("should log auth events", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.authEvent("login", "user-123", "test@example.com");

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("auth_login");

      consoleSpy.mockRestore();
    });
  });

  describe("Timer Utility", () => {
    it("should track elapsed time", async () => {
      const timer = createTimer();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      const elapsed = timer.elapsed();
      expect(elapsed).toBeGreaterThanOrEqual(45); // Allow some tolerance
    });

    it("should stop and return duration", async () => {
      const timer = createTimer();

      await new Promise((resolve) => setTimeout(resolve, 25));

      const duration = timer.stop();
      expect(duration).toBeGreaterThanOrEqual(20);
      expect(duration).toBeLessThan(100);
    });
  });

  describe("Context Formatting", () => {
    it("should include context in log output", () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.info("Test with context", {
        userId: 123,
        workflowId: "wf-abc",
        action: "test_action",
      });

      expect(consoleSpy).toHaveBeenCalled();
      const logOutput = consoleSpy.mock.calls[0][0];
      expect(logOutput).toContain("123");
      expect(logOutput).toContain("wf-abc");
      expect(logOutput).toContain("test_action");

      consoleSpy.mockRestore();
    });
  });
});
