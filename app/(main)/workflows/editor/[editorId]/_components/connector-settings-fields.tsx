"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  getConnector,
  getConnectorSettingsSchema,
  type ConnectorFieldKind,
  type ConnectorRelationInput,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import React from "react";

type ConnectorOption = {
  value: string;
  label: string;
  description?: string;
};

type OptionState = {
  options: ConnectorOption[];
  isLoading: boolean;
  error?: string;
};

const supportedOptionSources = new Set([
  "googleDrive.folders",
  "googleDrive.files",
  "gmail.labels",
  "googleCalendar.calendars",
  "googleCalendar.eventModes",
  "slack.channels",
  "notion.databases",
  "notion.pages",
  "trello.workspaces",
  "trello.boards",
  "trello.lists",
  "trello.cards",
  "trello.labels",
  "github.repositories",
  "github.issueStates",
  "github.prStates",
  "github.labels",
  "github.assignees",
]);

const optionSourceDependencies: Record<string, string[]> = {
  "trello.lists": ["boardId"],
  "trello.cards": ["boardId", "listId"],
  "trello.labels": ["boardId"],
  "github.labels": ["repository"],
  "github.assignees": ["repository"],
};

const fallbackOptionsBySource: Record<string, ConnectorOption[]> = {
  "googleDrive.folders": [{ value: "root", label: "My Drive" }],
};

type Props = {
  type: ConnectorType;
  kind: "trigger" | "action";
  settings: ConnectorSettingsInput;
  onChange: (settings: ConnectorSettingsInput) => void;
  relations?: ConnectorRelationInput[];
  onRelationsChange?: (relations: ConnectorRelationInput[]) => void;
};

const stringifyValue = (value: unknown) => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "true" : "false";
  return JSON.stringify(value);
};

