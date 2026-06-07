"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useEditor } from "@/providers/editor-provider";
import { CONNECTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Settings2,
  User2,
  PlayCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  GitBranch,
  GitPullRequest,
  Plus,
  ExternalLink,
  AlertCircle,
  Lock,
  Globe,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "sonner";
import RenderConnectionAccordion from "./render-connection-accordion";
import SmartInput from "./smart-input";
import { parseVariables } from "@/lib/utils";
import {
  testGitHubConnection,
  listGitHubRepositories,
  listGitHubLabels,
  listGitHubAssignees,
  fetchRecentIssue,
  fetchRecentPR,
  createGitHubIssue,
} from "../../../../connections/_actions/github-connection";

// ── Constants ─────────────────────────────────────────────────────────────────

const nativeInputCls =
  "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-[#171717] " +
  "shadow-[rgb(235,235,235)_0px_0px_0px_1px] focus-visible:outline " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[hsla(212,100%,48%,1)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

type Step = 1 | 2 | 3 | 4;
type EventId =
  | "github.issue_opened"
  | "github.pull_request_opened"
  | "github.create_issue";

interface Config {
  event: EventId | "";
  repository: string;
  repoLabel: string;
  // Trigger-mode filters
  stateFilter: string;
  labelFilter: string;
  // Action-mode fields
  issueTitle: string;
  issueBody: string;
  selectedLabels: string[];
  selectedAssignees: string[];
}

const DEFAULT_CONFIG: Config = {
  event: "",
  repository: "",
  repoLabel: "",
  stateFilter: "open",
  labelFilter: "",
  issueTitle: "",
  issueBody: "",
  selectedLabels: [],
  selectedAssignees: [],
};

const GITHUB_EVENTS = [
  {
    id: "github.issue_opened" as EventId,
    label: "Issue opened",
    description: "Trigger when a new GitHub issue is opened in a repository.",
    Icon: GitBranch,
    badge: "Trigger",
  },
  {
    id: "github.pull_request_opened" as EventId,
    label: "Pull request opened",
    description: "Trigger when a new pull request is opened in a repository.",
    Icon: GitPullRequest,
    badge: "Trigger",
  },
  {
    id: "github.create_issue" as EventId,
    label: "Create issue",
    description: "Create a new GitHub issue from workflow data.",
    Icon: Plus,
    badge: "Action",
  },
];

const STATE_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "all", label: "All" },
];

const isTrigger = (event: EventId | "") =>
  event === "github.issue_opened" || event === "github.pull_request_opened";

// ── Multi-select checkbox list ────────────────────────────────────────────────

