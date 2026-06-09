"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { type ResumeData } from "@/data/resume";
import { defaultLang, localizeHref, type Lang } from "@/i18n/ui";
import { type ProjectItem } from "@/components/section/projects-section";

const BLUR_FADE_DELAY = 0.04;

// Timeline empilée (spine à gauche), une ligne par projet : photo à gauche +
// date/titre à droite. Toute la largeur est utilisée (pas de blanc comme en
// alterné), photos ~220px, ordre chronologique décroissant.
export default function ProjectsTimeline({
  projects = [],
  data,
  locale = defaultLang,
}: {
  projects?: ProjectItem[];
  data: ResumeData;
  locale?: Lang;
}) {
  return (
    <section id="projects">
      <div className="flex min-h-0 flex-col gap-y-6">
        <h2 className="text-xl font-bold">{data.sections.projects.heading}</h2>

        <ol className="relative flex flex-col gap-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {projects.map((project, id) => (
            <BlurFade key={project.id} delay={BLUR_FADE_DELAY * 12 + id * 0.05}>
              <li className="relative pl-8">
                <span className="absolute left-0 top-3 size-3.5 rounded-full border-2 border-background bg-primary ring-1 ring-border" />
                <a
                  href={localizeHref(`/projects/${project.id}`, locale)}
                  className="group flex items-center gap-3 rounded-xl p-1.5 -m-1.5 hover:bg-accent/40 transition-colors"
                >
                  {project.cover && (
                    <img
                      src={project.cover}
                      alt={project.title}
                      loading="lazy"
                      decoding="async"
                      className="w-[220px] max-w-[45%] aspect-[16/10] object-cover object-top rounded-lg border border-border shadow-sm shrink-0 transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md"
                    />
                  )}
                  <div className="min-w-0">
                    <time className="text-[11px] font-semibold tabular-nums text-muted-foreground">{project.dates}</time>
                    <h3 className="mt-0.5 text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </a>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}