const parseValue = (kind: ConnectorFieldKind, value: string | boolean | string[]) => {
  if (kind === "boolean") return Boolean(value);
  if (kind === "multi-select") {
    if (Array.isArray(value)) return value;
    return String(value)
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
};

const ConnectorSettingsFields = ({
  type,
  kind,
  settings,
  onChange,
  relations = [],
  onRelationsChange,
}: Props) => {
  const [optionsBySource, setOptionsBySource] = React.useState<Record<string, OptionState>>({});
  const requestedOptionSources = React.useRef<Record<string, string>>({});
  const schema = getConnectorSettingsSchema(type, kind);
  const relationPresets = getConnector(type).relations.defaultSourceMappings;
  const settingsWithDefaults = React.useMemo(() => {
    const defaults = schema.reduce((nextSettings, field) => {
      if (field.defaultValue !== undefined && settings[field.key] === undefined) {
        return { ...nextSettings, [field.key]: field.defaultValue };
      }

      return nextSettings;
    }, settings);

    return defaults;
  }, [schema, settings]);
  const optionSources = React.useMemo(
    () =>
      Array.from(
        new Set(
          schema
            .filter(
              (field) =>
                field.optionsSource &&
                supportedOptionSources.has(field.optionsSource) &&
                (field.kind === "select" || field.kind === "multi-select")
            )
            .map((field) => field.optionsSource!)
        )
      ),
    [schema]
  );

  const optionRequests = React.useMemo(
    () =>
      optionSources.map((source) => {
        const params = new URLSearchParams({ source });
        optionSourceDependencies[source]?.forEach((dependency) => {
          const value = settingsWithDefaults[dependency];
          if (typeof value === "string" && value) params.set(dependency, value);
        });

        const query = params.toString();
        return {
          key: query,
          source,
          url: `/api/connector-options?${query}`,
        };
      }),
    [optionSources, settingsWithDefaults]
  );

  React.useEffect(() => {
    if (settingsWithDefaults === settings) return;
    onChange(settingsWithDefaults);
  }, [onChange, settings, settingsWithDefaults]);

  React.useEffect(() => {
    const abortControllers: AbortController[] = [];
    const timeoutIds: number[] = [];
    const requestKeys: Array<{ source: string; key: string }> = [];

    optionRequests.forEach(({ key, source, url }) => {
      if (requestedOptionSources.current[source] === key) return;
      requestedOptionSources.current[source] = key;
      requestKeys.push({ source, key });

      const abortController = new AbortController();
      let didTimeout = false;
      const timeoutId = window.setTimeout(() => {
        didTimeout = true;
        abortController.abort();
      }, 15000);
      abortControllers.push(abortController);
      timeoutIds.push(timeoutId);
      setOptionsBySource((current) => ({
        ...current,
        [source]: { options: [], isLoading: true },
      }));

      fetch(url, {
        signal: abortController.signal,
      })
        .then(async (response) => {
          const data = (await response.json()) as { options?: ConnectorOption[]; error?: string };
          if (!response.ok || data.error) {
            throw new Error(data.error || "Unable to load options.");
          }
          return data.options ?? [];
        })
        .then((options) => {
          window.clearTimeout(timeoutId);
          setOptionsBySource((current) => ({
            ...current,
            [source]: { options, isLoading: false },
          }));
        })
        .catch((error: unknown) => {
          window.clearTimeout(timeoutId);
          if (abortController.signal.aborted && !didTimeout) {
            if (requestedOptionSources.current[source] === key) {
              delete requestedOptionSources.current[source];
            }
            return;
          }
          setOptionsBySource((current) => ({
            ...current,
            [source]: {
              options: [],
              isLoading: false,
              error: didTimeout
                ? "Option loading timed out. Try again."
                : error instanceof Error
                  ? error.message
                  : "Unable to load options.",
            },
          }));
        });
    });

    return () => {
      requestKeys.forEach(({ source, key }) => {
        if (requestedOptionSources.current[source] === key) {
          delete requestedOptionSources.current[source];
        }
      });
      timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
      abortControllers.forEach((abortController) => abortController.abort());
    };
  }, [optionRequests]);

  const upsertRelation = (presetIndex: number, value: string) => {
    if (!onRelationsChange) return;
    const preset = relationPresets[presetIndex];
    if (!preset) return;
    const nextRelation = {
      sourceConnectorType: preset.sourceConnectorType,
      targetConnectorType: preset.targetConnectorType,
      settingsKey: preset.settingsKey,
      value,
    } as ConnectorRelationInput;
    const existingIndex = relations.findIndex(
      (relation) =>
        relation.sourceConnectorType === preset.sourceConnectorType &&
        relation.targetConnectorType === preset.targetConnectorType &&
        relation.settingsKey === preset.settingsKey
    );
    const nextRelations = [...relations];
    if (existingIndex >= 0) nextRelations[existingIndex] = nextRelation;
    else nextRelations.push(nextRelation);
    onRelationsChange(nextRelations);
  };

  if (schema.length === 0 && relationPresets.length === 0) return null;

  const updateField = (key: string, value: string | boolean | string[], fieldKind: ConnectorFieldKind) => {
    onChange({
      ...settingsWithDefaults,
      [key]: parseValue(fieldKind, value),
    });
  };

  const selectClassName =
    "flex h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsla(212,100%,48%,1)] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="flex flex-col gap-3">
      {schema.map((field) => {
        const value = settingsWithDefaults[field.key] ?? "";
        const id = `${type}-${kind}-${field.key}`;
        const shouldRenderOptions = Boolean(
          field.optionsSource && supportedOptionSources.has(field.optionsSource)
        );
        const optionState = field.optionsSource ? optionsBySource[field.optionsSource] : undefined;
        const fallbackOptions = field.optionsSource ? fallbackOptionsBySource[field.optionsSource] ?? [] : [];
        const fieldOptions = optionState?.options.length ? optionState.options : fallbackOptions;
        const isOptionsLoading = Boolean(optionState?.isLoading);

        return (
          <label key={field.key} htmlFor={id} className="flex flex-col gap-1 text-sm">
            <span className="font-medium">
              {field.label}
              {field.required ? " *" : ""}
            </span>
            {field.description && (
              <span className="text-xs text-muted-foreground">{field.description}</span>
            )}
            {field.kind === "boolean" ? (
              <Switch
                id={id}
                checked={Boolean(value)}
                onCheckedChange={(checked) => updateField(field.key, checked, field.kind)}
              />
            ) : field.kind === "select" && shouldRenderOptions ? (
              <>
                <select
                  id={id}
                  className={selectClassName}
                  value={stringifyValue(value)}
                  disabled={isOptionsLoading && fieldOptions.length === 0}
                  onChange={(event) => updateField(field.key, event.target.value, field.kind)}
                >
                  <option value="">
                    {isOptionsLoading
                      ? "Loading options..."
                      : optionState && fieldOptions.length === 0 && !optionState.error
                        ? "No options found"
                      : `Select ${field.label.toLowerCase()}`}
                  </option>
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {optionState?.error && (
                  <span className="text-xs text-amber-700">{optionState.error}</span>
                )}
              </>
            ) : field.kind === "multi-select" && shouldRenderOptions ? (
              <>
                <select
                  id={id}
                  multiple
                  className={`${selectClassName} h-auto min-h-24`}
                  value={Array.isArray(value) ? value.map(String) : stringifyValue(value).split(",").filter(Boolean)}
                  disabled={isOptionsLoading && fieldOptions.length === 0}
                  onChange={(event) =>
                    updateField(
                      field.key,
                      Array.from(event.target.selectedOptions).map((option) => option.value),
                      field.kind
                    )
                  }
                >
                  {fieldOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {isOptionsLoading && (
                  <span className="text-xs text-[#666666]">Loading options...</span>
                )}
                {optionState?.error && (
                  <span className="text-xs text-amber-700">{optionState.error}</span>
                )}
              </>
            ) : field.kind === "textarea" || field.kind === "json" ? (
              <textarea
                id={id}
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={stringifyValue(value)}
                placeholder={field.placeholder}
                onChange={(event) => updateField(field.key, event.target.value, field.kind)}
              />
            ) : (
              <Input
                id={id}
                type={field.secret ? "password" : "text"}
                value={stringifyValue(value)}
                placeholder={field.placeholder ?? field.optionsSource}
                onChange={(event) => updateField(field.key, event.target.value, field.kind)}
              />
            )}
          </label>
        );
      })}

      {relationPresets.length > 0 && (
        <div className="flex flex-col gap-2 rounded-md border border-dashed border-input p-3 text-sm">
          <span className="font-medium">Relation presets</span>
          <span className="text-xs text-muted-foreground">
            Choose how this app maps data to connected workflow steps. External API lookups are TODO-backed until credentials are available.
          </span>
          {relationPresets.map((preset, presetIndex) => {
            const relationValue = relations.find(
              (relation) =>
                relation.sourceConnectorType === preset.sourceConnectorType &&
                relation.targetConnectorType === preset.targetConnectorType &&
                relation.settingsKey === preset.settingsKey
            )?.value;
            const id = `${type}-relation-${preset.settingsKey}-${preset.targetConnectorType}`;

            return (
              <label key={`${preset.sourceConnectorType}-${preset.targetConnectorType}-${preset.settingsKey}`} htmlFor={id} className="flex flex-col gap-1">
                <span className="font-medium">
                  {preset.label}
                  {preset.required ? " *" : ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {preset.sourceConnectorType} → {preset.targetConnectorType}
                  {preset.description ? ` — ${preset.description}` : ""}
                </span>
                <Input
                  id={id}
                  value={stringifyValue(relationValue)}
                  placeholder={preset.settingsKey}
                  onChange={(event) => upsertRelation(presetIndex, event.target.value)}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConnectorSettingsFields;
