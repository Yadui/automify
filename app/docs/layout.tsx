import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BackToTop from "@/components/back-to-top";

const docsNavItems = [
  {
    title: "Getting Started",
    items: [
      { href: "/docs", label: "Introduction" },
      { href: "/docs/quickstart", label: "Quick Start Guide" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { href: "/docs/integrations", label: "Overview" },
      { href: "/docs/integrations/google", label: "Google (Gmail & Drive)" },
      { href: "/docs/integrations/discord", label: "Discord" },
      { href: "/docs/integrations/notion", label: "Notion" },
      { href: "/docs/integrations/slack", label: "Slack" },
    ],
  },
  {
    title: "Nodes",
    items: [
      { href: "/docs/nodes", label: "Overview" },
      { href: "/docs/nodes/triggers", label: "Triggers" },
      { href: "/docs/nodes/actions", label: "Actions" },
      { href: "/docs/nodes/logic", label: "Logic & Utilities" },
    ],
  },
  {
    title: "Workflows",
    items: [
      { href: "/docs/workflows", label: "Creating Workflows" },
      { href: "/docs/workflows/examples", label: "Example Workflows" },
      { href: "/docs/workflows/variables", label: "Using Variables" },
    ],
  },
  {
    title: "Reference",
    items: [
      { href: "/docs/navigation", label: "Site Navigation" },
      { href: "/docs/faq", label: "FAQ" },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-8">
              <Link href="/docs" className="flex items-center gap-2 mb-6">
                <img src="/favicon.ico" alt="Automify" className="w-6 h-6" />
                <span className="font-bold text-lg">Docs</span>
              </Link>

              <nav className="space-y-6">
                {docsNavItems.map((section) => (
                  <div key={section.title}>
                    <h4 className="font-semibold text-sm text-foreground mb-2">
                      {section.title}
                    </h4>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 pl-2 border-l border-border hover:border-primary"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>

              <div className="border-t border-border mt-8 pt-6 space-y-2">
                <Link
                  href="/privacy"
                  className="block text-xs text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block text-xs text-muted-foreground hover:text-foreground"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-3xl">{children}</main>
        </div>
      </div>
      <BackToTop />
    </div>
  );
}
