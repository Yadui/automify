import { z } from "zod";

export type ConnectorType =
  | "Google Drive"
  | "Discord"
  | "Notion"
  | "Slack"
  | "Gmail"
  | "Google Calendar"
  | "Trello"
  | "GitHub";

export type ConnectorOperationKind = "trigger" | "action";
export type ConnectorFieldKind =
  | "text"
  | "textarea"
  | "password"
  | "select"
  | "multi-select"
  | "boolean"
  | "json";

export type ConnectorSettingsField = {
  key: string;
  label: string;
  kind: ConnectorFieldKind;
  required?: boolean;
  secret?: boolean;
  description?: string;
  placeholder?: string;
  optionsSource?: string;
  defaultValue?: string | boolean | string[] | Record<string, unknown>;
};

export type ConnectorOperation = {
  id: string;
  label: string;
  description: string;
  fields?: ConnectorSettingsField[];
};

export type ConnectorRelationPair =
  | { sourceConnectorType: "Google Drive"; targetConnectorType: "Notion" | "Slack" | "Discord" | "Gmail" }
  | { sourceConnectorType: "Gmail"; targetConnectorType: "Notion" | "Google Drive" }
  | { sourceConnectorType: "Google Calendar"; targetConnectorType: "Slack" | "Discord" }
  | { sourceConnectorType: "GitHub"; targetConnectorType: "Trello" }
  | { sourceConnectorType: "Trello"; targetConnectorType: "Slack" | "Discord" }
  | { sourceConnectorType: "Notion"; targetConnectorType: "GitHub" };

export type ConnectorRelationTemplate = ConnectorRelationPair & {
  settingsKey: string;
  label: string;
  description?: string;
  required?: boolean;
};

export type ConnectorDefinition = {
  type: ConnectorType;
  slug: string;
  title: ConnectorType;
  description: string;
  image: string;
  connectionKey?: "googleNode" | "discordNode" | "notionNode" | "slackNode";
  accessTokenKey?: string;
  sharedCredentialType?: ConnectorType;
  requiredCredentialScopes?: string[];
  alwaysTrue?: boolean;
  slackSpecial?: boolean;
  statusType?: "Trigger" | "Action";
  oauth?: {
    authorizationUrl: string;
    clientIdEnv: string;
    redirectUriEnv: string;
    scopes: string[];
    responseType?: string;
    extraParams?: Record<string, string>;
  };
  settings: {
    connection: ConnectorSettingsField[];
    trigger?: ConnectorSettingsField[];
    action?: ConnectorSettingsField[];
  };
  capabilities: {
    triggers: ConnectorOperation[];
    actions: ConnectorOperation[];
  };
  relations: {
    canSource: ConnectorType[];
    canTarget: ConnectorType[];
    defaultSourceMappings: ConnectorRelationTemplate[];
  };
};

export type ConnectorSettingsValidation = {
  valid: boolean;
  missingRequired: string[];
  unknownFields: string[];
  schema: ConnectorSettingsField[];
};

const contentField: ConnectorSettingsField = {
  key: "content",
  label: "Message content",
  kind: "textarea",
  required: true,
  description: "Template text or static content this node sends or creates.",
};

