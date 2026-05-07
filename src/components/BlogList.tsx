import BlurFade from "@/components/magicui/blur-fade";
import { ChevronRight } from "@/lib/icons";

const BLUR_FADE_DELAY = 0.04;

interface Post {
  id: string;
  title: string;
  publishedAt: string;
  summary?: string;
  image?: string;
}

interface Pagination {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface BlogListProps {
  posts: Post[];
  allPostsCount: number;
  pagination: Pagination;
  pageSize: number;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BlogList({ posts, allPostsCount, pagination, pageSize }: BlogListProps) {
  return (
    <section id="blog">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="text-2xl font-semibold tracking-tight mb-4">
          Blog{" "}
          <span className="ml-1 bg-card border border-border rounded-md px-2 py-1 text-muted-foreground text-sm">
            {allPostsCount} articles
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Réflexions sur la tech, le produit et la vie de builder.
        </p>
      </BlurFade>

      {posts.length > 0 ? (
        <>
          <BlurFade delay={BLUR_FADE_DELAY * 2}>
            <div className="flex flex-col divide-y divide-border/50">
              {posts.map((post, id) => {
                const indexNumber = (pagination.page - 1) * pageSize + id + 1;
                return (
                  <BlurFade delay={BLUR_FADE_DELAY * 3 + id * 0.05} key={post.id}>
                    <a
                      className="flex items-center gap-x-4 py-5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      href={`/blog/${post.id}`}
                    >
                      <span className="text-xs font-mono tabular-nums font-medium text-muted-foreground shrink-0 w-6">
                        {String(indexNumber).padStart(2, "0")}.
                      </span>
                      <div className="flex flex-col gap-y-1 flex-1 min-w-0">
                        <p className="tracking-tight text-base font-medium leading-snug">
                          <span className="group-hover:text-primary transition-colors">
                            {post.title}
                            <ChevronRight
                              className="ml-1 inline-block size-4 stroke-3 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0"
                              aria-hidden
                            />
                          </span>
                        </p>
                        {post.summary && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.summary}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {formatDate(post.publishedAt)}
                        </p>
                      </div>
                      <div className="w-20 h-14 rounded-lg flex-none overflow-hidden shrink-0">
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                      </div>
                    </a>
                  </BlurFade>
                );
              })}
            </div>
          </BlurFade>

          {pagination.totalPages > 1 && (
            <BlurFade delay={BLUR_FADE_DELAY * 4}>
              <div className="flex gap-3 flex-row items-center justify-between mt-8">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages}
                </div>
                <div className="flex gap-2 sm:justify-end">
                  {pagination.hasPreviousPage ? (
                    <a
                      href={`/blog?page=${pagination.page - 1}`}
                      className="h-8 w-fit px-3 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Précédent
                    </a>
                  ) : (
                    <span className="h-8 w-fit px-3 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Précédent
                    </span>
                  )}
                  {pagination.hasNextPage ? (
                    <a
                      href={`/blog?page=${pagination.page + 1}`}
                      className="h-8 w-fit px-3 flex items-center justify-center text-sm border border-border rounded-lg hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      Suivant
                    </a>
                  ) : (
                    <span className="h-8 w-fit px-3 flex items-center justify-center text-sm border border-border rounded-lg opacity-50 cursor-not-allowed">
                      Suivant
                    </span>
                  )}
                </div>
              </div>
            </BlurFade>
          )}
        </>
      ) : (
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-xl">
            <p className="text-muted-foreground text-center">
              Aucun article pour l'instant. Revenez bientôt !
            </p>
          </div>
        </BlurFade>
      )}
    </section>
  );
}
