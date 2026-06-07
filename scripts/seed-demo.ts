/**
 * Demo seed: creates a local-auth demo user and two pre-wired workflows
 * (a simple Google Drive -> Notion flow and a more complex branching flow)
 * so the Playwright demo script can open fully-built canvases and drive
 * Save / Run / Publish without having to script React Flow drag-and-drop.
 *
 * Run it where DATABASE_URL is reachable:
 *   set -a && source .env.local && set +a && npx tsx scripts/seed-demo.ts
 *
 * Idempotent: re-running upserts the same demo user + workflows.
 */
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Must match lib/local-auth.ts -> localAppIdForEmail()
const DEMO_EMAIL = "demo@automify.dev";
const DEMO_APP_ID = `local:${DEMO_EMAIL}`;
const DEMO_NAME = "Demo User";

const SIMPLE_WORKFLOW_ID = "demo-simple-drive-notion";
const COMPLEX_WORKFLOW_ID = "demo-complex-triage";

type NodeData = {
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  metadata: Record<string, unknown>;
  type: string;
};

type FlowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: NodeData;
};

type FlowEdge = { id: string; source: string; target: string };

// Node titles must match keys in lib/constant.ts EditorCanvasDefaultCardTypes.
const DESCRIPTIONS: Record<string, string> = {
  "Google Drive":
    "Connect with Google drive to trigger actions or to create files and folders.",
  Notion: "Create entries directly in notion.",
  Condition: "Boolean operator that creates different conditions lanes.",
  Slack: "Send a notification to slack",
  Email: "Send an email to a user",
  Wait: "Delay the next action step by using the wait timer.",
};

const node = (
  type: string,
  position: { x: number; y: number },
  metadata: Record<string, unknown> = {},
): FlowNode => ({
  id: randomUUID(),
  type,
  position,
  data: {
    title: type,
    description: DESCRIPTIONS[type] ?? "",
    completed: false,
    current: false,
    metadata,
    type,
  },
});

const edge = (source: FlowNode, target: FlowNode): FlowEdge => ({
  id: `${source.id}-${target.id}`,
  source: source.id,
  target: target.id,
});

// ---- Simple flow: Drive new file -> Notion entry ----
function buildSimpleFlow() {
  const trigger = node("Google Drive", { x: 120, y: 200 }, { event: "new_file" });
  const notion = node(
    "Notion",
    { x: 520, y: 200 },
    { content: "New file detected in Google Drive" },
  );
  return {
    nodes: [trigger, notion],
    edges: [edge(trigger, notion)],
  };
}

// ---- Complex flow: Drive trigger -> Condition -> Slack + Notion, then Wait -> Email ----
function buildComplexFlow() {
  const trigger = node("Google Drive", { x: 80, y: 260 }, { event: "new_file" });
  const condition = node(
    "Condition",
    { x: 420, y: 260 },
    {
      rootLogic: "AND",
      conditions: [
        { id: randomUUID(), field: "{{trigger.name}}", operator: "contains", value: ".pdf" },
      ],
    },
  );
  const slack = node(
    "Slack",
    { x: 800, y: 120 },
    { message: "New PDF uploaded to Drive: {{trigger.name}}" },
  );
  const notion = node(
    "Notion",
    { x: 800, y: 320 },
    { content: "Logged new PDF: {{trigger.name}}" },
  );
  const wait = node("Wait", { x: 1140, y: 320 }, { mode: "duration", value: "1", unit: "minutes" });
  const email = node(
    "Email",
    { x: 1480, y: 320 },
    {
      to: "team@automify.dev",
      subject: "New file processed",
      message: "A new file ({{trigger.name}}) was triaged by Automify.",
    },
  );

  return {
    nodes: [trigger, condition, slack, notion, wait, email],
    edges: [
      edge(trigger, condition),
      edge(condition, slack),
      edge(condition, notion),
      edge(notion, wait),
      edge(wait, email),
    ],
  };
}

async function upsertWorkflow(
  id: string,
  name: string,
  description: string,
  flow: { nodes: FlowNode[]; edges: FlowEdge[] },
) {
  const data = {
    name,
    description,
    nodes: JSON.stringify(flow.nodes),
    edges: JSON.stringify(flow.edges),
    publish: false,
    userId: DEMO_APP_ID,
  };
  await prisma.workflows.upsert({
    where: { id },
    update: data,
    create: { id, ...data },
  });
  console.log(`  ✓ ${name} (${id}) — ${flow.nodes.length} nodes, ${flow.edges.length} edges`);
}

async function main() {
  console.log("Seeding demo data...");

  await prisma.user.upsert({
    where: { appId: DEMO_APP_ID },
    update: { email: DEMO_EMAIL, name: DEMO_NAME },
    create: {
      appId: DEMO_APP_ID,
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      tier: "Free",
      credits: "100",
    },
  });
  console.log(`  ✓ user ${DEMO_EMAIL} (${DEMO_APP_ID})`);

  await upsertWorkflow(
    SIMPLE_WORKFLOW_ID,
    "Drive → Notion (Simple)",
    "When a new file lands in Google Drive, create a Notion entry.",
    buildSimpleFlow(),
  );

  await upsertWorkflow(
    COMPLEX_WORKFLOW_ID,
    "New File → Triage (Complex)",
    "Branch on file type, notify Slack + Notion, then wait and email the team.",
    buildComplexFlow(),
  );

  console.log("Done. Log in as", DEMO_EMAIL, "(any 4+ char password).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