export const CONNECTOR_REGISTRY: Record<ConnectorType, ConnectorDefinition> = {
  "Google Drive": {
    type: "Google Drive",
    slug: "google-drive",
    title: "Google Drive",
    description: "Connect your google drive to listen to folder changes",
    image: "/googleDrive.png",
    connectionKey: "googleNode",
    alwaysTrue: true,
    requiredCredentialScopes: ["https://www.googleapis.com/auth/drive.readonly"],
    statusType: "Trigger",
    oauth: {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientIdEnv: "GOOGLE_CLIENT_ID",
      redirectUriEnv: "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      responseType: "code",
      extraParams: { access_type: "offline", prompt: "consent" },
    },
    settings: {
      connection: [
        { key: "accessToken", label: "Access token", kind: "password", required: true, secret: true },
        { key: "refreshToken", label: "Refresh token", kind: "password", secret: true },
      ],
      trigger: [
        {
          key: "folderId",
          label: "Folder",
          kind: "select",
          required: true,
          optionsSource: "googleDrive.folders",
          description: "Drive folder to watch for file changes or archive incoming data into.",
        },
      ],
      action: [
        {
          key: "folderId",
          label: "Archive folder",
          kind: "select",
          required: true,
          optionsSource: "googleDrive.folders",
          description: "Drive folder used when another app archives files or messages.",
        },
        {
          key: "archiveNameTemplate",
          label: "Archive name template",
          kind: "text",
          placeholder: "{{from}} - {{subject}}",
          description: "Optional file name template for archived Gmail messages or attachments.",
        },
      ],
    },
    capabilities: {
      triggers: [
        {
          id: "googleDrive.file_changed",
          label: "File changed in folder",
          description: "Starts a workflow when a file changes in a selected Drive folder.",
          fields: [
            {
              key: "folderId",
              label: "Folder",
              kind: "select",
              required: true,
              optionsSource: "googleDrive.folders",
            },
          ],
        },
      ],
      actions: [
        {
          id: "googleDrive.archive_file",
          label: "Archive file in Drive",
          description: "TODO: Create a Drive file/archive from related app payloads when Drive write credentials are available.",
          fields: [
            { key: "folderId", label: "Archive folder", kind: "select", required: true, optionsSource: "googleDrive.folders" },
            { key: "archiveNameTemplate", label: "Archive name template", kind: "text" },
          ],
        },
      ],
    },
    relations: {
      canSource: ["Gmail"],
      canTarget: ["Notion", "Slack", "Discord", "Gmail"],
      defaultSourceMappings: [
        {
          sourceConnectorType: "Google Drive",
          targetConnectorType: "Notion",
          settingsKey: "databaseId",
          label: "Target Notion database",
          required: true,
        },
        {
          sourceConnectorType: "Google Drive",
          targetConnectorType: "Slack",
          settingsKey: "slackChannel",
          label: "Target Slack channel",
          required: true,
        },
        {
          sourceConnectorType: "Google Drive",
          targetConnectorType: "Discord",
          settingsKey: "channelId",
          label: "Target Discord channel",
          required: true,
        },
        {
          sourceConnectorType: "Gmail",
          targetConnectorType: "Google Drive",
          settingsKey: "folderId",
          label: "Archive Gmail attachments in Drive",
          description: "Store incoming Gmail message attachments or raw message exports in the selected Drive folder.",
          required: true,
        },
      ],
    },
  },
  Discord: {
    type: "Discord",
    slug: "discord",
    title: "Discord",
    description: "Connect your discord to send notification and messages",
    image: "/discord.png",
    connectionKey: "discordNode",
    accessTokenKey: "webhookURL",
    statusType: "Action",
    oauth: {
      authorizationUrl: "https://discord.com/api/oauth2/authorize",
      clientIdEnv: "NEXT_PUBLIC_DISCORD_CLIENT_ID",
      redirectUriEnv: "DISCORD_REDIRECT_URI",
      scopes: ["identify", "guilds", "webhook.incoming"],
      responseType: "code",
    },
    settings: {
      connection: [
        { key: "webhookURL", label: "Webhook URL", kind: "password", required: true, secret: true },
        { key: "webhookName", label: "Webhook name", kind: "text", required: true },
        { key: "guildName", label: "Server", kind: "text", required: true },
        { key: "channelId", label: "Channel ID", kind: "text", required: true },
      ],
      action: [contentField],
    },
    capabilities: {
      triggers: [],
      actions: [
        {
          id: "discord.send_message",
          label: "Send Discord message",
          description: "Posts a message through the connected Discord webhook.",
          fields: [contentField],
        },
      ],
    },
    relations: {
      canSource: [],
      canTarget: ["Google Drive", "Gmail", "Google Calendar", "Trello"],
      defaultSourceMappings: [],
    },
  },
  Notion: {
    type: "Notion",
    slug: "notion",
    title: "Notion",
    description: "Create entries in your notion dashboard and automate tasks.",
    image: "/notion.png",
    connectionKey: "notionNode",
    accessTokenKey: "accessToken",
    statusType: "Action",
    oauth: {
      authorizationUrl: "https://api.notion.com/v1/oauth/authorize",
      clientIdEnv: "NOTION_CLIENT_ID",
      redirectUriEnv: "NOTION_REDIRECT_URI",
      scopes: [],
      responseType: "code",
      extraParams: { owner: "user" },
    },
    settings: {
      connection: [
        { key: "accessToken", label: "Access token", kind: "password", required: true, secret: true },
        { key: "workspaceName", label: "Workspace", kind: "text", required: true },
        { key: "databaseId", label: "Default database", kind: "select", optionsSource: "notion.databases" },
      ],
      action: [
        {
          key: "databaseId",
          label: "Database",
          kind: "select",
          required: true,
          optionsSource: "notion.databases",
        },
        contentField,
      ],
    },
    capabilities: {
      triggers: [],
      actions: [
        {
          id: "notion.create_page",
          label: "Create Notion page",
          description: "Creates a page in the selected Notion database.",
          fields: [
            {
              key: "databaseId",
              label: "Database",
              kind: "select",
              required: true,
              optionsSource: "notion.databases",
            },
            contentField,
          ],
        },
      ],
    },
    relations: {
      canSource: [],
      canTarget: ["Google Drive", "Gmail", "Google Calendar", "Trello"],
      defaultSourceMappings: [],
    },
  },
  Slack: {
    type: "Slack",
    slug: "slack",
    title: "Slack",
    description: "Use slack to send notifications to team members through your own custom bot.",
    image: "/slack.png",
    connectionKey: "slackNode",
    accessTokenKey: "slackAccessToken",
    slackSpecial: true,
    statusType: "Action",
    oauth: {
      authorizationUrl: "https://slack.com/oauth/v2/authorize",
      clientIdEnv: "NEXT_PUBLIC_SLACK_CLIENT_ID",
      redirectUriEnv: "SLACK_REDIRECT_URI",
      scopes: ["chat:write", "channels:read", "groups:read"],
    },
    settings: {
      connection: [
        { key: "slackAccessToken", label: "Bot access token", kind: "password", required: true, secret: true },
        { key: "teamName", label: "Workspace", kind: "text", required: true },
        { key: "botUserId", label: "Bot user ID", kind: "text", required: true },
      ],
      action: [
        {
          key: "slackChannel",
          label: "Channel",
          kind: "multi-select",
          required: true,
          optionsSource: "slack.channels",
        },
        contentField,
      ],
    },
    capabilities: {
      triggers: [],
      actions: [
        {
          id: "slack.send_message",
          label: "Send Slack message",
          description: "Posts a message to one or more selected Slack channels.",
          fields: [
            {
              key: "slackChannel",
              label: "Channel",
              kind: "multi-select",
              required: true,
              optionsSource: "slack.channels",
            },
            contentField,
          ],
        },
      ],
    },
    relations: {
      canSource: [],
      canTarget: ["Google Drive", "Gmail", "Google Calendar", "Trello"],
      defaultSourceMappings: [],
    },
  },
  Gmail: {
    type: "Gmail",
    slug: "gmail",
    title: "Gmail",
    description: "Send email and react to Gmail messages using your Google Workspace credential.",
    image: "/gmail.png",
    connectionKey: "googleNode",
    accessTokenKey: "accessToken",
    sharedCredentialType: "Google Drive",
    requiredCredentialScopes: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/gmail.send",
    ],
    statusType: "Action",
    oauth: {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientIdEnv: "GOOGLE_CLIENT_ID",
      redirectUriEnv: "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
      ],
      responseType: "code",
      extraParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
    },
    settings: {
      connection: [
        { key: "accessToken", label: "Access token", kind: "password", required: true, secret: true },
        { key: "refreshToken", label: "Refresh token", kind: "password", secret: true },
        { key: "scope", label: "Granted scopes", kind: "text", description: "Scopes returned by Google OAuth for this credential." },
      ],
      trigger: [
        { key: "labelId", label: "Label", kind: "select", optionsSource: "gmail.labels" },
        {
          key: "query",
          label: "Search query",
          kind: "text",
          placeholder: "has:attachment newer_than:1d",
          description: "Optional Gmail search query used to filter incoming messages.",
        },
        { key: "from", label: "From", kind: "text", placeholder: "sender@example.com" },
        { key: "to", label: "To", kind: "text", placeholder: "team@example.com" },
      ],
      action: [
        { key: "to", label: "To", kind: "text", required: true, placeholder: "recipient@example.com" },
        { key: "from", label: "From", kind: "text", placeholder: "me or alias@example.com" },
        { key: "subject", label: "Subject", kind: "text", required: true },
        {
          key: "template",
          label: "Email template",
          kind: "textarea",
          required: true,
          description: "Body template. Drive file/link variables can be inserted by workflow relations.",
        },
        {
          key: "attachmentFileId",
          label: "Drive attachment file",
          kind: "select",
          optionsSource: "googleDrive.files",
          description: "Optional Drive file to attach to the outgoing email.",
        },
        {
          key: "includeDriveLink",
          label: "Include Drive link",
          kind: "boolean",
          defaultValue: true,
          description: "Include the source Drive file link in the email body.",
        },
      ],
    },
    capabilities: {
      triggers: [
        {
          id: "gmail.email_received",
          label: "Email received",
          description: "Starts a workflow when an email arrives in Gmail.",
          fields: [
            { key: "labelId", label: "Label", kind: "select", optionsSource: "gmail.labels" },
            { key: "query", label: "Search query", kind: "text" },
            { key: "from", label: "From", kind: "text" },
            { key: "to", label: "To", kind: "text" },
          ],
        },
      ],
      actions: [
        {
          id: "gmail.send_email",
          label: "Send email",
          description: "Sends an email from Gmail using recipient, subject, and template settings.",
          fields: [
            { key: "to", label: "To", kind: "text", required: true },
            { key: "from", label: "From", kind: "text" },
            { key: "subject", label: "Subject", kind: "text", required: true },
            { key: "template", label: "Email template", kind: "textarea", required: true },
            { key: "attachmentFileId", label: "Drive attachment file", kind: "select", optionsSource: "googleDrive.files" },
            { key: "includeDriveLink", label: "Include Drive link", kind: "boolean", defaultValue: true },
          ],
        },
      ],
    },
    relations: {
      canSource: ["Google Drive", "Gmail"],
      canTarget: ["Google Drive", "Notion"],
      defaultSourceMappings: [
        {
          sourceConnectorType: "Google Drive",
          targetConnectorType: "Gmail",
          settingsKey: "attachmentFileId",
          label: "Attach Drive file",
          description: "Use the source Google Drive file as the outgoing Gmail attachment.",
        },
        {
          sourceConnectorType: "Google Drive",
          targetConnectorType: "Gmail",
          settingsKey: "includeDriveLink",
          label: "Include Drive file link",
          description: "Add a link to the source Drive file in the outgoing email body.",
        },
        {
          sourceConnectorType: "Gmail",
          targetConnectorType: "Notion",
          settingsKey: "databaseId",
          label: "Archive Gmail message to Notion",
          description: "Create or update a Notion database item from the Gmail message subject, sender, and body.",
          required: true,
        },
        {
          sourceConnectorType: "Gmail",
          targetConnectorType: "Google Drive",
          settingsKey: "folderId",
          label: "Archive Gmail message to Drive",
          description: "Store Gmail message content or attachments in a selected Drive folder.",
          required: true,
        },
      ],
    },
  },
  "Google Calendar": {
    type: "Google Calendar",
    slug: "google-calendar",
    title: "Google Calendar",
    description: "Create, update, read, and notify teams about Google Calendar events.",
    image: "/googleCalendar.png",
    connectionKey: "googleNode",
    accessTokenKey: "accessToken",
    sharedCredentialType: "Google Drive",
    requiredCredentialScopes: [
      "https://www.googleapis.com/auth/calendar.readonly",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    statusType: "Action",
    oauth: {
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      clientIdEnv: "GOOGLE_CLIENT_ID",
      redirectUriEnv: "NEXT_PUBLIC_GOOGLE_REDIRECT_URI",
      scopes: [
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
      responseType: "code",
      extraParams: { access_type: "offline", prompt: "consent", include_granted_scopes: "true" },
    },
    settings: {
      connection: [
        { key: "accessToken", label: "Access token", kind: "password", required: true, secret: true },
        { key: "refreshToken", label: "Refresh token", kind: "password", secret: true },
        { key: "scope", label: "Granted scopes", kind: "text", description: "Scopes returned by Google OAuth for this credential." },
      ],
      trigger: [
        { key: "calendarId", label: "Calendar", kind: "select", required: true, optionsSource: "googleCalendar.calendars" },
        { key: "eventQuery", label: "Event search", kind: "text", placeholder: "standup" },
        { key: "timeWindow", label: "Time window", kind: "text", placeholder: "next_24h" },
      ],
      action: [
        { key: "calendarId", label: "Calendar", kind: "select", required: true, optionsSource: "googleCalendar.calendars" },
        {
          key: "eventMode",
          label: "Event operation",
          kind: "select",
          required: true,
          defaultValue: "create",
          optionsSource: "googleCalendar.eventModes",
          description: "Create, update, or read an event.",
        },
        { key: "eventId", label: "Event ID", kind: "text", description: "Required for update/read operations." },
        { key: "summary", label: "Title", kind: "text", required: true },
        { key: "description", label: "Description", kind: "textarea" },
        { key: "startTime", label: "Start time", kind: "text", required: true, placeholder: "2026-05-06T10:00:00-07:00" },
        { key: "endTime", label: "End time", kind: "text", required: true, placeholder: "2026-05-06T10:30:00-07:00" },
        { key: "attendees", label: "Attendees", kind: "textarea", placeholder: "alice@example.com, bob@example.com" },
        { key: "defaultReminders", label: "Default reminders", kind: "boolean", defaultValue: true },
      ],
    },
    capabilities: {
      triggers: [
        {
          id: "googleCalendar.event_started",
          label: "Calendar event starts",
          description: "Starts a workflow before an event starts or when matching events are read.",
          fields: [
            { key: "calendarId", label: "Calendar", kind: "select", required: true, optionsSource: "googleCalendar.calendars" },
            { key: "eventQuery", label: "Event search", kind: "text" },
            { key: "timeWindow", label: "Time window", kind: "text" },
          ],
        },
      ],
      actions: [
        {
          id: "googleCalendar.create_event",
          label: "Create/update/read calendar event",
          description: "Creates, updates, or reads a Google Calendar event with attendees and reminders.",
          fields: [
            { key: "calendarId", label: "Calendar", kind: "select", required: true, optionsSource: "googleCalendar.calendars" },
            { key: "eventMode", label: "Event operation", kind: "select", required: true, optionsSource: "googleCalendar.eventModes" },
            { key: "eventId", label: "Event ID", kind: "text" },
            { key: "summary", label: "Title", kind: "text", required: true },
            { key: "description", label: "Description", kind: "textarea" },
            { key: "startTime", label: "Start time", kind: "text", required: true },
            { key: "endTime", label: "End time", kind: "text", required: true },
            { key: "attendees", label: "Attendees", kind: "textarea" },
            { key: "defaultReminders", label: "Default reminders", kind: "boolean", defaultValue: true },
          ],
        },
      ],
    },
    relations: {
      canSource: [],
      canTarget: ["Slack", "Discord"],
      defaultSourceMappings: [
        {
          sourceConnectorType: "Google Calendar",
          targetConnectorType: "Slack",
          settingsKey: "content",
          label: "Slack event notification",
          description: "Format the calendar event details as a Slack notification message.",
        },
        {
          sourceConnectorType: "Google Calendar",
          targetConnectorType: "Discord",
          settingsKey: "content",
          label: "Discord event notification",
          description: "Format the calendar event details as a Discord notification message.",
        },
      ],
    },
  },
  Trello: {
    type: "Trello",
    slug: "trello",
    title: "Trello",
    description: "Create, update, and react to Trello cards across selected boards and lists.",
    image: "/trello.png",
    accessTokenKey: "token",
    statusType: "Action",
    settings: {
      connection: [
        { key: "apiKey", label: "API key", kind: "password", required: true, secret: true },
        { key: "token", label: "Token", kind: "password", required: true, secret: true },
        { key: "workspaceId", label: "Workspace", kind: "select", optionsSource: "trello.workspaces" },
      ],
      trigger: [
        { key: "boardId", label: "Board", kind: "select", required: true, optionsSource: "trello.boards" },
        { key: "listId", label: "List", kind: "select", required: true, optionsSource: "trello.lists" },
        { key: "cardId", label: "Card", kind: "select", optionsSource: "trello.cards" },
      ],
      action: [
        { key: "boardId", label: "Board", kind: "select", required: true, optionsSource: "trello.boards" },
        { key: "listId", label: "List", kind: "select", required: true, optionsSource: "trello.lists" },
        { key: "cardName", label: "Card name", kind: "text", required: true, placeholder: "{{issue.title}}" },
        { key: "cardDescription", label: "Card description", kind: "textarea", placeholder: "{{issue.body}}" },
        { key: "cardId", label: "Existing card", kind: "select", optionsSource: "trello.cards", description: "Optional card to update instead of creating a new card." },
        { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "trello.labels" },
        { key: "dueDate", label: "Due date", kind: "text", placeholder: "2026-05-06" },
      ],
    },
    capabilities: {
      triggers: [
        {
          id: "trello.card_moved",
          label: "Card moved",
          description: "Starts a workflow when a Trello card moves lists.",
          fields: [
            { key: "boardId", label: "Board", kind: "select", required: true, optionsSource: "trello.boards" },
            { key: "listId", label: "List", kind: "select", required: true, optionsSource: "trello.lists" },
            { key: "cardId", label: "Card", kind: "select", optionsSource: "trello.cards" },
          ],
        },
        {
          id: "trello.card_updated",
          label: "Card updated",
          description: "Starts a workflow when a selected Trello card changes.",
          fields: [
            { key: "boardId", label: "Board", kind: "select", required: true, optionsSource: "trello.boards" },
            { key: "cardId", label: "Card", kind: "select", optionsSource: "trello.cards" },
          ],
        },
      ],
      actions: [
        {
          id: "trello.create_card",
          label: "Create Trello card",
          description: "Creates a card in a selected Trello list. TODO: call Trello REST API after credentials are wired.",
          fields: [
            { key: "boardId", label: "Board", kind: "select", required: true, optionsSource: "trello.boards" },
            { key: "listId", label: "List", kind: "select", required: true, optionsSource: "trello.lists" },
            { key: "cardName", label: "Card name", kind: "text", required: true },
            { key: "cardDescription", label: "Card description", kind: "textarea" },
            { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "trello.labels" },
            { key: "dueDate", label: "Due date", kind: "text" },
          ],
        },
        {
          id: "trello.update_card",
          label: "Update Trello card",
          description: "Updates an existing Trello card. TODO: call Trello REST API after credentials are wired.",
          fields: [
            { key: "cardId", label: "Existing card", kind: "select", required: true, optionsSource: "trello.cards" },
            { key: "cardName", label: "Card name", kind: "text" },
            { key: "cardDescription", label: "Card description", kind: "textarea" },
          ],
        },
      ],
    },
    relations: {
      canSource: ["GitHub"],
      canTarget: ["Slack", "Discord"],
      defaultSourceMappings: [
        {
          sourceConnectorType: "GitHub",
          targetConnectorType: "Trello",
          settingsKey: "cardName",
          label: "GitHub issue title to card name",
          description: "Use the GitHub issue title as the Trello card name.",
          required: true,
        },
        {
          sourceConnectorType: "GitHub",
          targetConnectorType: "Trello",
          settingsKey: "cardDescription",
          label: "GitHub issue body to card description",
          description: "Copy the GitHub issue or PR details into the Trello card body.",
        },
        {
          sourceConnectorType: "Trello",
          targetConnectorType: "Slack",
          settingsKey: "content",
          label: "Slack card notification",
          description: "Format Trello card updates as Slack messages.",
        },
        {
          sourceConnectorType: "Trello",
          targetConnectorType: "Discord",
          settingsKey: "content",
          label: "Discord card notification",
          description: "Format Trello card updates as Discord messages.",
        },
      ],
    },
  },
  GitHub: {
    type: "GitHub",
    slug: "github",
    title: "GitHub",
    description: "React to repository issues and pull requests, or create GitHub issues from workflow data.",
    image: "/github.png",
    accessTokenKey: "accessToken",
    statusType: "Trigger",
    settings: {
      connection: [
        { key: "accessToken", label: "Personal access token", kind: "password", required: true, secret: true },
        { key: "installationId", label: "GitHub App installation", kind: "text", description: "Optional GitHub App installation ID." },
      ],
      trigger: [
        { key: "repository", label: "Repository", kind: "select", required: true, optionsSource: "github.repositories", placeholder: "owner/repo" },
        { key: "issueState", label: "Issue state", kind: "select", optionsSource: "github.issueStates", defaultValue: "open" },
        { key: "prState", label: "Pull request state", kind: "select", optionsSource: "github.prStates", defaultValue: "open" },
        { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "github.labels" },
      ],
      action: [
        { key: "repository", label: "Repository", kind: "select", required: true, optionsSource: "github.repositories", placeholder: "owner/repo" },
        { key: "issueTitle", label: "Issue title", kind: "text", required: true, placeholder: "{{notion.title}}" },
        { key: "issueBody", label: "Issue body", kind: "textarea", placeholder: "{{notion.content}}" },
        { key: "assignees", label: "Assignees", kind: "multi-select", optionsSource: "github.assignees" },
        { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "github.labels" },
        { key: "linkedNotionPageId", label: "Linked Notion page", kind: "select", optionsSource: "notion.pages" },
      ],
    },
    capabilities: {
      triggers: [
        {
          id: "github.issue_opened",
          label: "Issue opened",
          description: "Starts a workflow when a GitHub issue is opened or matched.",
          fields: [
            { key: "repository", label: "Repository", kind: "select", required: true, optionsSource: "github.repositories" },
            { key: "issueState", label: "Issue state", kind: "select", optionsSource: "github.issueStates" },
            { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "github.labels" },
          ],
        },
        {
          id: "github.pull_request_opened",
          label: "Pull request opened",
          description: "Starts a workflow when a GitHub pull request is opened or matched.",
          fields: [
            { key: "repository", label: "Repository", kind: "select", required: true, optionsSource: "github.repositories" },
            { key: "prState", label: "Pull request state", kind: "select", optionsSource: "github.prStates" },
            { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "github.labels" },
          ],
        },
      ],
      actions: [
        {
          id: "github.create_issue",
          label: "Create issue",
          description: "Creates a GitHub issue. TODO: call GitHub REST/GraphQL API after credentials are wired.",
          fields: [
            { key: "repository", label: "Repository", kind: "select", required: true, optionsSource: "github.repositories" },
            { key: "issueTitle", label: "Issue title", kind: "text", required: true },
            { key: "issueBody", label: "Issue body", kind: "textarea" },
            { key: "assignees", label: "Assignees", kind: "multi-select", optionsSource: "github.assignees" },
            { key: "labels", label: "Labels", kind: "multi-select", optionsSource: "github.labels" },
            { key: "linkedNotionPageId", label: "Linked Notion page", kind: "select", optionsSource: "notion.pages" },
          ],
        },
      ],
    },
    relations: {
      canSource: ["Notion"],
      canTarget: ["Trello"],
      defaultSourceMappings: [
        {
          sourceConnectorType: "GitHub",
          targetConnectorType: "Trello",
          settingsKey: "cardName",
          label: "GitHub issue title to Trello card",
          description: "Use a GitHub issue or PR title as the Trello card name.",
          required: true,
        },
        {
          sourceConnectorType: "GitHub",
          targetConnectorType: "Trello",
          settingsKey: "cardDescription",
          label: "GitHub issue details to Trello card",
          description: "Use GitHub issue/PR metadata and body as the Trello card description.",
        },
        {
          sourceConnectorType: "Notion",
          targetConnectorType: "GitHub",
          settingsKey: "linkedNotionPageId",
          label: "Link Notion item",
          description: "Preserve the source Notion database item ID on the created GitHub issue.",
        },
        {
          sourceConnectorType: "Notion",
          targetConnectorType: "GitHub",
          settingsKey: "issueTitle",
          label: "Notion title to GitHub issue",
          description: "Use the Notion database item title as the GitHub issue title.",
          required: true,
        },
      ],
    },
  },
};

export const ACTIVE_CONNECTION_TYPES = [
  "Google Drive",
  "Discord",
  "Notion",
  "Slack",
  "Gmail",
  "Google Calendar",
  "Trello",
  "GitHub",
] as const satisfies readonly ConnectorType[];

export const CONNECTIONS = ACTIVE_CONNECTION_TYPES.map((type) => {
  const connector = CONNECTOR_REGISTRY[type];
  return {
    title: connector.title,
    description: connector.description,
    image: connector.image,
    connectionKey: connector.connectionKey!,
    accessTokenKey: connector.accessTokenKey,
    alwaysTrue: connector.alwaysTrue,
    slackSpecial: connector.slackSpecial,
    type: connector.statusType,
    sharedCredentialType: connector.sharedCredentialType,
    requiredCredentialScopes: connector.requiredCredentialScopes,
  };
});

export const connectorTypeSchema = z.enum([
  "Google Drive",
  "Discord",
  "Notion",
  "Slack",
  "Gmail",
  "Google Calendar",
  "Trello",
  "GitHub",
]);

export const connectorSettingsJsonSchema = z.record(z.string(), z.unknown());

export const connectorRelationJsonSchema = z.object({
  sourceConnectionId: z.string().optional(),
  targetConnectionId: z.string().optional(),
  sourceNodeId: z.string().optional(),
  targetNodeId: z.string().optional(),
  sourceConnectorType: connectorTypeSchema.optional(),
  targetConnectorType: connectorTypeSchema.optional(),
  settingsKey: z.string(),
  value: z.unknown(),
});

export type ConnectorSettingsInput = z.infer<typeof connectorSettingsJsonSchema>;
export type ConnectorRelationInput = ConnectorRelationPair &
  Omit<z.infer<typeof connectorRelationJsonSchema>, "sourceConnectorType" | "targetConnectorType">;

export type ConnectorRelationValidation = {
  valid: boolean;
  unsupportedPair: boolean;
  unknownSettingsKey: boolean;
  requiredValueMissing: boolean;
};

const SUPPORTED_CONNECTOR_RELATION_PAIRS = [
  { sourceConnectorType: "Google Drive", targetConnectorType: "Notion" },
  { sourceConnectorType: "Google Drive", targetConnectorType: "Slack" },
  { sourceConnectorType: "Google Drive", targetConnectorType: "Discord" },
  { sourceConnectorType: "Google Drive", targetConnectorType: "Gmail" },
  { sourceConnectorType: "Gmail", targetConnectorType: "Notion" },
  { sourceConnectorType: "Gmail", targetConnectorType: "Google Drive" },
  { sourceConnectorType: "Google Calendar", targetConnectorType: "Slack" },
  { sourceConnectorType: "Google Calendar", targetConnectorType: "Discord" },
  { sourceConnectorType: "GitHub", targetConnectorType: "Trello" },
  { sourceConnectorType: "Trello", targetConnectorType: "Slack" },
  { sourceConnectorType: "Trello", targetConnectorType: "Discord" },
  { sourceConnectorType: "Notion", targetConnectorType: "GitHub" },
] as const satisfies readonly ConnectorRelationPair[];

export const isSupportedConnectorRelationPair = (
  relation: { sourceConnectorType: ConnectorType; targetConnectorType: ConnectorType }
): relation is ConnectorRelationPair =>
  SUPPORTED_CONNECTOR_RELATION_PAIRS.some(
    (pair) =>
      pair.sourceConnectorType === relation.sourceConnectorType &&
      pair.targetConnectorType === relation.targetConnectorType
  );

export const validateConnectorRelation = (
  relation: {
    sourceConnectorType: ConnectorType;
    targetConnectorType: ConnectorType;
    settingsKey: string;
    value?: unknown;
  }
): ConnectorRelationValidation => {
  const unsupportedPair = !isSupportedConnectorRelationPair(relation);
  const preset = CONNECTOR_REGISTRY[relation.sourceConnectorType].relations.defaultSourceMappings.find(
    (mapping) =>
      mapping.sourceConnectorType === relation.sourceConnectorType &&
      mapping.targetConnectorType === relation.targetConnectorType &&
      mapping.settingsKey === relation.settingsKey
  );
  const unknownSettingsKey = !preset;
  const requiredValueMissing = Boolean(
    preset?.required &&
      "value" in relation &&
      (relation.value === undefined || relation.value === null || relation.value === "")
  );

  return {
    valid: !unsupportedPair && !unknownSettingsKey && !requiredValueMissing,
    unsupportedPair,
    unknownSettingsKey,
    requiredValueMissing,
  };
};

export const isConnectorType = (type: string): type is ConnectorType =>
  connectorTypeSchema.safeParse(type).success;

export const getConnector = (type: ConnectorType) => CONNECTOR_REGISTRY[type];

export const getConnectorSettingsSchema = (
  type: ConnectorType,
  kind: "connection" | ConnectorOperationKind = "connection"
): ConnectorSettingsField[] => CONNECTOR_REGISTRY[type].settings[kind] ?? [];

export const getMissingRequiredSettings = (
  type: ConnectorType,
  kind: "connection" | ConnectorOperationKind,
  settings: ConnectorSettingsInput | null | undefined
): string[] => {
  const values = settings ?? {};
  return getConnectorSettingsSchema(type, kind)
    .filter((field) => field.required)
    .filter((field) => {
      const value = values[field.key];
      return (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      );
    })
    .map((field) => field.key);
};

export const validateConnectorSettings = (
  type: ConnectorType,
  kind: "connection" | ConnectorOperationKind,
  settings: ConnectorSettingsInput | null | undefined
): ConnectorSettingsValidation => {
  const schema = getConnectorSettingsSchema(type, kind);
  const values = settings ?? {};
  const allowedFields = new Set(schema.map((field) => field.key));
  const unknownFields = Object.keys(values).filter((key) => !allowedFields.has(key));
  const missingRequired = getMissingRequiredSettings(type, kind, values);

  return {
    valid: missingRequired.length === 0,
    missingRequired,
    unknownFields,
    schema,
  };
};

export const getConnectorOperations = (type: ConnectorType, kind: ConnectorOperationKind) =>
  kind === "trigger"
    ? CONNECTOR_REGISTRY[type].capabilities.triggers
    : CONNECTOR_REGISTRY[type].capabilities.actions;

export const canConnectConnectorTypes = (
  sourceType: ConnectorType,
  targetType: ConnectorType
) => isSupportedConnectorRelationPair({ sourceConnectorType: sourceType, targetConnectorType: targetType });
