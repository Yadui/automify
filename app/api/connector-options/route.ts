import { google } from "googleapis";
import { Client } from "@notionhq/client";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/app-auth";
import db from "@/lib/db";
import type { ConnectorSettingsInput, ConnectorType } from "@/lib/connectors";
import { getOAuthProviderCredentials } from "@/lib/oauth-provider-config";

export const runtime = "nodejs";

type ConnectorOption = {
  value: string;
  label: string;
  description?: string;
};

type GoogleFile = {
  id?: string | null;
  name?: string | null;
  mimeType?: string | null;
};

type TrelloNamedResource = {
  id?: string;
  name?: string;
  displayName?: string;
  closed?: boolean;
  color?: string | null;
};

type GitHubRepository = {
  full_name?: string;
  description?: string | null;
};

type GitHubNamedResource = {
  login?: string;
  name?: string;
  description?: string | null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getRecoverableOptionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  const status = isRecord(error) ? error.status ?? error.code : undefined;

  if (message.includes("invalid_grant")) {
    return "Google connection expired. Reconnect Google Drive.";
  }

  if (message.includes("insufficient") || message.includes("invalid_scope")) {
    return "This connection needs additional permissions. Reconnect it from Connections.";
  }

  if (status === 401 || status === 403) {
    return "This connection needs to be reconnected from Connections.";
  }

  return null;
};

const staticOptions: Record<string, ConnectorOption[]> = {
  "googleCalendar.eventModes": [
    { value: "create", label: "Create event" },
    { value: "update", label: "Update event" },
    { value: "read", label: "Read event" },
  ],
  "github.issueStates": [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "all", label: "All" },
  ],
  "github.prStates": [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
    { value: "all", label: "All" },
  ],
};

const toOptions = (files: GoogleFile[]): ConnectorOption[] =>
  files.flatMap((file) => {
    if (!file.id || !file.name) return [];
    return [{ value: file.id, label: file.name, description: file.mimeType ?? undefined }];
  });

const getGoogleAuthClient = async (user: { id: string; email: string }) => {
  const googleConnection = await db.google.findFirst({
    where: {
      OR: [
        { userId: user.id },
        { User: { email: user.email } },
      ],
    },
  });
  if (!googleConnection?.accessToken) return null;

  const googleCredentials = getOAuthProviderCredentials("google");
  if (!googleCredentials) return null;

  const oauth2Client = new google.auth.OAuth2(
    googleCredentials.clientId,
    googleCredentials.clientSecret,
    process.env.OAUTH2_REDIRECT_URI || process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: googleConnection.accessToken,
    refresh_token: googleConnection.refreshToken || undefined,
  });

  return oauth2Client;
};

const listGoogleDriveOptions = async (
  user: { id: string; email: string },
  source: "googleDrive.folders" | "googleDrive.files"
) => {
  const auth = await getGoogleAuthClient(user);
  if (!auth) return { options: [], error: "Google Drive is not connected." };

  const drive = google.drive({ version: "v3", auth });
  const folderMimeType = "application/vnd.google-apps.folder";
  const q =
    source === "googleDrive.folders"
      ? `mimeType='${folderMimeType}' and trashed=false`
      : `mimeType!='${folderMimeType}' and trashed=false`;
  const response = await drive.files.list({
    q,
    fields: "files(id,name,mimeType)",
    orderBy: "name",
    pageSize: 100,
    includeItemsFromAllDrives: true,
    supportsAllDrives: true,
  });

  const options = toOptions(response.data.files ?? []);
  return {
    options:
      source === "googleDrive.folders"
        ? [{ value: "root", label: "My Drive" }, ...options]
        : options,
  };
};

const listGmailLabels = async (user: { id: string; email: string }) => {
  const auth = await getGoogleAuthClient(user);
  if (!auth) return { options: [], error: "Google is not connected." };

  const gmail = google.gmail({ version: "v1", auth });
  const response = await gmail.users.labels.list({ userId: "me" });
  const options = (response.data.labels ?? [])
    .filter((label) => label.id && label.name)
    .map((label) => ({ value: label.id!, label: label.name! }));

  return { options };
};

const listGoogleCalendars = async (user: { id: string; email: string }) => {
  const auth = await getGoogleAuthClient(user);
  if (!auth) return { options: [], error: "Google Calendar is not connected." };

  const calendar = google.calendar({ version: "v3", auth });
  const response = await calendar.calendarList.list({ maxResults: 100 });
  const options = (response.data.items ?? [])
    .filter((item) => item.id && item.summary)
    .map((item) => ({ value: item.id!, label: item.summary! }));

  return { options };
};

