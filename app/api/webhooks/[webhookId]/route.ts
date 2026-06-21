import { NextResponse } from "next/server";
import db from "@/lib/db";

// Receives inbound HTTP requests for Webhook Trigger nodes.
// Matches the webhookId saved in the node metadata, validates the secret
// (if requireSecret is set), saves the payload to the workflow's nodes so
// variables resolve, then marks the workflow as triggered.
//
// URL: /api/webhooks/[webhookId]
// Methods: POST (always), GET (if node config allows it)

async function handleWebhook(
  request: Request,
  webhookId: string,
): Promise<Response> {
  // Find published workflows whose nodes contain this webhookId
  const workflows = await db.workflows.findMany({
    where: { publish: true },
  });

  const matchingWorkflows = workflows.filter((wf) => {
    if (!wf.nodes) return false;
    try {
      const nodes: any[] = JSON.parse(wf.nodes);
      return nodes.some(
        (n) =>
          (n.data?.type === "Webhook" || n.data?.type === "Custom Webhook") &&
          n.data?.metadata?.webhookId === webhookId,
      );
    } catch {
      return false;
    }
  });

  if (matchingWorkflows.length === 0) {
    return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
  }

  // Parse incoming payload
  const url = new URL(request.url);
  const query: Record<string, string> = {};
  url.searchParams.forEach((v, k) => { query[k] = v; });

  const incomingHeaders: Record<string, string> = {};
  request.headers.forEach((v, k) => { incomingHeaders[k] = v; });

  let body: any = null;
  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await request.text();
      body = Object.fromEntries(new URLSearchParams(text));
    } else {
      body = await request.text();
    }
  } catch {
    body = null;
  }

  const receivedPayload = {
    method: request.method,
    headers: incomingHeaders,
    query,
    body,
    receivedAt: new Date().toISOString(),
  };

  // For each matching workflow, validate secret and inject payload into the trigger node
  for (const wf of matchingWorkflows) {
    try {
      const nodes: any[] = JSON.parse(wf.nodes || "[]");
      const triggerNode = nodes.find(
        (n) =>
          (n.data?.type === "Webhook" || n.data?.type === "Custom Webhook") &&
          n.data?.metadata?.webhookId === webhookId,
      );

      if (!triggerNode) continue;

      const meta = triggerNode.data?.metadata || {};

      // Validate secret if required
      if (meta.requireSecret && meta.secret) {
        const providedSecret =
          incomingHeaders["x-webhook-secret"] || query["token"];
        if (providedSecret !== meta.secret) {
          console.warn(`[webhook] Secret mismatch for ${webhookId}`);
          continue; // skip this workflow — don't expose secret mismatch to caller
        }
      }

      // Inject the received payload as sampleData so downstream nodes can
      // reference {{nodeId.body}}, {{nodeId.headers}}, etc.
      const updatedNodes = nodes.map((n) =>
        n.id === triggerNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                metadata: {
                  ...n.data.metadata,
                  sampleData: receivedPayload,
                },
              },
            }
          : n,
      );

      // Persist the updated node sampleData so the next manual/scheduled run
      // picks up the real payload
      await db.workflows.update({
        where: { id: wf.id },
        data: { nodes: JSON.stringify(updatedNodes) },
      });

      // Log the webhook trigger
      await db.workflowLog.create({
        data: {
          workflowId: wf.id,
          userId: wf.userId,
          status: "triggered",
          message: `Webhook ${webhookId} received — ${request.method} from ${incomingHeaders["x-forwarded-for"] || "unknown"}`,
          results: [receivedPayload],
        },
      });
    } catch (err) {
      console.error(`[webhook] Error processing workflow ${wf.id}:`, err);
    }
  }

  return NextResponse.json({ received: true, timestamp: new Date().toISOString() });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  const { webhookId } = await params;
  return handleWebhook(request, webhookId);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  const { webhookId } = await params;
  return handleWebhook(request, webhookId);
}
