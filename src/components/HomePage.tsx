import React from "react";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Markdown from "react-markdown";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection, { type ProjectItem } from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import { ArrowUpRight } from "@/lib/icons";

const BLUR_FADE_DELAY = 0.04;

const sectionComponents: Record<string, React.ReactNode> = {
  about: (
    <section id="about">
      <div className="flex min-h-0 flex-col gap-y-4">
        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <h2 className="text-xl font-bold">{DATA.sections.about.heading}</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 4}>
          <div className="prose max-w-full text-pretty font-sans leading-relaxed text-muted-foreground dark:prose-invert">
            <Markdown>{DATA.summary}</Markdown>
          </div>
        </BlurFade>
      </div>
    </section>
  ),
  work: (
    <section id="work">
      <div className="flex min-h-0 flex-col gap-y-6">
        <BlurFade delay={BLUR_FADE_DELAY * 5}>
          <h2 className="text-xl font-bold">{DATA.sections.work.heading}</h2>
        </BlurFade>
        <BlurFade delay={BLUR_FADE_DELAY * 6}>
          <WorkSection />
        </BlurFade>
      </div>
    </section>
  ),
  education: (
    <section id="education">
      <div className="flex min-h-0 flex-col gap-y-6">
        <BlurFade delay={BLUR_FADE_DELAY * 7}>
          <h2 className="text-xl font-bold">{DATA.sections.education.heading}</h2>
        </BlurFade>
        <div className="flex flex-col gap-8">
          {DATA.education.map((education, index) => (
            <BlurFade key={education.school} delay={BLUR_FADE_DELAY * 8 + index * 0.05}>
              <a
                href={education.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-x-3 justify-between group"
              >
                <div className="flex items-center gap-x-3 flex-1 min-w-0">
                  {education.logoUrl ? (
                    <img
                      src={education.logoUrl}
                      alt={education.school}
                      className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border overflow-hidden object-contain flex-none"
                      loading="lazy"
                      decoding="async"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <div className="size-8 md:size-10 p-1 border rounded-full shadow ring-2 ring-border bg-muted flex-none" />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="font-semibold leading-none flex items-center gap-2">
                      {education.school}
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                    </div>
                    <div className="font-sans text-sm text-muted-foreground">{education.degree}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
                  <span>{education.start} - {education.end}</span>
                </div>
              </a>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  ),
  certifications: DATA.certifications.length > 0 ? (
    <section id="certifications">
      <div className="flex min-h-0 flex-col gap-y-6">
        <BlurFade delay={BLUR_FADE_DELAY * 7}>
          <h2 className="text-xl font-bold">{DATA.sections.certifications.heading}</h2>
        </BlurFade>
        <div className="flex flex-col gap-4">
          {DATA.certifications.map((cert, index) => {
            const inner = (
              <div className="flex items-center gap-x-3 justify-between group">
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <div className="font-semibold leading-none flex items-center gap-2">
                    {cert.name}
                    {cert.href && (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden />
                    )}
                  </div>
                  {cert.issuer && (
                    <div className="font-sans text-sm text-muted-foreground">{cert.issuer}</div>
                  )}
                </div>
                {cert.date && (
                  <div className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground text-right flex-none">
                    <span>{cert.date}</span>
                  </div>
                )}
              </div>
            );
            return (
              <BlurFade key={cert.name} delay={BLUR_FADE_DELAY * 8 + index * 0.05}>
                {cert.href ? (
                  <a href={cert.href} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  ) : null,
  skills: (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-4">
        <BlurFade delay={BLUR_FADE_DELAY * 9}>
          <h2 className="text-xl font-bold">{DATA.sections.skills.heading}</h2>
        </BlurFade>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {DATA.skills.map((skill, id) => (
            <BlurFade key={skill.name} delay={BLUR_FADE_DELAY * 10 + id * 0.05} className="h-full">
              <div className="border bg-background border-border ring-2 ring-border/20 rounded-lg min-h-[1.75rem] w-full px-3 py-1 flex items-center gap-2">
                {skill.icon && <skill.icon className="size-3.5 rounded overflow-hidden object-contain flex-none" />}
                <span className="text-foreground text-xs font-medium">{skill.name}</span>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  ),
  hobbies: (
    <section id="hobbies">
      <div className="flex min-h-0 flex-col gap-y-4">
        <BlurFade delay={BLUR_FADE_DELAY * 9}>
          <h2 className="text-xl font-bold">{DATA.sections.hobbies.heading}</h2>
        </BlurFade>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
          {DATA.hobbies.map((hobby, id) => (
            <BlurFade key={hobby.name} delay={BLUR_FADE_DELAY * 10 + id * 0.05} className="h-full">
              <div className="border bg-background border-border ring-2 ring-border/20 rounded-lg min-h-[1.75rem] w-full px-3 py-1 flex items-center gap-2">
                {hobby.icon && <hobby.icon className="size-3.5 rounded overflow-hidden object-contain flex-none" />}
                <span className="text-foreground text-xs font-medium">{hobby.name}</span>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  ),
  // projects section rendered dynamically in HomePage with props
  contact: (
    <section id="contact">
      <BlurFade delay={BLUR_FADE_DELAY * 16}>
        <ContactSection />
      </BlurFade>
    </section>
  ),
};

export default function HomePage({ projects = [] }: { projects?: ProjectItem[] }) {
  return (
    <main className="min-h-dvh flex flex-col gap-14 relative">
      <section id="hero">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="gap-2 flex flex-col order-2 md:order-1 max-w-2xl">
            <BlurFadeText
              delay={BLUR_FADE_DELAY}
              className="text-3xl font-semibold tracking-tighter sm:text-4xl lg:text-5xl"
              yOffset={8}
              text={DATA.name}
            />
            <BlurFadeText
              className="text-muted-foreground md:text-lg lg:text-xl"
              delay={BLUR_FADE_DELAY}
              text={DATA.description}
            />
          </div>
          <BlurFade delay={BLUR_FADE_DELAY} className="order-1 md:order-2 flex-none">
            <Avatar className="size-24 md:size-32 border rounded-full shadow-lg ring-4 ring-muted">
              <AvatarImage alt={DATA.name} src={DATA.avatarUrl} />
              <AvatarFallback>{DATA.initials}</AvatarFallback>
            </Avatar>
          </BlurFade>
        </div>
      </section>

      {/* Grille deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-14 items-start">

        {/* Colonne gauche — Profil */}
        <div className="flex flex-col gap-14">
          {sectionComponents.about}
          {sectionComponents.work}
          {sectionComponents.education}
          {sectionComponents.certifications}
          {sectionComponents.skills}
          {sectionComponents.hobbies}
        </div>

        {/* Colonne droite — Créations */}
        <div className="relative flex flex-col gap-14 lg:sticky lg:top-6 lg:self-start lg:pl-10 lg:before:absolute lg:before:left-0 lg:before:top-[15%] lg:before:h-[70%] lg:before:w-[3px] lg:before:bg-border/50">
          <section id="projects">
            <BlurFade delay={BLUR_FADE_DELAY * 11}>
              <ProjectsSection projects={projects} />
            </BlurFade>
          </section>
        </div>

      </div>

      {/* Contact — full-width */}
      {sectionComponents.contact}
    </main>
  );
}