const listSlackChannels = async (userId: string) => {
  const slackConnection = await db.slack.findFirst({ where: { userId } });
  if (!slackConnection?.slackAccessToken) return { options: [], error: "Slack is not connected." };

  const response = await fetch(
    `https://slack.com/api/conversations.list?${new URLSearchParams({
      types: "public_channel,private_channel",
      limit: "200",
    })}`,
    { headers: { Authorization: `Bearer ${slackConnection.slackAccessToken}` } }
  );
  const data = (await response.json()) as {
    ok?: boolean;
    error?: string;
    channels?: { id?: string; name?: string; is_member?: boolean }[];
  };

  if (!data.ok) return { options: [], error: data.error || "Unable to load Slack channels." };

  const options = (data.channels ?? [])
    .filter((channel) => channel.id && channel.name && channel.is_member)
    .map((channel) => ({ value: channel.id!, label: `#${channel.name}` }));

  return { options };
};

const getConnectionSettings = async (userId: string, type: ConnectorType) => {
  const connection = await db.connections.findUnique({
    where: {
      userId_type: {
        userId,
        type,
      },
    },
    select: { settings: true },
  });

  return (connection?.settings ?? {}) as ConnectorSettingsInput;
};

const getStringSetting = (settings: ConnectorSettingsInput, key: string) => {
  const value = settings[key];
  return typeof value === "string" ? value : "";
};

const getTrelloCredentials = async (userId: string) => {
  const settings = await getConnectionSettings(userId, "Trello");
  const apiKey = getStringSetting(settings, "apiKey");
  const token = getStringSetting(settings, "token");

  if (!apiKey || !token) return null;
  return { apiKey, token };
};

