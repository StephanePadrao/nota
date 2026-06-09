"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { type ResumeData } from "@/data/resume";
import { defaultLang, localizeHref, useTranslations, type Lang } from "@/i18n/ui";
import { type ProjectItem } from "@/components/section/projects-section";

const BLUR_FADE_DELAY = 0.04;

// Variante timeline photo-first de la colonne « créations » (home, colonne droite).
// Plus récent en haut ; date + couverture + titre, sans description ni tags.
export default function ProjectsTimeline({
  projects = [],
  data,
  locale = defaultLang,
}: {
  projects?: ProjectItem[];
  data: ResumeData;
  locale?: Lang;
}) {
  const t = useTranslations(locale);

  return (
    <section id="projects">
      <div className="flex min-h-0 flex-col gap-y-6">
        <h2 className="text-xl font-bold">{data.sections.projects.heading}</h2>

        <ol className="relative flex flex-col gap-8 before:absolute before:left-[7px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-border">
          {projects.map((project, id) => (
            <BlurFade key={project.id} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
              <li className="relative pl-8">
                <span className="absolute left-0 top-1.5 size-3.5 rounded-full border-2 border-background bg-primary ring-1 ring-border" />
                <a href={localizeHref(`/projects/${project.id}`, locale)} className="group block">
                  <div className="flex items-center gap-2">
                    <time className="text-xs font-semibold tabular-nums text-muted-foreground">{project.dates}</time>
                    {project.active && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        {t.projects.active}
                      </span>
                    )}
                  </div>
                  {project.cover && (
                    <img
                      src={project.cover}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="mt-2 w-full aspect-[16/10] object-cover object-top rounded-xl border border-border shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/40"
                    />
                  )}
                  <h3 className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                </a>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}
