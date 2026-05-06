import React from "react";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Markdown from "react-markdown";
import ContactSection from "@/components/section/contact-section";
import ProjectsSection from "@/components/section/projects-section";
import WorkSection from "@/components/section/work-section";
import { ArrowUpRight } from "lucide-react";

const BLUR_FADE_DELAY = 0.04;

interface RecentPost {
  slug: string;
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
}

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
  skills: (
    <section id="skills">
      <div className="flex min-h-0 flex-col gap-y-4">
        <BlurFade delay={BLUR_FADE_DELAY * 9}>
          <h2 className="text-xl font-bold">{DATA.sections.skills.heading}</h2>
        </BlurFade>
        <div className="flex flex-wrap gap-2">
          {DATA.skills.map((skill, id) => (
            <BlurFade key={skill.name} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
              <div className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2">
                {skill.icon && <skill.icon className="size-4 rounded overflow-hidden object-contain" />}
                <span className="text-foreground text-sm font-medium">{skill.name}</span>
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
        <div className="flex flex-wrap gap-2">
          {DATA.hobbies.map((hobby, id) => (
            <BlurFade key={hobby.name} delay={BLUR_FADE_DELAY * 10 + id * 0.05}>
              <div className="border bg-background border-border ring-2 ring-border/20 rounded-xl h-8 w-fit px-4 flex items-center gap-2">
                {hobby.icon && <hobby.icon className="size-4 rounded overflow-hidden object-contain" />}
                <span className="text-foreground text-sm font-medium">{hobby.name}</span>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  ),
  projects: (
    <section id="projects">
      <BlurFade delay={BLUR_FADE_DELAY * 11}>
        <ProjectsSection />
      </BlurFade>
    </section>
  ),
  contact: (
    <section id="contact">
      <BlurFade delay={BLUR_FADE_DELAY * 16}>
        <ContactSection />
      </BlurFade>
    </section>
  ),
};

export default function HomePage({ recentPosts = [] }: { recentPosts?: RecentPost[] }) {
  return (
    <main className="min-h-dvh flex flex-col gap-14 relative">
      <section id="hero">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="gap-2 flex flex-col order-2 md:order-1">
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
        </div>
      </section>

      {/* Grille deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-14 items-start">

        {/* Colonne gauche — Profil */}
        <div className="flex flex-col gap-14">
          {sectionComponents.about}
          {sectionComponents.work}
          {sectionComponents.education}
          {sectionComponents.skills}
          {sectionComponents.hobbies}
        </div>

        {/* Colonne droite — Créations */}
        <div className="relative flex flex-col gap-14 lg:sticky lg:top-6 lg:self-start lg:pl-10 lg:before:absolute lg:before:left-0 lg:before:top-[15%] lg:before:h-[70%] lg:before:w-[3px] lg:before:bg-border/50">
          {recentPosts.length > 0 && (
            <section id="recent-posts">
              <div className="flex min-h-0 flex-col gap-y-4">
                <BlurFade delay={BLUR_FADE_DELAY * 2}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Derniers articles</h2>
                    <a
                      href="/blog"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      Tous les articles
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </BlurFade>
                <div className="flex flex-col">
                  {recentPosts.map((post, i) => (
                    <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * 2 + i * 0.06}>
                      <a
                        href={`/blog/${post.slug}`}
                        className="group flex items-center gap-3 py-3 border-b border-border/50 hover:border-primary/40 transition-colors"
                      >
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-14 h-10 rounded-md object-cover flex-none opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                            {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {post.summary}
                          </p>
                        </div>
                        <time className="text-xs text-muted-foreground tabular-nums flex-none">
                          {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      </a>
                    </BlurFade>
                  ))}
                </div>
              </div>
            </section>
          )}
          {sectionComponents.projects}
        </div>

      </div>

      {/* Contact — full-width */}
      {sectionComponents.contact}
    </main>
  );
}
