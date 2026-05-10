import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { guideSections } from "./_content";

export default function GuidePage() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-8">
      <header className="ds-page-header">
        <div>
          <p className="ds-eyebrow">Guide</p>
          <h1 className="ds-page-title mt-3">Automify Guide</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[#4d4d4d]">
            A compact reference for apps, connectors, workflows, usage, and publishing automation safely.
          </p>
        </div>
        <span className="ds-pill mt-1">
          <BookOpen className="h-3.5 w-3.5" /> Guide
        </span>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {guideSections.map((section) => (
          <Link
            key={section.title}
            href={`/guide/${section.slug}`}
            className="ds-card group p-6 transition hover:-translate-y-0.5 hover:shadow-[rgba(0,0,0,0.08)_0px_16px_32px]"
          >
            <section.icon className="h-6 w-6 text-[#171717]" strokeWidth={1.75} />
            <h2 className="ds-card-title mt-6">{section.title}</h2>
            <p className="mt-3 leading-6 text-[#4d4d4d]">{section.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#171717]">
              Read guide
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" strokeWidth={1.8} />
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}