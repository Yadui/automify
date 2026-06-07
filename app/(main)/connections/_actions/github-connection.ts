"use server";

import { getAppUser } from "@/lib/app-auth";
import db from "@/lib/db";
import type { ConnectorSettingsInput } from "@/lib/connectors";

const GITHUB_API = "https://api.github.com";

// ── Low-level fetch helper ────────────────────────────────────────────────────

const githubFetch = async <T,>(
  path: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> => {
  const res = await fetch(`${GITHUB_API}/${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub ${res.status}: ${body}`);
  }

  return res.json() as T;
};

// ── Credential helper ─────────────────────────────────────────────────────────

export const getGitHubAccessToken = async (): Promise<string | null> => {
  const user = await getAppUser();
  if (!user) return null;

  const connection = await db.connections.findUnique({
    where: { userId_type: { userId: user.id, type: "GitHub" } },
    select: { settings: true },
  });

  if (!connection) return null;
  const settings = (connection.settings ?? {}) as ConnectorSettingsInput;
  const token = settings.accessToken;
  return typeof token === "string" && token ? token : null;
};

// ── Validate connection ───────────────────────────────────────────────────────

export const testGitHubConnection = async () => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) {
    return {
      success: false as const,
      error:
        "GitHub is not connected. Add a Personal Access Token in Connections.",
    };
  }

  try {
    const ghUser = await githubFetch<{
      login: string;
      name: string | null;
      avatar_url: string;
      public_repos: number;
    }>("user", accessToken);

    return {
      success: true as const,
      data: {
        login: ghUser.login,
        name: ghUser.name,
        avatarUrl: ghUser.avatar_url,
        publicRepos: ghUser.public_repos,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("401")) {
      return {
        success: false as const,
        error: "Invalid token. Check your Personal Access Token in Connections.",
      };
    }
    return { success: false as const, error: msg };
  }
};

// ── List repositories ─────────────────────────────────────────────────────────

export const listGitHubRepositories = async () => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) return { repos: [], error: "GitHub is not connected." };

  try {
    const repos = await githubFetch<
      { full_name: string; description: string | null; private: boolean }[]
    >(
      "user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
      accessToken
    );

    return {
      repos: repos.map((r) => ({
        value: r.full_name,
        label: r.full_name,
        description: r.description ?? undefined,
        isPrivate: r.private,
      })),
    };
  } catch (err) {
    return {
      repos: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// ── List labels for a repository ──────────────────────────────────────────────

export const listGitHubLabels = async (repository: string) => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) return { labels: [], error: "GitHub is not connected." };

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) return { labels: [], error: "Invalid repository." };

  try {
    const labels = await githubFetch<{ name: string; color: string }[]>(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/labels?per_page=100`,
      accessToken
    );
    return { labels: labels.map((l) => ({ value: l.name, label: l.name })) };
  } catch (err) {
    return {
      labels: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// ── List assignees for a repository ──────────────────────────────────────────

export const listGitHubAssignees = async (repository: string) => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken) return { assignees: [], error: "GitHub is not connected." };

  const [owner, repo] = repository.split("/");
  if (!owner || !repo) return { assignees: [], error: "Invalid repository." };

  try {
    const assignees = await githubFetch<{ login: string }[]>(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/assignees?per_page=100`,
      accessToken
    );
    return {
      assignees: assignees.map((a) => ({ value: a.login, label: a.login })),
    };
  } catch (err) {
    return {
      assignees: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// ── Fetch most recent issue (for trigger test step) ───────────────────────────

export const fetchRecentIssue = async (
  repository: string,
  stateFilter = "open"
) => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken)
    return { success: false as const, error: "GitHub is not connected." };

  const [owner, repo] = repository.split("/");
  if (!owner || !repo)
    return { success: false as const, error: "Invalid repository." };

  const state =
    stateFilter === "closed" || stateFilter === "all" ? stateFilter : "open";

  try {
    const issues = await githubFetch<
      {
        number: number;
        title: string;
        body: string | null;
        html_url: string;
        user: { login: string } | null;
        labels: { name: string }[];
        state: string;
      }[]
    >(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues?state=${state}&per_page=1&sort=created&direction=desc`,
      accessToken
    );

    if (!issues.length) {
      // Return a synthetic sample so the user can still save and proceed
      return {
        success: true as const,
        isSample: true,
        data: {
          number: 1,
          title: "Example: Bug report",
          body: "Steps to reproduce: ...",
          url: `https://github.com/${repository}/issues/1`,
          author: "github-user",
          labels: [] as string[],
          state: "open",
          repo: repository,
        },
      };
    }

    const issue = issues[0];
    return {
      success: true as const,
      isSample: false,
      data: {
        number: issue.number,
        title: issue.title,
        body: issue.body ?? "",
        url: issue.html_url,
        author: issue.user?.login ?? "",
        labels: issue.labels.map((l) => l.name),
        state: issue.state,
        repo: repository,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// ── Fetch most recent pull request (for trigger test step) ────────────────────

export const fetchRecentPR = async (
  repository: string,
  stateFilter = "open"
) => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken)
    return { success: false as const, error: "GitHub is not connected." };

  const [owner, repo] = repository.split("/");
  if (!owner || !repo)
    return { success: false as const, error: "Invalid repository." };

  const state =
    stateFilter === "closed" || stateFilter === "all" ? stateFilter : "open";

  try {
    const prs = await githubFetch<
      {
        number: number;
        title: string;
        body: string | null;
        html_url: string;
        user: { login: string } | null;
        labels: { name: string }[];
        state: string;
      }[]
    >(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${state}&per_page=1&sort=created&direction=desc`,
      accessToken
    );

    if (!prs.length) {
      return {
        success: true as const,
        isSample: true,
        data: {
          number: 1,
          title: "Example: Add new feature",
          body: "This PR adds a new feature...",
          url: `https://github.com/${repository}/pull/1`,
          author: "github-user",
          labels: [] as string[],
          state: "open",
          repo: repository,
        },
      };
    }

    const pr = prs[0];
    return {
      success: true as const,
      isSample: false,
      data: {
        number: pr.number,
        title: pr.title,
        body: pr.body ?? "",
        url: pr.html_url,
        author: pr.user?.login ?? "",
        labels: pr.labels.map((l) => l.name),
        state: pr.state,
        repo: repository,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

// ── Create a GitHub issue ─────────────────────────────────────────────────────

export const createGitHubIssue = async (params: {
  repository: string;
  issueTitle: string;
  issueBody?: string;
  labels?: string[];
  assignees?: string[];
}) => {
  const accessToken = await getGitHubAccessToken();
  if (!accessToken)
    return { success: false as const, error: "GitHub is not connected." };

  const [owner, repo] = params.repository.split("/");
  if (!owner || !repo)
    return {
      success: false as const,
      error: "Invalid repository format (expected owner/repo).",
    };

  try {
    const issue = await githubFetch<{
      number: number;
      html_url: string;
      title: string;
    }>(
      `repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          title: params.issueTitle,
          body: params.issueBody || undefined,
          labels: params.labels?.length ? params.labels : undefined,
          assignees: params.assignees?.length ? params.assignees : undefined,
        }),
      }
    );

    return {
      success: true as const,
      data: {
        number: issue.number,
        url: issue.html_url,
        title: issue.title,
        repo: params.repository,
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false as const, error: msg };
  }
};
