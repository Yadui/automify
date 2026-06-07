"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getAppUser } from "@/lib/app-auth";
import {
  connectorTypeSchema,
  getConnector,
  getConnectorSettingsSchema,
  validateConnectorSettings,
  type ConnectorSettingsInput,
  type ConnectorType,
} from "@/lib/connectors";
import { appendOAuthResult, getSafeReturnPath } from "@/lib/oauth-redirect";

const getStringValue = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const getManualConnectionRedirect = (
  type: ConnectorType,
  result: Record<string, string>,
  returnTo?: string
) => {
  const safeReturnTo = getSafeReturnPath(returnTo, "/connections");
  if (safeReturnTo !== "/connections" && result.connectionSaved) {
    return appendOAuthResult(safeReturnTo, { connectionStatus: "manual_success" });
  }

  const params = new URLSearchParams({ manualConnector: type, ...result });
  if (safeReturnTo !== "/connections") params.set("returnTo", safeReturnTo);
  return `/connections?${params.toString()}`;
};

export const saveManualConnection = async (formData: FormData) => {
  const parsedType = connectorTypeSchema.safeParse(getStringValue(formData, "type"));
  const returnTo = getStringValue(formData, "returnTo");

  if (!parsedType.success) {
    redirect("/connections?connectionError=invalid_connector");
  }

  const type = parsedType.data;
  const connector = getConnector(type);

  if (connector.oauth) {
    redirect(`/api/auth/connect?${new URLSearchParams({ type, returnTo: returnTo || "/connections" }).toString()}`);
  }

  const user = await getAppUser();
  if (!user) {
    redirect("/sign-in");
  }

  const existingConnection = await db.connections.findUnique({
    where: { userId_type: { userId: user.id, type } },
    select: { settings: true },
  });
  const existingSettings = (existingConnection?.settings ?? {}) as ConnectorSettingsInput;
  const settings = getConnectorSettingsSchema(type, "connection").reduce<ConnectorSettingsInput>(
    (acc, field) => {
      if (field.kind === "boolean") {
        acc[field.key] = formData.get(field.key) === "on";
        return acc;
      }

      if (field.kind === "multi-select") {
        const values = formData
          .getAll(field.key)
          .flatMap((value) => (typeof value === "string" ? [value.trim()] : []))
          .filter(Boolean);
        if (values.length > 0) acc[field.key] = values;
        return acc;
      }

      const value = getStringValue(formData, field.key);
      if (value) {
        acc[field.key] = value;
      } else if (field.secret && existingSettings[field.key]) {
        acc[field.key] = existingSettings[field.key];
      } else if (field.required && existingSettings[field.key]) {
        acc[field.key] = existingSettings[field.key];
      }

      return acc;
    },
    {}
  );

  const validation = validateConnectorSettings(type, "connection", settings);
  if (!validation.valid) {
    redirect(
      getManualConnectionRedirect(
        type,
        { connectionError: `missing_${validation.missingRequired.join("_")}` },
        returnTo
      )
    );
  }

  await db.connections.upsert({
    where: { userId_type: { userId: user.id, type } },
    create: {
      userId: user.id,
      type,
      settings: settings as Prisma.InputJsonObject,
    },
    update: {
      settings: settings as Prisma.InputJsonObject,
    },
  });

  revalidatePath("/connections");
  revalidatePath("/workflows");
  redirect(getManualConnectionRedirect(type, { connectionSaved: type }, returnTo));
};