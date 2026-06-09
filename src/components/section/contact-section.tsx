import { FlickeringGrid } from "@/components/magicui/flickering-grid";
import { type ResumeData } from "@/data/resume";
import { defaultLang, localizeHref, type Lang } from "@/i18n/ui";
import { ArrowUpRight } from "@/lib/icons";

export default function ContactSection({ data, locale = defaultLang }: { data: ResumeData; locale?: Lang }) {
  const DATA = data;
  return (
    <div className="border rounded-xl p-10 relative">
      <div className="absolute -top-4 border bg-primary z-10 rounded-xl px-4 py-1 left-1/2 -translate-x-1/2">
        <span className="text-background text-sm font-medium">{DATA.sections.contact.label}</span>
      </div>
      <div className="absolute inset-0 top-0 left-0 right-0 h-1/2 rounded-xl overflow-hidden">
        <FlickeringGrid
          className="h-full w-full"
          squareSize={2}
          gridGap={2}
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
          {DATA.sections.contact.heading}
        </h2>
        <p className="mx-auto max-w-lg text-muted-foreground text-balance">
          {DATA.sections.contact.text}
        </p>
        <a
          href={localizeHref("/contact", locale)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5
                     text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {DATA.sections.contact.cta}
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
