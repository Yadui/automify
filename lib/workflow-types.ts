/**
 * Workflow Node Type Definitions
 *
 * This file contains the canonical type definitions for all workflow nodes,
 * their configurations, and execution context.
 */

// =============================================================================
// SYSTEM VARIABLES
// =============================================================================

/**
 * System variables available in all template expressions.
 * These are resolved at runtime and should be referenced using {{variable}} syntax.
 *
 * @example
 * - {{now}}          - Current ISO timestamp when the node executes
 * - {{runId}}        - Unique identifier for this workflow run
 * - {{workflowId}}   - ID of the current workflow
 * - {{triggeredAt}}  - ISO timestamp when the workflow was triggered
 * - {{nodeId}}       - ID of the current node being executed
 *
 * Secret references (never exported or logged):
 * - {{secret.apiKey}}      - User-defined secret
 * - {{secret.bearerToken}} - User-defined secret
 */
export interface SystemVariables {
  now: string; // ISO 8601 timestamp
  runId: string; // UUID
  workflowId: string; // Workflow ID
  triggeredAt: string; // ISO 8601 timestamp
  nodeId: string; // Current node ID
}

// =============================================================================
// EXECUTION CONTEXT
// =============================================================================

/**
 * Node execution record for debugging, history, and support.
 */
export interface NodeExecutionRecord {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  duration: number; // Milliseconds
  status: "pending" | "running" | "success" | "error" | "skipped";
  error?: string;
  startedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp
}

/**
 * Workflow run context - accumulates as nodes execute.
 */
