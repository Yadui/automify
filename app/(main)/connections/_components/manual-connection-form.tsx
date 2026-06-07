// app/(main)/connections/_components/manual-connection-form.tsx
import React from "react";
import {
  getConnector,
  getConnectorSettingsSchema,
  type ConnectorType,
} from "@/lib/connectors";
import { saveManualConnection } from "../_actions/manual-connection";
import ConnectorLogo from "@/components/global/connector-logo";
import { PatGuide } from "./pat-guide";

type Props = {
  type: ConnectorType;
  returnTo?: string;
  /** If true, renders "Update connection" copy and relaxes required validation hint */
  isUpdate?: boolean;
  /** Validation/save error returned via query param */
  errorCode?: string;
};

const fieldErrorMessages: Record<string, string> = {
  missing_accessToken: "Personal access token is required.",
  missing_apiKey: "API key is required.",
  missing_token: "Token is required.",
};

const friendlyError = (code: string) =>
  fieldErrorMessages[code] ??
  code.replace(/_/g, " ").replace(/^missing /, "Missing: ");

export function ManualConnectionForm({ type, returnTo, isUpdate, errorCode }: Props) {
  const connector = getConnector(type);
  const schema = getConnectorSettingsSchema(type, "connection");

  if (schema.length === 0) return null;

  const inputBase =
    "h-10 w-full rounded-md bg-white px-3 py-2 text-sm text-[#171717] " +
    "shadow-[rgb(235,235,235)_0px_0px_0px_1px] outline-none " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[hsla(212,100%,48%,1)] " +
    "disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-[#999]";

  return (
    <div className="rounded-xl border border-[#ebebeb] bg-[#fafafa] p-6 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
          <ConnectorLogo type={type} title={connector.title} size={24} />
        </div>
        <div>
          <p className="ds-eyebrow">Manual connection</p>
          <h2 className="mt-0.5 text-base font-semibold tracking-[-0.24px] text-[#171717]">
            {isUpdate ? "Update" : "Connect"} {connector.title}
          </h2>
        </div>
      </div>

      {/* Error banner */}
      {errorCode && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {friendlyError(errorCode)}
        </div>
      )}

      <form action={saveManualConnection} className="flex flex-col gap-4">
        <input type="hidden" name="type" value={type} />
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}

        {schema.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor={`mcf-${field.key}`}
                className="text-sm font-medium text-[#171717]"
              >
                {field.label}
                {field.required ? (
                  <span className="ml-0.5 text-red-500"> *</span>
                ) : (
                  <span className="ml-1 text-xs font-normal text-[#666666]">
                    (optional)
                  </span>
                )}
              </label>
              {/* Show PAT guide icon only on the token field for GitHub */}
              {type === "GitHub" && field.key === "accessToken" && (
                <PatGuide />
              )}
            </div>

            {field.description && (
              <p className="text-xs leading-snug text-[#666666]">
                {field.description}
              </p>
            )}

            <input
              id={`mcf-${field.key}`}
              name={field.key}
              type={
                field.kind === "password" || field.secret ? "password" : "text"
              }
              autoComplete={
                field.kind === "password" || field.secret
                  ? "new-password"
                  : "off"
              }
              placeholder={
                isUpdate && (field.secret || field.kind === "password")
                  ? "Leave blank to keep existing token"
                  : (field.placeholder ?? `Enter ${field.label.toLowerCase()}`)
              }
              className={inputBase}
            />
          </div>
        ))}

        <button
          type="submit"
          className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-[#171717] px-5 text-sm font-medium text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#171717]"
        >
          {isUpdate ? "Update connection" : "Save connection"}
        </button>
      </form>
    </div>
  );
}
