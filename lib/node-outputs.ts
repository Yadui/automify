export const NODE_OUTPUTS: Record<
  string,
  { label: string; value: string; type: string }[]
> = {
  AI: [
    { label: "Output", value: "output", type: "any" },
    { label: "Raw text", value: "raw", type: "string" },
    { label: "Operation", value: "operation", type: "string" },
  ],
  "HTTP Request": [
    { label: "Status Code", value: "statusCode", type: "number" },
    { label: "Response Body", value: "body", type: "object" },
    { label: "Response Data (Deprecated)", value: "data", type: "object" },
    { label: "Response Headers", value: "headers", type: "object" },
    { label: "Success", value: "success", type: "boolean" },
    { label: "Duration", value: "duration", type: "string" },
  ],
  Webhook: [
    { label: "Body", value: "body", type: "object" },
    { label: "Headers", value: "headers", type: "object" },
    { label: "Query", value: "query", type: "object" },
  ],
  "Key-Value Storage": [{ label: "Value", value: "value", type: "string" }],
  Condition: [{ label: "Result", value: "result", type: "boolean" }],
  "Data Transform": [{ label: "Result", value: "result", type: "any" }],
  "Google Drive": [
    { label: "File ID", value: "id", type: "string" },
    { label: "File Name", value: "name", type: "string" },
    { label: "MIME Type", value: "mimeType", type: "string" },
    { label: "Download Link", value: "webContentLink", type: "string" },
  ],
  Slack: [
    { label: "Message ID", value: "ts", type: "string" },
    { label: "Channel ID", value: "channel", type: "string" },
    { label: "User", value: "user", type: "string" },
    { label: "Text", value: "text", type: "string" },
  ],
  Discord: [
    { label: "Message ID", value: "id", type: "string" },
    { label: "Channel ID", value: "channel_id", type: "string" },
    { label: "Content", value: "content", type: "string" },
    { label: "Author", value: "author", type: "object" },
  ],
  Notion: [
    { label: "Page ID", value: "id", type: "string" },
    { label: "URL", value: "url", type: "string" },
  ],
  Gmail: [
    { label: "Message ID", value: "messageId", type: "string" },
    { label: "Thread ID", value: "threadId", type: "string" },
    { label: "Sent At", value: "sentAt", type: "string" },
    { label: "To", value: "to", type: "string" },
    { label: "Subject", value: "subject", type: "string" },
  ],
  // Trigger outputs (issue opened / PR opened) + action outputs (created issue)
  GitHub: [
    { label: "Issue / PR Number", value: "number", type: "number" },
    { label: "Title", value: "title", type: "string" },
    { label: "Body", value: "body", type: "string" },
    { label: "URL", value: "url", type: "string" },
    { label: "Author", value: "author", type: "string" },
    { label: "State", value: "state", type: "string" },
    { label: "Repository", value: "repo", type: "string" },
    { label: "Labels", value: "labels", type: "string[]" },
  ],
  "Google Calendar": [
    { label: "Event ID", value: "id", type: "string" },
    { label: "Event Link", value: "htmlLink", type: "string" },
    { label: "Title", value: "summary", type: "string" },
    { label: "Start", value: "start", type: "string" },
    { label: "End", value: "end", type: "string" },
    { label: "Status", value: "status", type: "string" },
  ],
};
