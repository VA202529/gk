import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layout";
import { Check } from "lucide-react";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/diensten")({
  head: () =>
    seo({
      title: "Schoonmaakdiensten Amsterdam | Woningen, Kantoren & Eenmalige Beurt",
      description:
        "Bekijk de schoonmaakdiensten van Glans & Klasse: woningschoonmaak, kleine kantoren en eenmalige schoonmaak in Amsterdam en omgeving.",
      path: "/diensten",
    }),
  component: () => (
    <SiteLayout>
      <DienstenPage />
    </SiteLayout>
  ),
});

const diensten = [
  {
    title: "Woningschoonmaak",
    sub: "Een fris en verzorgd huis, zonder zorgen.",
    items: [
      "Wekelijks, tweewekelijks of eenmalig",
      "Stoffen, stofzuigen en dweilen",
      "Sanitair en keuken grondig schoon",
      "Op afspraak en op maat",
    ],
  },
  {
    title: "Kleine kantoren",
    sub: "Een schone werkplek voor uw team.",
    items: [
      "Periodieke schoonmaak op vaste dagen",
      "Sanitair, keuken en werkplekken",
      "In overleg buiten kantoortijden",
      "Eerlijke uurtarieven",
    ],
  },
  {
    title: "Eenmalige beurt",
    sub: "Grote schoonmaak of opleverbeurt.",
    items: [
      "Voorjaars- of najaarsschoonmaak",
      "Opleverschoonmaak bij verhuizing",
      "Ramen aan de binnenzijde",
      "Vrijblijvende prijsopgave vooraf",
    ],
  },
];

function DienstenPage() {
  return (
    <>
      <section className="bg-cream py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Onze diensten</span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl lg:text-6xl">
            Eenvoudig, eerlijk en zorgvuldig.
          </h1>
          <p className="mt-6 max-w-2xl text-muted-foreground">
            Wij zijn een jong schoonmaakbedrijf uit Amsterdam. Onze diensten houden we graag
            overzichtelijk — vertel ons wat u nodig heeft en we maken een passend voorstel.
          </p>
          <p className="mt-4 max-w-2xl text-sm italic text-muted-foreground">
            Let op: onderstaand vindt u slechts een fractie van wat wij aanbieden. Heeft u een
            specifieke wens of een ruimte die hier niet bij staat? Neem gerust contact op — we
            denken graag met u mee.
          </p>
        </div>
      </section>

      <section className="bg-background py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-px bg-border md:grid-cols-3">
            {diensten.map((d, i) => (
              <div key={d.title} className="bg-background p-10 lg:p-12">
                <div className="font-display text-sm text-accent">0{i + 1}</div>
                <h2 className="mt-4 font-display text-2xl lg:text-3xl">{d.title}</h2>
                <p className="mt-3 text-sm italic text-muted-foreground">{d.sub}</p>
                <ul className="mt-8 space-y-3">
                  {d.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm text-foreground">
                      <Check
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent"
                        strokeWidth={1.5}
                      />{" "}
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 rounded-sm bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background hover:bg-accent hover:text-background"
            >
              Vraag een offerte aan
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
