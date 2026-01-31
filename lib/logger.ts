/**
 * Structured logging utility for better observability
 * Provides consistent log formatting, log levels, and context tracking
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string | number;
  workflowId?: string;
  nodeId?: string;
  action?: string;
  duration?: number;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Log level priority for filtering
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default minimum log level (can be configured via env)
const MIN_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  const { timestamp, level, message, context, error } = entry;

  // Colored level for dev, plain for production
  const levelStr = level.toUpperCase().padEnd(5);

  let output = `[${timestamp}] ${levelStr} ${message}`;

  if (context && Object.keys(context).length > 0) {
    output += ` ${JSON.stringify(context)}`;
  }

  if (error) {
    output += `\n  Error: ${error.name}: ${error.message}`;
    if (error.stack && process.env.NODE_ENV !== "production") {
      output += `\n  Stack: ${error.stack}`;
    }
  }

  return output;
}

/**
 * Create a log entry and output it
 */
function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error,
): void {
  // Skip if below minimum log level
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LOG_LEVEL]) {
    return;
  }

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  const formatted = formatLogEntry(entry);

  // Output based on level
  switch (level) {
    case "error":
      console.error(formatted);
      break;
    case "warn":
      console.warn(formatted);
      break;
    case "debug":
      console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }

  // In production, you could send to external logging service here
  // e.g., Sentry, LogDNA, CloudWatch, etc.
}

/**
 * Logger instance with methods for each log level
 */
export const logger = {
  debug: (message: string, context?: LogContext) =>
    log("debug", message, context),
  info: (message: string, context?: LogContext) =>
    log("info", message, context),
  warn: (message: string, context?: LogContext) =>
    log("warn", message, context),
  error: (message: string, context?: LogContext, error?: Error) =>
    log("error", message, context, error),

  /**
   * Log workflow execution start
   */
  workflowStart: (workflowId: string, userId: string | number) => {
    log("info", "Workflow execution started", {
      workflowId,
      userId,
      action: "workflow_start",
    });
  },

  /**
   * Log workflow execution complete
   */
  workflowComplete: (
    workflowId: string,
    userId: string | number,
    duration: number,
    success: boolean,
  ) => {
    log(
      success ? "info" : "error",
      `Workflow execution ${success ? "completed" : "failed"}`,
      {
        workflowId,
        userId,
        duration,
        action: "workflow_complete",
        success,
      },
    );
  },

  /**
   * Log node execution
   */
  nodeExecution: (
    workflowId: string,
    nodeId: string,
    nodeType: string,
    success: boolean,
    duration?: number,
  ) => {
    log(
      success ? "debug" : "warn",
      `Node ${nodeType} ${success ? "executed" : "failed"}`,
      {
        workflowId,
        nodeId,
        nodeType,
        success,
        duration,
        action: "node_execution",
      },
    );
  },

  /**
   * Log API request
   */
  apiRequest: (
    method: string,
    path: string,
    userId?: string | number,
    statusCode?: number,
  ) => {
    log("info", `API ${method} ${path}`, {
      method,
      path,
      userId,
      statusCode,
      action: "api_request",
    });
  },

  /**
   * Log rate limit hit
   */
  rateLimitHit: (identifier: string, endpoint: string) => {
    log("warn", "Rate limit exceeded", {
      identifier,
      endpoint,
      action: "rate_limit",
    });
  },

  /**
   * Log authentication event
   */
  authEvent: (
    event: "login" | "logout" | "register" | "failed",
    userId?: string | number,
    email?: string,
  ) => {
    log(event === "failed" ? "warn" : "info", `Auth event: ${event}`, {
      userId,
      email,
      action: `auth_${event}`,
    });
  },
};

/**
 * Performance timing helper
 */
export function createTimer() {
  const start = Date.now();
  return {
    elapsed: () => Date.now() - start,
    stop: () => {
      const duration = Date.now() - start;
      return duration;
    },
  };
}

export default logger;