export interface ExecutionContext {
  runId: string;
  workflowId: string;
  triggeredAt: string;
  trigger: Record<string, unknown>; // Trigger node output
  steps: Record<string, unknown>; // { [nodeId]: nodeOutput }
  system: SystemVariables;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Workflow-level error behavior.
 *
 * Note: Future enhancement will allow per-node error handling override.
 */
export interface ErrorBehavior {
  onError: "stop" | "continue";
  retryPolicy?: {
    maxRetries: number; // 0-3
    backoffMs: number; // Initial backoff
    maxBackoffMs: number; // Max backoff cap
  };
}

// =============================================================================
// DATA TRANSFORM OPERATIONS
// =============================================================================

/**
 * Data Transform operations use consistent sourcePath → targetPath pattern.
 */
export type TransformOperation =
  | SelectOperation
  | RenameOperation
  | CoerceOperation
  | TextOperation
  | SetValueOperation;

export interface SelectOperation {
  type: "select";
  sourcePath: string; // e.g., "trigger.body.user.email"
  targetPath: string; // e.g., "customerEmail"
}

export interface RenameOperation {
  type: "rename";
  sourcePath: string; // Existing field path
  targetPath: string; // New field path
}

export interface CoerceOperation {
  type: "coerce";
  sourcePath: string; // Field to coerce
  targetPath: string; // Output field (can be same as source for in-place)
  toType: "string" | "number" | "boolean" | "date";
}

export interface TextOperation {
  type: "text";
  sourcePath: string;
  targetPath: string;
  operation: "trim" | "uppercase" | "lowercase";
}

export interface SetValueOperation {
  type: "set";
  targetPath: string;
  value: string | number | boolean; // Can use {{system.now}} etc.
}

export interface DataTransformConfig {
  version: "1.0";
  operations: TransformOperation[];
}

// =============================================================================
// HTTP REQUEST
// =============================================================================

/**
 * HTTP Request authentication.
 *
 * IMPORTANT: Auth tokens should use secret references, not raw values.
 * @example
 * - bearerToken: "{{secret.stripeApiKey}}"
 * - apiKeyValue: "{{secret.openaiKey}}"
 *
 * Secrets are:
 * - Resolved at runtime only
 * - Never visible in exports
 * - Never logged in execution records
 * - Stored encrypted at rest
 */
export interface HTTPRequestConfig {
  version: "1.0";
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  url: string; // Supports {{variable}} templates
  headers: Record<string, string>;
  queryParams: Record<string, string>;
  body?: {
    type: "json" | "form";
    content: string; // JSON string or form-encoded
  };
  auth?: {
    type: "none" | "api_key" | "bearer";
    apiKeyName?: string; // Header name for API key
    apiKeyValue?: string; // Use {{secret.xxx}} - never raw values
    bearerToken?: string; // Use {{secret.xxx}} - never raw values
  };
  timeout: number; // Seconds (1-60)
  followRedirects: boolean;
}

// =============================================================================
// SCHEDULE TRIGGER
// =============================================================================

/**
 * Schedule Trigger configuration.
 *
 * MISSED SCHEDULE BEHAVIOR:
 * - Missed schedules are NOT backfilled
 * - If the app is down during a scheduled time, that run is skipped
 * - Paused workflows do not accumulate runs; they resume on next schedule
 * - Timezone changes are handled by recalculating the next run time
 * - The workflow runs on the next scheduled occurrence only
 */
export interface ScheduleTriggerConfig {
  version: "1.0";
  schedule: {
    frequency: "hourly" | "daily" | "weekly" | "monthly";
    time?: string; // HH:mm for daily+
    dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
    dayOfMonth?: number; // 1-31 for monthly
    timezone: string; // IANA timezone (e.g., "Asia/Kolkata")
  };
}

// =============================================================================
// KEY-VALUE STORAGE
// =============================================================================

/**
 * Key-Value Storage configuration.
 *
 * CONSISTENCY MODEL:
 * - Operations are atomic within a single key
 * - No cross-key transactions
 * - Eventually consistent across regions (if multi-region)
 * - Strong consistency within a single region
 * - For critical deduplication, use with caution in distributed scenarios
 *
 * LIMITS:
 * - Max key length: 256 characters
 * - Max value size: 4KB
 * - Max keys per workflow: 1,000
 * - Max TTL: 30 days
 *
 * NOT FOR:
 * - Storing secrets (use Secrets Manager)
 * - Large data (use external storage)
 * - High-frequency updates (rate limited)
 */
export interface KVStorageConfig {
  version: "1.0";
  operation: "set" | "get" | "delete" | "increment" | "exists";
  key: string; // Static or {{template}}
  value?: string | number; // For set/increment
  ttl?: number; // Seconds, optional expiry
  namespace?: string; // Default: workflowId
}

// =============================================================================
// CONDITION
// =============================================================================

export interface ConditionConfig {
  version: "1.0";
  rootLogic: "AND" | "OR";
  conditions: AtomicCondition[];
  // Future: support nested ConditionGroup for complex logic
}

export interface AtomicCondition {
  id: string;
  leftOperand: string; // Value or {{template}}
  operator: ConditionOperator;
  rightOperand: string; // Value or {{template}} (ignored for unary ops)
}

export type ConditionOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "exists"
  | "is_empty";

// =============================================================================
// DELAY / WAIT
// =============================================================================

/**
 * Delay configuration.
 *
 * MAX DELAY: 7 days
 * If value resolves to null/invalid: delay is skipped with warning
 * If value is negative: treated as 0
 */
export interface DelayConfig {
  version: "1.0";
  mode: "static" | "dynamic";
  value?: number;
  unit?: "seconds" | "minutes" | "hours" | "days";
  valueRef?: {
    nodeId: string;
    fieldPath: string;
  };
}

/**
 * Wait/Schedule configuration for waiting until a specific time.
 *
 * MAX WAIT: 365 days
 * If target time is in the past: executes immediately with warning
 */
export interface WaitConfig {
  version: "1.0";
  mode: "absolute" | "daily" | "weekly" | "monthly";
  timezone: string;
  absoluteDateTime?: string; // ISO 8601
  time?: string; // HH:mm
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
}

// =============================================================================
// WEBHOOK TRIGGER (v2.0 - Consolidated)
// =============================================================================

/**
 * Webhook Trigger configuration v2.0
 *
 * This is the ONLY webhook trigger node. Custom Webhook was deprecated and
 * merged into this unified node with mode selection.
 *
 * MODES:
 * - "custom": User manages their own webhook URL (default)
 * - "managed": App-managed webhooks with preconfigured providers (future)
 *
 * MIGRATION (backwards compatibility):
 * - Existing "Custom Webhook" nodes are auto-converted to mode: "custom"
 * - Existing "Webhook" nodes without a mode default to mode: "custom"
 * - Output shape is identical regardless of mode
 * - No workflow logic or execution changes
 *
 * EXPORT SAFETY:
 * - webhookId: INCLUDED in exports
 * - mode: INCLUDED in exports
 * - provider/event: INCLUDED in exports (if managed)
 * - secret: NEVER EXPORTED - stored encrypted, resolved at runtime only
 *
 * OUTPUT (identical for all modes):
 * {
 *   method: "POST" | "GET",
 *   headers: Record<string, string>,
 *   query: Record<string, string>,
 *   body: object,
 *   receivedAt: string  // ISO timestamp
 * }
 */
export interface WebhookTriggerConfig {
  version: "2.0";
  type: "webhook";
  mode: "custom" | "managed";

  // Common
  webhookId: string; // Auto-generated, included in exports

  // Custom mode
  secret?: string; // NEVER EXPORTED - stored encrypted
  allowedMethods: ("POST" | "GET")[];
  requireSecret?: boolean;

  // Managed mode (future)
  provider?: string; // e.g., "stripe", "github", "shopify"
  event?: string; // e.g., "charge.succeeded", "push"

  // For field mapping in editor
  samplePayload?: object;
}

/**
 * Migration helper: Convert legacy node configs to v2.0
 *
 * @example
 * // Legacy Custom Webhook node
 * { type: "Custom Webhook", metadata: { webhookUrl: "..." } }
 *
 * // Becomes
 * { type: "Webhook", metadata: { version: "2.0", mode: "custom", ... } }
 */
export function migrateWebhookConfig(
  legacyConfig: Record<string, unknown>
): WebhookTriggerConfig {
  return {
    version: "2.0",
    type: "webhook",
    mode: "custom",
    webhookId: (legacyConfig.webhookId as string) || `wh_${Date.now()}`,
    allowedMethods: (legacyConfig.allowedMethods as ("POST" | "GET")[]) || [
      "POST",
    ],
    secret: legacyConfig.secret as string | undefined,
    requireSecret: Boolean(legacyConfig.requireSecret),
    samplePayload: legacyConfig.samplePayload as object | undefined,
  };
}
