import Navbar from "@/components/global/navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/global/footer";
import Pricing from "@/components/global/pricing";
import { Marquee } from "@/components/magicui/marquee";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/app-auth";
import {
  ArrowRight,
  Blocks,
  CirclePlus,
  ShieldCheck,
  Workflow,
} from "lucide-react";

const workflowSteps = [
  {
    label: "Develop",
    title: "Connect apps",
    description: "Authorize Google Drive, Notion, Slack, Discord, and workspace tools.",
    color: "#0a72ef",
  },
  {
    label: "Preview",
    title: "Map the flow",
    description: "Compose triggers, actions, and field mappings before publishing.",
    color: "#de1d8d",
  },
  {
    label: "Ship",
    title: "Run automations",
    description: "Publish production-ready workflows with clear billing and credit usage.",
    color: "#ff5b4f",
  },
];

const featureCards = [
  {
    icon: Workflow,
    title: "Workflow canvas",
    description: "Build multi-step automations with triggers, branches, and action nodes that stay easy to scan.",
  },
  {
    icon: Blocks,
    title: "Connector registry",
    description: "Keep OAuth apps, reusable settings, and app-specific fields organized in one place.",
  },
  {
    icon: ShieldCheck,
    title: "Operational controls",
    description: "Manage credits, subscriptions, and connection health from a quiet dashboard surface.",
  },
];

const integrations = [
  { name: "Google Drive", image: "/googleDrive.svg" },
  { name: "Notion", image: "/notion.png" },
  { name: "Slack", image: "/slack.png" },
  { name: "Discord", image: "/discord.png" },
  { name: "Gmail", image: "/gmailLogo.svg" },
  { name: "Google Calendar", image: "/googleCalendar.svg" },
  { name: "Trello", image: "/trello.svg" },
  { name: "GitHub", image: "/github.svg" },
];

export default async function Home() {
  const user = await getAppUser();
  if (user) redirect("/dashboard");
  return (
    <main className="min-h-screen bg-white text-[#171717]">
      <Navbar />
      <section className="mx-auto flex min-h-[calc(100svh-56px)] max-w-[1200px] flex-col items-center px-4 pb-16 pt-32 text-center sm:px-8">
        <span className="ds-pill mb-8">
          <CirclePlus className="h-3.5 w-3.5" /> Workflow infrastructure
        </span>
        <h1 className="ds-display max-w-4xl">Automify</h1>
        <p className="mt-6 max-w-2xl text-xl font-normal leading-9 text-[#4d4d4d]">
          Connect your apps, compose reliable automations, and ship repeatable workflows from one clean control surface.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/dashboard">
              Start building <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#product">View product</Link>
          </Button>
        </div>
        <div id="product" className="ds-card mt-16 w-full max-w-[1400px] overflow-hidden rounded-xl text-left lg:w-[82vw]">
          <div className="flex items-center justify-between px-4 py-3 shadow-[rgb(235,235,235)_0px_1px_0px_0px]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5b4f]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#de1d8d]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#0a72ef]" />
            </div>
            <span className="ds-eyebrow">Dashboard preview</span>
          </div>
          <div className="relative aspect-[16/8] w-full bg-[#fafafa]">
            <video
              src="/automify-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="Automify product demo"
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-[1200px] px-4 py-24 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ds-eyebrow">Pipeline</p>
          <h2 className="ds-section-title mt-4">Develop, preview, ship.</h2>
          <p className="mt-4 text-lg leading-7 text-[#4d4d4d]">
            The workflow colors are functional signals, reserved for the stages that take an automation from draft to production.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step, index) => (
            <article key={step.label} className="ds-card-soft relative p-8">
              {index < workflowSteps.length - 1 && (
                <div className="absolute left-[calc(100%-8px)] top-1/2 hidden h-px w-4 bg-[#ebebeb] md:block" />
              )}
              <p className="font-mono text-xs font-medium uppercase leading-none" style={{ color: step.color }}>
                {step.label}
              </p>
              <h3 className="ds-card-title mt-6">{step.title}</h3>
              <p className="mt-3 leading-6 text-[#4d4d4d]">{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-24 sm:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {featureCards.map((feature) => (
            <article key={feature.title} className="ds-card p-8">
              <feature.icon className="h-8 w-8 text-[#171717]" strokeWidth={1.75} />
              <h3 className="ds-card-title mt-8">{feature.title}</h3>
              <p className="mt-3 leading-6 text-[#4d4d4d]">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-8">
        <div className="ds-card-soft flex flex-col gap-8 p-8 md:flex-row md:items-center md:justify-between">
          <div className="md:max-w-sm md:shrink-0">
            <p className="ds-eyebrow">Connectors</p>
            <h2 className="mt-4 text-2xl font-semibold leading-8 tracking-[-0.96px] text-[#171717]">
              Start with the apps your team already uses.
            </h2>
          </div>
          <div className="relative w-full min-w-0 md:flex-1">
            <Marquee pauseOnHover className="[--duration:28s] [--gap:1rem]">
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  title={integration.name}
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white shadow-[rgb(235,235,235)_0px_0px_0px_1px]"
                >
                  <Image
                    src={integration.image}
                    alt={integration.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-white to-transparent" />
          </div>
        </div>
      </section>

      <section id="pricing">
        <Pricing />
      </section>
      <Footer />
    </main>
  );
}
