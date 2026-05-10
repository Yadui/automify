import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { getGuideSection, guideSections } from "../_content";

type GuideDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return guideSections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const section = getGuideSection(slug);

  return {
    title: section ? `${section.title} Guide | Automify` : "Guide | Automify",
    description: section?.description,
  };
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const { slug } = await params;
  const section = getGuideSection(slug);

  if (!section) notFound();

  const Icon = section.icon;

  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <Link href="/guide" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#4d4d4d] transition hover:text-[#171717]">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
        Back to guide
      </Link>

      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Guide</p>
          <h1 className="ds-page-title mt-3">{section.title}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">{section.description}</p>
        </div>
        <span className="ds-pill mt-1">
          <Icon className="h-3.5 w-3.5" /> {section.title}
        </span>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="ds-card p-8">
          <p className="ds-eyebrow">Overview</p>
          <p className="mt-4 leading-7 text-[#4d4d4d]">{section.overview}</p>
        </article>

        <article className="ds-card p-8">
          <p className="ds-eyebrow">Quick Path</p>
          <ol className="mt-5 space-y-4">
            {section.steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm leading-6 text-[#4d4d4d]">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171717] text-xs font-medium text-white">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {section.details.map((detail) => (
          <article key={detail.title} className="ds-card p-6">
            <h2 className="text-base font-semibold text-[#171717]">{detail.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">{detail.body}</p>
          </article>
        ))}
      </section>

      {section.appCatalog && (
        <>
          <section className="flex flex-col gap-4">
            <div>
              <p className="ds-eyebrow">Available Apps</p>
              <h2 className="ds-card-title mt-3">Live app connections</h2>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {section.appCatalog.available.map((app) => (
                <article key={app.title} className="ds-card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#171717]">{app.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#4d4d4d]">{app.description}</p>
                    </div>
                    <span className="ds-pill">{app.role}</span>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Connectors</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {app.connectors.map((connector) => (
                        <span key={connector} className="rounded-md bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-[#171717] shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                          {connector}
                        </span>
                      ))}
                    </div>
                  </div>

                  {app.comingNextConnectors.length > 0 && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#737373]">Coming Next Connectors</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {app.comingNextConnectors.map((connector) => (
                          <span key={connector} className="rounded-md bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                            {connector}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 text-sm leading-6 text-[#4d4d4d] md:grid-cols-2">
                    <p>
                      <span className="font-medium text-[#171717]">Credential:</span> {app.credential}
                    </p>
                    <p>
                      <span className="font-medium text-[#171717]">Works with:</span>{" "}
                      {app.worksWith.length > 0 ? app.worksWith.join(", ") : "Standalone connector"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div>
              <p className="ds-eyebrow">Coming Next</p>
              <h2 className="ds-card-title mt-3">Planned app additions</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {section.appCatalog.comingNext.map((app) => (
                <article key={app.title} className="ds-card p-6">
                  <h3 className="text-base font-semibold text-[#171717]">{app.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">{app.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {app.connectors.map((connector) => (
                      <span key={connector} className="rounded-md bg-[#fafafa] px-3 py-1.5 text-xs font-medium text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
                        {connector}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="ds-card p-8">
        <p className="ds-eyebrow">Best Practices</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {section.bestPractices.map((practice) => (
            <p key={practice} className="flex gap-3 rounded-md bg-[#fafafa] p-4 text-sm leading-6 text-[#4d4d4d] shadow-[rgb(235,235,235)_0px_0px_0px_1px]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#171717]" strokeWidth={1.8} />
              {practice}
            </p>
          ))}
        </div>
      </section>

      <Link href={section.relatedHref} className="inline-flex w-fit items-center gap-2 rounded-md bg-[#171717] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d2d2d]">
        {section.relatedLabel}
        <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
      </Link>
    </div>
  );
}