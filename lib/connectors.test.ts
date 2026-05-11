import {
  CONNECTIONS,
  CONNECTOR_REGISTRY,
  canConnectConnectorTypes,
  getConnector,
  getConnectorSettingsSchema,
  getMissingRequiredSettings,
  isConnectorType,
  validateConnectorRelation,
  validateConnectorSettings,
} from "./connectors";

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message);
};

const assertDeepEqual = (actual: unknown, expected: unknown, message: string) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${message}\nExpected: ${expectedJson}\nActual:   ${actualJson}`);
  }
};

assert(isConnectorType("Discord"), "Discord should be a registered connector type");
assert(!isConnectorType("Dropbox"), "Unknown apps should not be registered connector types");

assertDeepEqual(
  CONNECTIONS.map((connection) => connection.title).slice(0, 4),
  ["Google Drive", "Discord", "Notion", "Slack"],
  "Legacy connection card order should be preserved"
);

const discord = getConnector("Discord");
assert(discord.oauth?.authorizationUrl === "https://discord.com/api/oauth2/authorize", "Discord OAuth metadata should be registered");
assert(discord.capabilities.actions.some((action) => action.id === "discord.send_message"), "Discord action capability should be registered");
assert(discord.relations.canTarget.includes("Google Drive"), "Discord should be able to target Google Drive triggers");

const slackSchema = getConnectorSettingsSchema("Slack", "action");
assertDeepEqual(
  slackSchema.map((field) => field.key),
  ["slackChannel", "content"],
  "Slack action schema should expose channel/content settings"
);

assertDeepEqual(
  getMissingRequiredSettings("Slack", "action", { content: "hello" }),
  ["slackChannel"],
  "Missing required settings should be detected"
);

const validSlack = validateConnectorSettings("Slack", "action", {
  slackChannel: "C123",
  content: "hello",
});
assert(validSlack.valid, "Complete Slack action settings should validate");
assertDeepEqual(validSlack.missingRequired, [], "Valid Slack settings should have no missing required fields");

const invalidSlack = validateConnectorSettings("Slack", "action", { slackChannel: "C123" });
assert(!invalidSlack.valid, "Incomplete Slack action settings should not validate");
assertDeepEqual(invalidSlack.missingRequired, ["content"], "Invalid Slack settings should report missing content");

assert(
  CONNECTOR_REGISTRY["Google Drive"].relations.defaultSourceMappings.some(
    (mapping) => mapping.targetConnectorType === "Notion" && mapping.settingsKey === "databaseId"
  ),
  "Google Drive should describe source-to-Notion database mapping support"
);

assertDeepEqual(
  CONNECTIONS.map((connection) => connection.title),
  ["Google Drive", "Discord", "Notion", "Slack", "Gmail", "Google Calendar", "Trello", "GitHub"],
  "Google Workspace, Trello, and GitHub connection cards should be visible after legacy cards"
);

const gmail = getConnector("Gmail");
assert(
  gmail.oauth?.scopes.includes("https://www.googleapis.com/auth/gmail.readonly") &&
    gmail.oauth?.scopes.includes("https://www.googleapis.com/auth/gmail.send"),
  "Gmail should request explicit read/send OAuth scopes"
);
assertDeepEqual(
  getConnectorSettingsSchema("Gmail", "trigger").map((field) => field.key),
  ["labelId", "query", "from", "to"],
  "Gmail trigger settings should expose label/query/from/to filters"
);
assertDeepEqual(
  getConnectorSettingsSchema("Gmail", "action").map((field) => field.key),
  ["to", "from", "subject", "template", "attachmentFileId", "includeDriveLink"],
  "Gmail action settings should expose recipient/sender/template and Drive attachment/link fields"
);
assert(
  gmail.relations.defaultSourceMappings.some(
    (mapping) => mapping.sourceConnectorType === "Google Drive" && mapping.settingsKey === "attachmentFileId"
  ),
  "Gmail should describe Google Drive file to email attachment/link mapping"
);

const calendar = getConnector("Google Calendar");
assert(
  calendar.oauth?.scopes.includes("https://www.googleapis.com/auth/calendar.readonly") &&
    calendar.oauth?.scopes.includes("https://www.googleapis.com/auth/calendar.events"),
  "Google Calendar should request explicit read/events OAuth scopes"
);
assertDeepEqual(
  getConnectorSettingsSchema("Google Calendar", "trigger").map((field) => field.key),
  ["calendarId", "eventQuery", "timeWindow"],
  "Google Calendar trigger settings should expose calendar selection and event read filters"
);
assertDeepEqual(
  getConnectorSettingsSchema("Google Calendar", "action").map((field) => field.key),
  ["calendarId", "eventMode", "eventId", "summary", "description", "startTime", "endTime", "attendees", "defaultReminders"],
  "Google Calendar action settings should expose create/update/read event and attendee/reminder fields"
);
assert(
  calendar.relations.defaultSourceMappings.some(
    (mapping) => mapping.targetConnectorType === "Slack" && mapping.settingsKey === "content"
  ) &&
    calendar.relations.defaultSourceMappings.some(
      (mapping) => mapping.targetConnectorType === "Discord" && mapping.settingsKey === "content"
    ),
  "Google Calendar should describe event to Slack/Discord notification mappings"
);

const trello = getConnector("Trello");
assertDeepEqual(
  getConnectorSettingsSchema("Trello", "trigger").map((field) => field.key),
  ["boardId", "listId", "cardId"],
  "Trello trigger settings should expose board/list/card selectors"
);
assertDeepEqual(
  getConnectorSettingsSchema("Trello", "action").map((field) => field.key),
  ["boardId", "listId", "cardName", "cardDescription", "cardId", "labels", "dueDate"],
  "Trello action settings should expose board/list/card creation and update fields"
);
assert(
  trello.capabilities.triggers.some((trigger) => trigger.id === "trello.card_moved") &&
    trello.capabilities.actions.some((action) => action.id === "trello.create_card"),
  "Trello should register card trigger and action capabilities"
);
assert(
  trello.relations.defaultSourceMappings.some(
    (mapping) =>
      mapping.sourceConnectorType === "GitHub" &&
      mapping.targetConnectorType === "Trello" &&
      mapping.settingsKey === "cardName"
  ) &&
    trello.relations.defaultSourceMappings.some(
      (mapping) =>
        mapping.sourceConnectorType === "Trello" &&
        mapping.targetConnectorType === "Slack" &&
        mapping.settingsKey === "content"
    ) &&
    trello.relations.defaultSourceMappings.some(
      (mapping) =>
        mapping.sourceConnectorType === "Trello" &&
        mapping.targetConnectorType === "Discord" &&
        mapping.settingsKey === "content"
    ),
  "Trello should describe GitHub issue card and Slack/Discord notification relation presets"
);

const github = getConnector("GitHub");
assertDeepEqual(
  getConnectorSettingsSchema("GitHub", "trigger").map((field) => field.key),
  ["repository", "issueState", "prState", "labels"],
  "GitHub trigger settings should expose repository, issue, PR, and label filters"
);
assertDeepEqual(
  getConnectorSettingsSchema("GitHub", "action").map((field) => field.key),
  ["repository", "issueTitle", "issueBody", "assignees", "labels", "linkedNotionPageId"],
  "GitHub action settings should expose repo/issue/PR creation and Notion relation fields"
);
assert(
  github.capabilities.triggers.some((trigger) => trigger.id === "github.issue_opened") &&
    github.capabilities.triggers.some((trigger) => trigger.id === "github.pull_request_opened") &&
    github.capabilities.actions.some((action) => action.id === "github.create_issue"),
  "GitHub should register issue/PR trigger and create issue action capabilities"
);
assert(
  github.relations.defaultSourceMappings.some(
    (mapping) =>
      mapping.sourceConnectorType === "GitHub" &&
      mapping.targetConnectorType === "Trello" &&
      mapping.settingsKey === "cardDescription"
  ) &&
    github.relations.defaultSourceMappings.some(
      (mapping) =>
        mapping.sourceConnectorType === "Notion" &&
        mapping.targetConnectorType === "GitHub" &&
        mapping.settingsKey === "linkedNotionPageId"
    ),
  "GitHub should describe issue-to-Trello-card and Notion-item-to-GitHub-issue presets"
);

assert(
  getConnector("Gmail").relations.defaultSourceMappings.some(
    (mapping) =>
      mapping.sourceConnectorType === "Gmail" &&
      mapping.targetConnectorType === "Notion" &&
      mapping.settingsKey === "databaseId"
  ) &&
    getConnector("Google Drive").relations.defaultSourceMappings.some(
      (mapping) =>
        mapping.sourceConnectorType === "Gmail" &&
        mapping.targetConnectorType === "Google Drive" &&
        mapping.settingsKey === "folderId"
    ),
  "Gmail should describe message to Notion/Drive archive relation presets"
);

const validGithubToTrelloRelation = CONNECTOR_REGISTRY["GitHub"].relations.defaultSourceMappings.find(
  (mapping) => mapping.sourceConnectorType === "GitHub" && mapping.targetConnectorType === "Trello"
);
assert(validGithubToTrelloRelation, "GitHub to Trello relation preset should exist");
if (!validGithubToTrelloRelation) {
  throw new Error("GitHub to Trello relation preset should exist");
}
assert(
  validateConnectorRelation(validGithubToTrelloRelation).valid,
  "GitHub to Trello should validate as a supported relation pair"
);
assert(
  !validateConnectorRelation({
    sourceConnectorType: "GitHub",
    targetConnectorType: "Slack",
    settingsKey: "content",
    value: "{{issue.title}}",
  }).valid,
  "Invalid GitHub to Slack relation pair should be rejected by relation validation"
);
assert(canConnectConnectorTypes("GitHub", "Trello"), "GitHub should be allowed to connect to Trello");
assert(!canConnectConnectorTypes("GitHub", "Slack"), "GitHub should not be allowed to connect directly to Slack");

console.log("connector registry tests passed");
