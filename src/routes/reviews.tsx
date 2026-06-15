import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { fetchPublicReviews } from "@/lib/google-sheets";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/reviews")({
  head: () =>
    seo({
      title: "Reviews Glans & Klasse | Ervaringen met Schoonmaak in Amsterdam",
      description:
        "Lees ervaringen van klanten van Glans & Klasse of laat zelf een review achter over onze schoonmaakdiensten in Amsterdam.",
      path: "/reviews",
    }),
  component: () => (
    <SiteLayout>
      <ReviewsPage />
    </SiteLayout>
  ),
});

type Review = {
  id: string;
  name: string;
  rating: number;
  message: string;
  image_url?: string;
  image_alt?: string;
  created_at: string;
};

function ReviewsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["reviews"],
    queryFn: fetchPublicReviews,
  });

  const reviews = data ?? [];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <>
      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Reviews</span>
          <h1 className="mt-6 font-display text-5xl lg:text-6xl">Wat klanten zeggen.</h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Hieronder leest u ervaringen van klanten van Glans &amp; Klasse. Zelf een review
            achterlaten?{" "}
            <Link to="/contact" className="underline underline-offset-4 hover:text-accent">
              Ga naar het contactformulier
            </Link>
            .
          </p>

          {reviews.length > 0 && (
            <div className="mt-10 inline-flex items-center gap-4 border border-border bg-background px-6 py-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className="h-5 w-5"
                    strokeWidth={1.25}
                    fill={avg >= n - 0.25 ? "currentColor" : "none"}
                    color="var(--accent)"
                  />
                ))}
              </div>
              <div className="text-sm text-foreground">
                <span className="font-medium">{avg.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {reviews.length} review{reviews.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          {isLoading && <p className="text-muted-foreground">Reviews laden…</p>}
          {error && (
            <p className="text-destructive">Kon reviews niet laden. Probeer het later opnieuw.</p>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="border border-dashed border-border bg-cream p-12 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-accent" strokeWidth={1.25} />
              <h2 className="mt-4 font-display text-2xl">Nog geen reviews.</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Wees de eerste — uw woord helpt ons groeien.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-block rounded-sm bg-foreground px-6 py-3 text-xs uppercase tracking-[0.25em] text-background hover:bg-accent hover:text-foreground"
              >
                Review achterlaten
              </Link>
            </div>
          )}

          {reviews.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article key={r.id} className="flex flex-col border border-border bg-cream p-8">
                  {r.image_url && (
                    <img
                      src={r.image_url}
                      alt={r.image_alt || `Reviewfoto van ${r.name} voor Glans & Klasse`}
                      loading="lazy"
                      className="mb-6 aspect-[4/3] w-full object-cover"
                    />
                  )}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className="h-4 w-4"
                        strokeWidth={1.25}
                        fill={r.rating >= n ? "currentColor" : "none"}
                        color="var(--accent)"
                      />
                    ))}
                  </div>
                  <p className="mt-5 flex-1 text-sm leading-relaxed text-foreground">
                    &ldquo;{r.message}&rdquo;
                  </p>
                  <div className="mt-6 border-t border-border pt-4">
                    <div className="font-display text-base text-foreground">{r.name}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("nl-NL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
