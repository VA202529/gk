import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layout";
import aboutImg from "@/assets/about.jpg";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/over-ons")({
  head: () =>
    seo({
      title: "Over Glans & Klasse | Jong Schoonmaakbedrijf uit Amsterdam",
      description:
        "Maak kennis met Glans & Klasse, een jong en persoonlijk schoonmaakbedrijf uit Amsterdam met aandacht voor duidelijke afspraken en zorgvuldig werk.",
      path: "/over-ons",
    }),
  component: () => (
    <SiteLayout>
      <OverOns />
    </SiteLayout>
  ),
});

function OverOns() {
  return (
    <>
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-12">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-accent">Over ons</span>
            <h1 className="mt-6 font-display text-5xl lg:text-6xl">
              Een nieuw bedrijf, met aandacht voor uw thuis.
            </h1>
            <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground">
              <p>
                Glans & Klasse is een jong schoonmaakbedrijf uit Amsterdam. We zijn net begonnen, en
                juist daarom nemen we de tijd voor elke klant. Geen grote beloftes — wel eerlijk
                werk, duidelijke afspraken en een vriendelijke aanpak.
              </p>
              <p>
                Of het nu gaat om een wekelijkse beurt voor uw woning of een eenmalige schoonmaak:
                we doen het met zorg, alsof het ons eigen huis is.
              </p>
            </div>
          </div>
          <div className="lg:pt-12">
            <img
              src={aboutImg}
              alt="Verzorgde schoonmaakdetails in een woning door Glans & Klasse"
              width={1200}
              height={1400}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-12">
          <span className="text-xs uppercase tracking-[0.3em] text-accent-foreground/80">
            Inspiratie
          </span>
          <blockquote className="mt-8 font-display text-2xl italic leading-relaxed lg:text-3xl">
            “Het huis is meer dan stenen en kozijnen,
            <br />
            het is de glans die door de kamers strijkt.
            <br />
            Waar door de zorg van mensenhanden,
            <br />
            de dag in zuiverheid de muren bereikt.”
          </blockquote>
          <cite className="mt-6 block text-xs uppercase not-italic tracking-[0.3em] text-primary-foreground/70">
            — Ida Gerhardt
          </cite>
        </div>
      </section>

      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                n: "01",
                t: "Eerlijk",
                d: "Duidelijke prijzen en afspraken, zonder verrassingen achteraf.",
              },
              {
                n: "02",
                t: "Zorgvuldig",
                d: "We nemen de tijd om het werk goed te doen, ook in de kleine hoekjes.",
              },
              {
                n: "03",
                t: "Persoonlijk",
                d: "Korte lijnen — u spreekt altijd dezelfde vertrouwde mensen.",
              },
            ].map((v) => (
              <div key={v.n}>
                <div className="font-display text-sm text-accent">{v.n}</div>
                <h3 className="mt-3 font-display text-2xl">{v.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
