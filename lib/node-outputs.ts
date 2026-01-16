export const NODE_OUTPUTS: Record<
  string,
  { label: string; value: string; type: string }[]
> = {
  "HTTP Request": [
    { label: "Response Data", value: "data", type: "object" },
    { label: "Phone Status", value: "status", type: "number" },
    { label: "Response Headers", value: "headers", type: "object" },
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
};
