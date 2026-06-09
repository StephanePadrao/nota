"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { type ResumeData } from "@/data/resume";
import { defaultLang, localizeHref, useTranslations, type Lang } from "@/i18n/ui";
import { type ProjectItem } from "@/components/section/projects-section";

const BLUR_FADE_DELAY = 0.04;

// Timeline alternée à ligne centrale (zigzag) pour la colonne « créations » : ligne
// au milieu, projets en alternance gauche/droite dans l'ordre, vignettes compactes
// (~1/3 de la taille des cartes) pour gagner de l'espace.
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

        <ol className="relative flex flex-col gap-5 before:absolute before:left-1/2 before:top-0 before:bottom-0 before:w-px before:-translate-x-1/2 before:bg-border">
          {projects.map((project, id) => {
            const left = id % 2 === 0;
            return (
              <BlurFade key={project.id} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
                <li className="relative grid grid-cols-2 gap-x-5">
                  <span className="absolute left-1/2 top-2.5 size-2.5 -translate-x-1/2 rounded-full bg-primary ring-4 ring-background z-10" />
                  <a
                    href={localizeHref(`/projects/${project.id}`, locale)}
                    className={`group flex flex-col gap-1 ${left ? "col-start-1 items-end text-right" : "col-start-2 items-start text-left"}`}
                  >
                    <time className="text-[11px] font-semibold tabular-nums text-muted-foreground">{project.dates}</time>
                    {project.cover && (
                      <img
                        src={project.cover}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="w-24 aspect-[16/10] object-cover object-top rounded-lg border border-border shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md"
                      />
                    )}
                    <h3 className="text-xs font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                      {project.active && (
                        <span
                          className="ml-1 inline-block size-1.5 rounded-full bg-green-500 align-middle"
                          title={t.projects.active}
                        />
                      )}
                    </h3>
                  </a>
                </li>
              </BlurFade>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
