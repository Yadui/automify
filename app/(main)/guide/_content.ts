import type { LucideIcon } from "lucide-react";
import { AppWindow, Cable, CreditCard, Workflow } from "lucide-react";
import {
  ACTIVE_CONNECTION_TYPES,
  CONNECTOR_REGISTRY,
  type ConnectorDefinition,
} from "@/lib/connectors";

export type AppCatalogItem = {
  title: string;
  description: string;
  role: string;
  credential: string;
  connectors: string[];
  comingNextConnectors: string[];
  worksWith: string[];
};

export type PlannedApp = {
  title: string;
  description: string;
  connectors: string[];
};

export type GuideSection = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  overview: string;
  steps: string[];
  details: {
    title: string;
    body: string;
  }[];
  bestPractices: string[];
  relatedHref: string;
  relatedLabel: string;
  appCatalog?: {
    available: AppCatalogItem[];
    comingNext: PlannedApp[];
  };
};

const isPlannedCapability = (description: string) => description.includes("TODO:");

const getConnectorRole = (connector: ConnectorDefinition) => {
  const hasTriggers = connector.capabilities.triggers.length > 0;
  const hasActions = connector.capabilities.actions.some(
    (action) => !isPlannedCapability(action.description)
  );

  if (hasTriggers && hasActions) return "Trigger + action";
  if (hasTriggers) return "Trigger";
  return "Action";
};

const getCredentialLabel = (connector: ConnectorDefinition) => {
  if (connector.sharedCredentialType) {
    return `Uses ${connector.sharedCredentialType} credentials with extra scopes`;
  }

  if (connector.oauth) return "OAuth connection";

  return "API key or token connection";
};

const getAvailableConnectors = (connector: ConnectorDefinition) => [
  ...connector.capabilities.triggers.map((trigger) => `Trigger: ${trigger.label}`),
  ...connector.capabilities.actions
    .filter((action) => !isPlannedCapability(action.description))
    .map((action) => `Action: ${action.label}`),
];

const getPlannedConnectors = (connector: ConnectorDefinition) =>
  connector.capabilities.actions
    .filter((action) => isPlannedCapability(action.description))
    .map((action) => `Action: ${action.label}`);

const availableApps = ACTIVE_CONNECTION_TYPES.map((type) => {
  const connector = CONNECTOR_REGISTRY[type];
  const worksWith = Array.from(
    new Set([...connector.relations.canSource, ...connector.relations.canTarget])
  );

  return {
    title: connector.title,
    description: connector.description,
    role: getConnectorRole(connector),
    credential: getCredentialLabel(connector),
    connectors: getAvailableConnectors(connector),
    comingNextConnectors: getPlannedConnectors(connector),
    worksWith,
  };
});

const comingNextApps: PlannedApp[] = [
  {
    title: "Airtable",
    description: "Record-based triggers and actions for teams that run lightweight operations databases.",
    connectors: ["Trigger: Record created", "Action: Create or update record"],
  },
  {
    title: "Linear",
    description: "Issue workflow automation for engineering teams that plan work in Linear.",
    connectors: ["Trigger: Issue changed", "Action: Create issue"],
  },
  {
    title: "Microsoft Teams",
    description: "Channel notifications and approval handoffs for Microsoft workspace teams.",
    connectors: ["Action: Send channel message", "Action: Post approval update"],
  },
  {
    title: "Razorpay",
    description: "Payment and subscription events for automations around billing, support, and reporting.",
    connectors: ["Trigger: Payment captured", "Trigger: Subscription changed"],
  },
];

