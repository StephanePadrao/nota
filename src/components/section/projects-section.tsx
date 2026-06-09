"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { ProjectCard } from "@/components/project-card";
import { type ResumeData } from "@/data/resume";
import { defaultLang, localizeHref, type Lang } from "@/i18n/ui";
import { Icons } from "@/components/icons";
import type { ReactNode } from "react";

const BLUR_FADE_DELAY = 0.04;

export interface ProjectItem {
  id: string;
  title: string;
  dates: string;
  active?: boolean;
  description: string;
  technologies: string[];
  links?: { type: string; href: string }[];
  cover?: string;
}

function linkIcon(type: string): ReactNode {
  const t = type.toLowerCase();
  if (t === "github" || t === "code") return <Icons.github className="size-3" />;
  return <Icons.globe className="size-3" />;
}

export default function ProjectsSection({
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 auto-rows-fr">
          {projects.map((project, id) => (
            <BlurFade key={project.id} delay={BLUR_FADE_DELAY * 12 + id * 0.05} className="h-full">
              <ProjectCard
                href={localizeHref(`/projects/${project.id}`, locale)}
                title={project.title}
                description={project.description}
                dates={project.dates}
                tags={project.technologies}
                image={project.cover}
                links={project.links?.map((l) => ({
                  icon: linkIcon(l.type),
                  type: l.type,
                  href: l.href,
                }))}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}