const fetchTrello = async <T,>(
  path: string,
  credentials: { apiKey: string; token: string },
  params: Record<string, string> = {}
) => {
  const url = new URL(`https://api.trello.com/1/${path}`);
  url.searchParams.set("key", credentials.apiKey);
  url.searchParams.set("token", credentials.token);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Trello returned ${response.status}.`);
  return (await response.json()) as T;
};

const trelloResourcesToOptions = (resources: TrelloNamedResource[]): ConnectorOption[] =>
  resources.flatMap((resource) => {
    if (!resource.id || resource.closed) return [];
    const label = resource.displayName || resource.name || resource.color || resource.id;
    return [{ value: resource.id, label }];
  });

const listTrelloOptions = async (
  userId: string,
  source: string,
  params: { boardId?: string; listId?: string }
) => {
  const credentials = await getTrelloCredentials(userId);
  if (!credentials) return { options: [], error: "Trello is not connected." };

  if (source === "trello.workspaces") {
    const workspaces = await fetchTrello<TrelloNamedResource[]>("members/me/organizations", credentials, {
      fields: "displayName,name",
    });
    return { options: trelloResourcesToOptions(workspaces) };
  }

  if (source === "trello.boards") {
    const boards = await fetchTrello<TrelloNamedResource[]>("members/me/boards", credentials, {
      fields: "name,closed,idOrganization",
    });
    return { options: trelloResourcesToOptions(boards) };
  }

  if (source === "trello.lists") {
    if (!params.boardId) return { options: [], error: "Select a Trello board first." };
    const lists = await fetchTrello<TrelloNamedResource[]>(`boards/${params.boardId}/lists`, credentials, {
      fields: "name,closed",
    });
    return { options: trelloResourcesToOptions(lists) };
  }

  if (source === "trello.cards") {
    if (params.listId) {
      const cards = await fetchTrello<TrelloNamedResource[]>(`lists/${params.listId}/cards`, credentials, {
        fields: "name,closed",
      });
      return { options: trelloResourcesToOptions(cards) };
    }

    if (!params.boardId) return { options: [], error: "Select a Trello board first." };
    const cards = await fetchTrello<TrelloNamedResource[]>(`boards/${params.boardId}/cards`, credentials, {
      fields: "name,closed",
    });
    return { options: trelloResourcesToOptions(cards) };
  }

  if (source === "trello.labels") {
    if (!params.boardId) return { options: [], error: "Select a Trello board first." };
    const labels = await fetchTrello<TrelloNamedResource[]>(`boards/${params.boardId}/labels`, credentials, {
      fields: "name,color",
    });
    return { options: trelloResourcesToOptions(labels) };
  }

  return { options: [], error: `No option loader for ${source}.` };
};

const getGitHubToken = async (userId: string) => {
  const settings = await getConnectionSettings(userId, "GitHub");
  return getStringSetting(settings, "accessToken");
};

const fetchGitHub = async <T,>(path: string, accessToken: string) => {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) throw new Error(`GitHub returned ${response.status}.`);
  return (await response.json()) as T;
};

const parseRepository = (repository?: string) => {
  const [owner, repo] = (repository ?? "").split("/");
  if (!owner || !repo) return null;
  return { owner, repo };
};

const listGitHubOptions = async (userId: string, source: string, repository?: string) => {
  const accessToken = await getGitHubToken(userId);
  if (!accessToken) return { options: [], error: "GitHub is not connected." };

  if (source === "github.repositories") {
    const repositories = await fetchGitHub<GitHubRepository[]>(
      "user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
      accessToken
    );
    const options = repositories.flatMap((repo) =>
      repo.full_name ? [{ value: repo.full_name, label: repo.full_name, description: repo.description ?? undefined }] : []
    );
    return { options };
  }

  const parsedRepository = parseRepository(repository);
  if (!parsedRepository) return { options: [], error: "Select a GitHub repository first." };

  const encodedOwner = encodeURIComponent(parsedRepository.owner);
  const encodedRepo = encodeURIComponent(parsedRepository.repo);

  if (source === "github.labels") {
    const labels = await fetchGitHub<GitHubNamedResource[]>(
      `repos/${encodedOwner}/${encodedRepo}/labels?per_page=100`,
      accessToken
    );
    return {
      options: labels.flatMap((label) =>
        label.name ? [{ value: label.name, label: label.name, description: label.description ?? undefined }] : []
      ),
    };
  }

  if (source === "github.assignees") {
    const assignees = await fetchGitHub<GitHubNamedResource[]>(
      `repos/${encodedOwner}/${encodedRepo}/assignees?per_page=100`,
      accessToken
    );
    return {
      options: assignees.flatMap((assignee) =>
        assignee.login ? [{ value: assignee.login, label: assignee.login }] : []
      ),
    };
  }

  return { options: [], error: `No option loader for ${source}.` };
};

const decryptNotionToken = (token: string) => {
  const key = process.env.NOTION_ENCRYPTION_KEY;
  if (!key || !token.includes(":")) return token;

  const [ivHex, encryptedHex] = token.split(":");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), Buffer.from(ivHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
};

const getNotionClient = async (userId: string) => {
  const notionConnection = await db.notion.findFirst({ where: { userId } });
  if (!notionConnection?.accessToken) return null;
  return new Client({ auth: decryptNotionToken(notionConnection.accessToken) });
};

const listNotionDatabases = async (userId: string) => {
  const notion = await getNotionClient(userId);
  if (!notion) return { options: [], error: "Notion is not connected." };

  const response = await notion.search({
    filter: { property: "object", value: "database" },
    sort: { direction: "ascending", timestamp: "last_edited_time" },
  });

  const options = response.results.map((database) => {
    const title = "title" in database ? database.title[0]?.plain_text : undefined;
    return { value: database.id, label: title || "Untitled database" };
  });

  return { options };
};

const listNotionPages = async (userId: string) => {
  const notion = await getNotionClient(userId);
  if (!notion) return { options: [], error: "Notion is not connected." };

  const response = await notion.search({
    filter: { property: "object", value: "page" },
    sort: { direction: "ascending", timestamp: "last_edited_time" },
    page_size: 100,
  });

  const options = response.results.map((page) => ({ value: page.id, label: "url" in page ? page.url : page.id }));
  return { options };
};

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get("source") ?? "";
  const user = await getAppUser();

  if (!user) {
    return NextResponse.json({ options: [], error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (source in staticOptions) {
      return NextResponse.json({ options: staticOptions[source] });
    }

    if (source === "googleDrive.folders" || source === "googleDrive.files") {
      return NextResponse.json(await listGoogleDriveOptions(user, source));
    }

    if (source === "gmail.labels") {
      return NextResponse.json(await listGmailLabels(user));
    }

    if (source === "googleCalendar.calendars") {
      return NextResponse.json(await listGoogleCalendars(user));
    }

    if (source === "slack.channels") {
      return NextResponse.json(await listSlackChannels(user.id));
    }

    if (source === "notion.databases") {
      return NextResponse.json(await listNotionDatabases(user.id));
    }

    if (source === "notion.pages") {
      return NextResponse.json(await listNotionPages(user.id));
    }

    if (source.startsWith("trello.")) {
      return NextResponse.json(
        await listTrelloOptions(user.id, source, {
          boardId: req.nextUrl.searchParams.get("boardId") ?? undefined,
          listId: req.nextUrl.searchParams.get("listId") ?? undefined,
        })
      );
    }

    if (source === "github.repositories" || source === "github.labels" || source === "github.assignees") {
      return NextResponse.json(
        await listGitHubOptions(
          user.id,
          source,
          req.nextUrl.searchParams.get("repository") ?? undefined
        )
      );
    }

    return NextResponse.json({ options: [], error: `No option loader for ${source}.` }, { status: 404 });
  } catch (error) {
    const recoverableError = getRecoverableOptionError(error);
    if (recoverableError) {
      return NextResponse.json({ options: [], error: recoverableError });
    }

    console.error("Connector option load failed", error);
    return NextResponse.json(
      { options: [], error: "Unable to load connector options." },
      { status: 500 }
    );
  }
}