import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layout";
import { ArrowRight, Sparkles, Building2, Home, UtensilsCrossed } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seo({
      title: "Glans & Klasse | Schoonmaakbedrijf Amsterdam met Allure",
      description:
        "Glans & Klasse is een jong schoonmaakbedrijf uit Amsterdam voor woningen en kleine kantoren. Zorgvuldig, eerlijk en met oog voor detail.",
      path: "/",
    }),
  component: () => (
    <SiteLayout>
      <HomePage />
    </SiteLayout>
  ),
});

function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cream">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-20 pb-24 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pt-32 lg:pb-32">
          <div className="lg:col-span-6 lg:pt-12">
            <span className="text-xs uppercase tracking-[0.3em] text-accent">
              — Nieuw in Amsterdam
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-foreground sm:text-6xl lg:text-7xl">
              Schoonmaak met
              <br />
              <em className="not-italic text-accent">glans</em> en klasse.
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Een jong schoonmaakbedrijf uit Amsterdam. We helpen u met uw woning of kleine kantoor
              — eerlijk, zorgvuldig en met aandacht voor detail.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 rounded-sm bg-foreground px-7 py-4 text-xs uppercase tracking-[0.25em] text-background transition-all hover:bg-accent hover:text-foreground"
              >
                Offerte aanvragen{" "}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/diensten"
                className="text-sm tracking-wide text-foreground underline-offset-4 hover:underline"
              >
                Bekijk diensten
              </Link>
            </div>
          </div>
          <div className="relative lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={heroImg}
                alt="Frisse woning met glanzend interieur na professionele schoonmaak in Amsterdam"
                width={1600}
                height={1200}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden bg-background p-6 shadow-xl lg:block">
              <div className="font-display text-3xl text-foreground">
                Net <span className="text-accent">gestart</span>
              </div>
              <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                In Amsterdam
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DIENSTEN PREVIEW */}
      <section className="border-t border-border bg-background py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex items-end justify-between gap-8">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-accent">Diensten</span>
              <h2 className="mt-4 max-w-xl font-display text-4xl lg:text-5xl">
                Een dienst voor elke ruimte.
              </h2>
            </div>
            <Link
              to="/diensten"
              className="hidden text-sm tracking-wide text-foreground underline-offset-4 hover:underline md:inline"
            >
              Alles bekijken →
            </Link>
          </div>
          <div className="mt-16 grid gap-px bg-border md:grid-cols-3">
            {[
              {
                icon: Home,
                title: "Woningschoonmaak",
                text: "Wekelijks, tweewekelijks of eenmalig — naar uw wens.",
              },
              {
                icon: Building2,
                title: "Kleine kantoren",
                text: "Een opgeruimde werkplek voor uw team, op vaste momenten.",
              },
              {
                icon: UtensilsCrossed,
                title: "Eenmalige beurt",
                text: "Grote schoonmaak of opleverbeurt na verhuizing of verbouwing.",
              },
            ].map((d) => (
              <div
                key={d.title}
                className="group bg-background p-10 transition-colors hover:bg-cream"
              >
                <d.icon className="h-7 w-7 text-accent" strokeWidth={1.25} />
                <h3 className="mt-8 font-display text-2xl">{d.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REGIO */}
      <section className="bg-primary py-24 text-primary-foreground lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-accent">Werkgebied</span>
              <h2 className="mt-4 font-display text-4xl lg:text-5xl">
                Actief in Amsterdam en omstreken.
              </h2>
            </div>
            <div>
              <p className="text-base leading-relaxed text-primary-foreground/80">
                We zijn een lokaal bedrijf en werken voornamelijk in Amsterdam en de directe
                omgeving. Woont u net buiten de stad? Neem gerust contact op — vaak kunnen we iets
                regelen.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-y-3 text-sm text-primary-foreground/70">
                {[
                  "Amsterdam",
                  "Amstelveen",
                  "Diemen",
                  "Duivendrecht",
                  "Ouder-Amstel",
                  "Badhoevedorp",
                ].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <Sparkles className="h-3 w-3 text-accent" /> {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cream py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-4xl lg:text-5xl">Klaar voor een ruimte die straalt?</h2>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Vraag vrijblijvend uw persoonlijke offerte aan — binnen 24 uur ontvangt u antwoord.
          </p>
          <Link
            to="/contact"
            className="mt-10 inline-flex items-center gap-3 rounded-sm bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background hover:bg-accent hover:text-foreground"
          >
            Vraag offerte aan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </>
  );
}