const CheckList = ({
  label,
  items,
  selected,
  onChange,
  loading,
  error,
}: {
  label: string;
  items: { value: string; label: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
  error?: string;
}) => {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase">{label}</Label>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
        </div>
      ) : error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None available</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
          {items.map((item) => (
            <label
              key={item.value}
              className={clsx(
                "flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-colors",
                selected.includes(item.value)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-muted bg-card hover:bg-muted/50"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selected.includes(item.value)}
                onChange={() => toggle(item.value)}
              />
              <span className="truncate">{item.label}</span>
              {selected.includes(item.value) && (
                <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" />
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Wizard ────────────────────────────────────────────────────────────────────

export const GitHubWizard = () => {
  const { state, dispatch } = useEditor();
  const selectedNode = state.editor.selectedNode;

  const _initStep = (): Step => {
    const meta = selectedNode?.data?.metadata as any;
    return (((selectedNode?.data as any)?.configStatus === "active" || meta?.sampleData)
      ? 4
      : 1) as Step;
  };

  const [step, _setStep] = useState<Step>(_initStep);
  const [maxStep, setMaxStep] = useState<Step>(_initStep);
  const setStep = (next: Step) => {
    _setStep(next);
    setMaxStep((prev) => (next > prev ? next : prev) as Step);
  };

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(
    () => (selectedNode?.data?.metadata as any)?.sampleData ?? null
  );
  const [connectionInfo, setConnectionInfo] = useState<{
    login: string;
    name: string | null;
  } | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Config state
  const [config, setConfig] = useState<Config>(() => {
    const meta = (selectedNode?.data?.metadata ?? {}) as any;
    return {
      ...DEFAULT_CONFIG,
      event: meta.event ?? "",
      repository: meta.repository ?? "",
      repoLabel: meta.repoLabel ?? meta.repository ?? "",
      stateFilter: meta.stateFilter ?? "open",
      labelFilter: meta.labelFilter ?? "",
      issueTitle: meta.issueTitle ?? "",
      issueBody: meta.issueBody ?? "",
      selectedLabels: Array.isArray(meta.selectedLabels) ? meta.selectedLabels : [],
      selectedAssignees: Array.isArray(meta.selectedAssignees)
        ? meta.selectedAssignees
        : [],
    };
  });

  // Dynamic option lists
  const [repos, setRepos] = useState<{ value: string; label: string; isPrivate?: boolean }[]>([]);
  const [reposError, setReposError] = useState<string | null>(null);
  const [labels, setLabels] = useState<{ value: string; label: string }[]>([]);
  const [labelsLoading, setLabelsLoading] = useState(false);
  const [labelsError, setLabelsError] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<{ value: string; label: string }[]>([]);
  const [assigneesLoading, setAssigneesLoading] = useState(false);
  const [assigneesError, setAssigneesError] = useState<string | null>(null);

  // ── Restore state from node metadata on node switch ─────────────────────────
  useEffect(() => {
    const meta = (selectedNode?.data?.metadata ?? {}) as any;
    const status = (selectedNode?.data as any)?.configStatus;
    setConfig({
      ...DEFAULT_CONFIG,
      event: meta.event ?? "",
      repository: meta.repository ?? "",
      repoLabel: meta.repoLabel ?? meta.repository ?? "",
      stateFilter: meta.stateFilter ?? "open",
      labelFilter: meta.labelFilter ?? "",
      issueTitle: meta.issueTitle ?? "",
      issueBody: meta.issueBody ?? "",
      selectedLabels: Array.isArray(meta.selectedLabels) ? meta.selectedLabels : [],
      selectedAssignees: Array.isArray(meta.selectedAssignees)
        ? meta.selectedAssignees
        : [],
    });
    setTestResult(meta.sampleData ?? null);
    const restored = ((status === "active" || meta.sampleData) ? 4 : 1) as Step;
    _setStep(restored);
    setMaxStep(restored);
  }, [selectedNode?.id]);

  // ── Validate GitHub connection on step 1 ─────────────────────────────────────
  const hasFetchedConnectionRef = React.useRef(false);
  useEffect(() => {
    if (hasFetchedConnectionRef.current) return;
    hasFetchedConnectionRef.current = true;

    testGitHubConnection().then((result) => {
      if (result.success) {
        setConnectionInfo({ login: result.data.login, name: result.data.name });
      } else {
        setConnectionError(result.error);
      }
    });
  }, []);

  // ── Load repos on step 3 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3 || repos.length > 0) return;
    setLoading(true);
    setReposError(null);
    listGitHubRepositories().then((result) => {
      if (result.repos.length > 0) {
        setRepos(result.repos);
      } else if (result.error) {
        setReposError(result.error);
      }
      setLoading(false);
    });
  }, [step, repos.length]);

  // ── Load labels/assignees when repo is set in action mode ────────────────────
  const loadRepoDetails = useCallback(async (repository: string) => {
    if (!repository || !config.event) return;
    const isAction = config.event === "github.create_issue";
    if (!isAction) return;

    setLabelsLoading(true);
    setAssigneesLoading(true);
    setLabelsError(null);
    setAssigneesError(null);

    const [labelsResult, assigneesResult] = await Promise.all([
      listGitHubLabels(repository),
      listGitHubAssignees(repository),
    ]);

    setLabels(labelsResult.labels ?? []);
    if (labelsResult.error) setLabelsError(labelsResult.error);

    setAssignees(assigneesResult.assignees ?? []);
    if (assigneesResult.error) setAssigneesError(assigneesResult.error);

    setLabelsLoading(false);
    setAssigneesLoading(false);
  }, [config.event]);

  useEffect(() => {
    if (config.repository) {
      loadRepoDetails(config.repository);
    }
  }, [config.repository, loadRepoDetails]);

  // ── Update config and sync to node metadata ──────────────────────────────────
  const updateConfig = (updates: Partial<Config>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  metadata: {
                    ...node.data.metadata,
                    ...updates,
                  },
                },
              }
            : node
        ),
      },
    });
  };

  // ── Test step handler ─────────────────────────────────────────────────────────
  const onTest = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      if (config.event === "github.issue_opened") {
        const result = await fetchRecentIssue(config.repository, config.stateFilter);
        if (result.success) {
          setTestResult(result.data);
          if (result.isSample) {
            toast.info("No issues found — using sample data so you can continue.");
          } else {
            toast.success("Connection verified! Most recent issue loaded.");
          }
        } else {
          toast.error(result.error);
        }
      } else if (config.event === "github.pull_request_opened") {
        const result = await fetchRecentPR(config.repository, config.stateFilter);
        if (result.success) {
          setTestResult(result.data);
          if (result.isSample) {
            toast.info("No PRs found — using sample data so you can continue.");
          } else {
            toast.success("Connection verified! Most recent PR loaded.");
          }
        } else {
          toast.error(result.error);
        }
      } else if (config.event === "github.create_issue") {
        const parsedTitle = parseVariables(config.issueTitle, state.editor.elements);
        const parsedBody = parseVariables(config.issueBody, state.editor.elements);

        if (!parsedTitle) {
          toast.error("Issue title is required.");
          setLoading(false);
          return;
        }

        const result = await createGitHubIssue({
          repository: config.repository,
          issueTitle: `[TEST] ${parsedTitle}`,
          issueBody: parsedBody || "Created by Automify wizard test.",
          labels: config.selectedLabels,
          assignees: config.selectedAssignees,
        });

        if (result.success) {
          setTestResult(result.data);
          toast.success(`Test issue #${result.data.number} created on GitHub!`);
        } else {
          toast.error(result.error ?? "Failed to create test issue.");
        }
      }
    } catch {
      toast.error("An unexpected error occurred.");
    }

    setLoading(false);
  };

  // ── Save & finish ─────────────────────────────────────────────────────────────
  const onFinish = () => {
    const evtObj = GITHUB_EVENTS.find((e) => e.id === config.event);
    const eventLabel = (() => {
      if (config.event === "github.issue_opened")
        return `Watch issues: ${config.repoLabel || config.repository}`;
      if (config.event === "github.pull_request_opened")
        return `Watch PRs: ${config.repoLabel || config.repository}`;
      if (config.event === "github.create_issue")
        return `Create issue in ${config.repoLabel || config.repository}`;
      return evtObj?.label ?? "GitHub";
    })();

    dispatch({
      type: "UPDATE_NODE",
      payload: {
        elements: state.editor.elements.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                data: {
                  ...node.data,
                  configStatus: "active",
                  metadata: {
                    ...node.data.metadata,
                    ...config,
                    eventLabel,
                    sampleData: testResult,
                  },
                },
              }
            : node
        ),
      },
    });
    dispatch({ type: "SET_SIDEBAR_VISIBILITY", payload: { open: false } });
    toast.success("GitHub node configured!");
  };

  // ── Step nav guard ────────────────────────────────────────────────────────────
  const canProceedStep1 = Boolean(connectionInfo);
  const canProceedStep2 = Boolean(config.event);
  const canProceedStep3 = Boolean(config.repository);

  // ── Progress bar ──────────────────────────────────────────────────────────────
  const steps = [
    { id: 1, title: "Account", icon: User2 },
    { id: 2, title: "Event", icon: Settings2 },
    { id: 3, title: "Configure", icon: GitBranch },
    { id: 4, title: "Test", icon: PlayCircle },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Progress bar ──────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b bg-muted/30 shrink-0">
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0" />
          {steps.map((s) => (
            <div
              key={s.id}
              className={clsx(
                "relative z-10 flex flex-col items-center gap-2",
                s.id <= maxStep && s.id !== step && "cursor-pointer"
              )}
              onClick={() => {
                if (s.id <= maxStep && s.id !== step) setStep(s.id as Step);
              }}
            >
              <div
                className={clsx(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
                  step >= s.id
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-background border-muted text-muted-foreground",
                  step === s.id && "ring-4 ring-primary/20"
                )}
              >
                {step > s.id ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={clsx(
                  "text-[10px] font-medium",
                  step >= s.id ? "text-primary" : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── Step 1: Account ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <User2 className="w-4 h-4 text-primary" />
                Connect GitHub Account
              </label>
              <div className="rounded-xl border bg-card/50 overflow-hidden divide-y">
                {CONNECTIONS.filter((c) => c.title === "GitHub").map(
                  (connection) => (
                    <RenderConnectionAccordion
                      key={connection.title}
                      state={state}
                      connection={connection}
                    />
                  )
                )}
              </div>

              {connectionInfo && (
                <div className="p-4 rounded-xl border bg-green-500/5 border-green-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        @{connectionInfo.login}
                      </p>
                      {connectionInfo.name && (
                        <p className="text-xs text-muted-foreground">
                          {connectionInfo.name}
                        </p>
                      )}
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                </div>
              )}

              {connectionError && !connectionInfo && (
                <div className="p-4 rounded-xl border bg-amber-500/5 border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Not connected:</strong> Add a Personal Access Token
                    in <em>Connections</em> to enable GitHub actions.
                  </p>
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              Next Step <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── Step 2: Event ───────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                Select Action or Trigger
              </label>
              <div className="grid gap-3">
                {GITHUB_EVENTS.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => updateConfig({ event: evt.id })}
                    className={clsx(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      config.event === evt.id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-muted bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          config.event === evt.id
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <evt.Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm">{evt.label}</p>
                          <span
                            className={clsx(
                              "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                              evt.badge === "Trigger"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-violet-100 text-violet-700"
                            )}
                          >
                            {evt.badge}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {evt.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Configure ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-5">
              <label className="text-sm font-semibold flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                {isTrigger(config.event) ? "Configure Trigger" : "Configure Action"}
              </label>

              {/* Repository selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase">
                  Repository <span className="text-red-500">*</span>
                </Label>
                {loading ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading
                    repositories…
                  </div>
                ) : reposError ? (
                  <p className="text-xs text-destructive">{reposError}</p>
                ) : (
                  <select
                    className={nativeInputCls}
                    value={config.repository}
                    onChange={(e) => {
                      const repo = repos.find((r) => r.value === e.target.value);
                      updateConfig({
                        repository: e.target.value,
                        repoLabel: repo?.label ?? e.target.value,
                        // Reset repo-specific selections when repo changes
                        selectedLabels: [],
                        selectedAssignees: [],
                      });
                    }}
                  >
                    <option value="" disabled>
                      Select a repository…
                    </option>
                    {repos.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.isPrivate ? "🔒 " : ""}
                        {r.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* ── Trigger-mode fields ───────────────────────────────────── */}
              {isTrigger(config.event) && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase">
                      State Filter
                    </Label>
                    <select
                      className={nativeInputCls}
                      value={config.stateFilter}
                      onChange={(e) =>
                        updateConfig({ stateFilter: e.target.value })
                      }
                    >
                      {STATE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground">
                      Only process{" "}
                      {config.event === "github.issue_opened"
                        ? "issues"
                        : "pull requests"}{" "}
                      with this state.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase">
                      Label Filter{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <input
                      type="text"
                      className={nativeInputCls}
                      placeholder="bug, enhancement, …"
                      value={config.labelFilter}
                      onChange={(e) =>
                        updateConfig({ labelFilter: e.target.value })
                      }
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Comma-separated list. Leave empty to match all.
                    </p>
                  </div>
                </>
              )}

              {/* ── Action-mode fields ────────────────────────────────────── */}
              {config.event === "github.create_issue" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase">
                      Issue title <span className="text-red-500">*</span>
                    </Label>
                    <SmartInput
                      value={config.issueTitle}
                      onChange={(v) => updateConfig({ issueTitle: v })}
                      placeholder='New issue: {{nodeId.variable}}'
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase">
                      Issue body{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <SmartInput
                      value={config.issueBody}
                      onChange={(v) => updateConfig({ issueBody: v })}
                      type="textarea"
                      placeholder="Describe the issue… Use {{node.variable}} for dynamic content."
                    />
                  </div>

                  {config.repository && (
                    <>
                      <CheckList
                        label="Labels (optional)"
                        items={labels}
                        selected={config.selectedLabels}
                        loading={labelsLoading}
                        error={labelsError ?? undefined}
                        onChange={(v) => updateConfig({ selectedLabels: v })}
                      />
                      <CheckList
                        label="Assignees (optional)"
                        items={assignees}
                        selected={config.selectedAssignees}
                        loading={assigneesLoading}
                        error={assigneesError ?? undefined}
                        onChange={(v) =>
                          updateConfig({ selectedAssignees: v })
                        }
                      />
                    </>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2]"
                disabled={!canProceedStep3 || loading}
                onClick={() => setStep(4)}
              >
                Next Step <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 4: Test & Save ──────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center">
            <div
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
                testResult
                  ? "bg-green-100 text-green-600"
                  : "bg-primary/10 text-primary"
              )}
            >
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : testResult ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <PlayCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="font-bold">
                {testResult ? "Test Successful!" : "Ready to Test"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-[260px] mx-auto">
                {testResult
                  ? config.event === "github.create_issue"
                    ? `Issue #${testResult.number} created in ${testResult.repo}`
                    : `Sample data loaded from ${testResult.repo}`
                  : config.event === "github.create_issue"
                  ? "We'll create a test issue on GitHub to verify the configuration."
                  : "We'll fetch a recent item from the repository to confirm the connection."}
              </p>
            </div>

            {!testResult && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={onTest}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : config.event === "github.create_issue" ? (
                  <Plus className="w-4 h-4 mr-2" />
                ) : (
                  <PlayCircle className="w-4 h-4 mr-2" />
                )}
                {config.event === "github.create_issue"
                  ? "Create Test Issue"
                  : "Verify & Load Sample"}
              </Button>
            )}

            {testResult && (
              <div className="text-left p-4 rounded-xl border bg-muted/30 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                  <CheckCircle2 className="w-4 h-4" /> SAMPLE DATA
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repository</span>
                    <span className="font-medium">{testResult.repo}</span>
                  </div>
                  {testResult.number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {config.event === "github.pull_request_opened"
                          ? "PR"
                          : "Issue"}{" "}
                        #
                      </span>
                      <span className="font-medium">{testResult.number}</span>
                    </div>
                  )}
                  {testResult.title && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium truncate">
                        {testResult.title}
                      </span>
                    </div>
                  )}
                  {testResult.author && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Author</span>
                      <span className="font-medium">@{testResult.author}</span>
                    </div>
                  )}
                  {testResult.url && (
                    <a
                      href={testResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 hover:underline mt-1"
                    >
                      View on GitHub{" "}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(3)}
              >
                <ChevronLeft className="mr-2 w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-[2] bg-green-600 hover:bg-green-700 font-bold text-white"
                disabled={!testResult}
                onClick={onFinish}
              >
                Save & Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubWizard;