export const guideSections: GuideSection[] = [
  {
    slug: "apps",
    title: "Apps",
    description: "See available apps, planned apps, and the connectors each app exposes.",
    icon: AppWindow,
    overview:
      "Apps are the services Automify can connect to workflows. Each available app exposes one or more connectors, such as triggers that start workflows or actions that run after a workflow begins. Planned apps are listed separately so users can see what is coming next without mistaking them for live connections.",
    steps: [
      "Start with Available Apps to confirm the service is live in Automify.",
      "Review the connectors listed under each app to see whether it can trigger workflows, perform actions, or both.",
      "Use Works With to find supported app-to-app workflow pairings.",
      "Check Coming Next for planned apps that are not available as live connections yet.",
    ],
    details: [
      {
        title: "Available Apps",
        body: "Live apps are pulled from the same connector registry used by the Connections page.",
      },
      {
        title: "Coming Next",
        body: "Planned apps are shown as roadmap items and are not active connection cards yet.",
      },
      {
        title: "Connectors",
        body: "Each app can expose triggers, actions, or both. Some action connectors are marked as coming next when the app exists but the operation still needs provider wiring.",
      },
    ],
    bestPractices: [
      "Use apps marked available for live workflow setup.",
      "Pair apps only through the supported Works With relationships.",
      "Treat coming-next apps and connectors as roadmap items until they appear on Connections.",
    ],
    relatedHref: "/connections",
    relatedLabel: "Open connections",
    appCatalog: {
      available: availableApps,
      comingNext: comingNextApps,
    },
  },
  {
    slug: "connect-apps",
    title: "Connect Apps",
    description: "Authorize providers, confirm connector status, and prepare apps for workflow actions.",
    icon: Cable,
    overview:
      "Connections are the provider accounts Automify can use inside workflows. Each connected app should be authorized by the right workspace owner, checked after authorization, and reconnected any time provider permissions change.",
    steps: [
      "Open Connections from the sidebar.",
      "Choose the provider you want to use in a workflow.",
      "Complete authorization and grant only the scopes needed for the automation.",
      "Return to Automify and confirm the connector shows as available before building with it.",
    ],
    details: [
      {
        title: "Provider Ownership",
        body: "Connect apps with the account that owns the data, channel, repository, calendar, or workspace the automation needs.",
      },
      {
        title: "Connector Status",
        body: "A connection should be considered ready only after Automify can confirm the provider returned a valid authorization response.",
      },
      {
        title: "Reauthorization",
        body: "If a provider password, policy, or permission set changes, reconnect the app before relying on it in live workflows.",
      },
    ],
    bestPractices: [
      "Use separate provider accounts for testing and production data when possible.",
      "Review granted scopes in the provider dashboard after connecting.",
      "Remove stale connections when a workflow is retired.",
    ],
    relatedHref: "/connections",
    relatedLabel: "Open connections",
  },
  {
    slug: "build-workflows",
    title: "Build Workflows",
    description: "Create trigger and action flows, configure fields, and publish when ready.",
    icon: Workflow,
    overview:
      "Workflows describe what should happen when a trigger fires. A good workflow starts with a clear event, uses connected apps that are already authorized, and keeps each action small enough to debug when something changes.",
    steps: [
      "Open Workflows and create a new workflow.",
      "Choose the trigger that starts the automation.",
      "Add action nodes, map required fields, and review each provider setting.",
      "Save the workflow, test the path with sample data, then publish it when the behavior is correct.",
    ],
    details: [
      {
        title: "Triggers",
        body: "A trigger is the event Automify watches for, such as a new file, form submission, message, issue, or database change.",
      },
      {
        title: "Actions",
        body: "Actions are the operations Automify performs after the trigger, like sending a message, creating a record, or updating a connected app.",
      },
      {
        title: "Field Mapping",
        body: "Map fields deliberately so the right trigger data reaches each action without relying on placeholder values.",
      },
    ],
    bestPractices: [
      "Keep the first version of a workflow small and easy to inspect.",
      "Name workflows by outcome, not just by provider.",
      "Test with realistic data before publishing high-impact automations.",
    ],
    relatedHref: "/workflows",
    relatedLabel: "Open workflows",
  },
  {
    slug: "review-usage",
    title: "Review Usage",
    description: "Track credits, plan limits, and billing state before running high-volume automation.",
    icon: CreditCard,
    overview:
      "Usage review keeps automations predictable. Credits and plan limits help you decide when to publish workflows, when to pause high-volume activity, and when a workspace should move to a larger tier.",
    steps: [
      "Open Billing from the sidebar.",
      "Check the current tier and remaining credits.",
      "Estimate how often active workflows will run before publishing new ones.",
      "Upgrade or reduce automation volume when expected usage is higher than the current plan allows.",
    ],
    details: [
      {
        title: "Credits",
        body: "Credits represent the available automation allowance for the workspace and should be checked before publishing frequent workflows.",
      },
      {
        title: "Plan Fit",
        body: "The right tier depends on workflow volume, provider activity, and how many team processes rely on Automify.",
      },
      {
        title: "Operational Review",
        body: "Before a busy launch or campaign, review active workflows so billing and automation behavior remain intentional.",
      },
    ],
    bestPractices: [
      "Review credits after creating or publishing several workflows.",
      "Pause test workflows that are no longer being used.",
      "Upgrade before a known spike instead of waiting for automation to stop.",
    ],
    relatedHref: "/billing",
    relatedLabel: "Open billing",
  },
];

export const getGuideSection = (slug: string) =>
  guideSections.find((section) => section.slug === slug);