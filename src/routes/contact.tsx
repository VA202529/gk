import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/Layout";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Star,
  MessageSquare,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { submitContactMessage, submitQuoteRequest, submitReviewToSheet } from "@/lib/google-sheets";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    seo({
      title: "Offerte Schoonmaak Amsterdam | Contact Glans & Klasse",
      description:
        "Vraag vrijblijvend een offerte aan bij Glans & Klasse. Schoonmaak voor woningen en kleine kantoren in Amsterdam en omstreken.",
      path: "/contact",
    }),
  component: () => (
    <SiteLayout>
      <ContactPage />
      <FormSection />
    </SiteLayout>
  ),
});

function ContactPage() {
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteStartedAt] = useState(() => Date.now());

  async function handleQuoteSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    setSubmittingQuote(true);
    try {
      await submitQuoteRequest({
        name: String(fd.get("naam") || ""),
        phone: String(fd.get("tel") || ""),
        email: String(fd.get("email") || ""),
        space_type: String(fd.get("type") || ""),
        frequency: String(fd.get("freq") || ""),
        message: String(fd.get("msg") || ""),
        website: String(fd.get("website") || ""),
        started_at: quoteStartedAt,
        consent: true,
      });
      toast.success("Bedankt - wij nemen binnen 24 uur contact op.");
      form.reset();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Er ging iets mis. Probeer het later opnieuw.";
      toast.error(msg);
    } finally {
      setSubmittingQuote(false);
    }
  }

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="text-xs uppercase tracking-[0.3em] text-accent">Contact</span>
            <h1 className="mt-6 font-display text-5xl lg:text-6xl">Laten we kennismaken.</h1>
            <p className="mt-6 text-muted-foreground">
              Vertel ons over uw ruimte en wensen - wij sturen u binnen 24 uur een persoonlijke
              offerte.
            </p>

            <div className="mt-12 space-y-6 border-t border-border pt-10">
              <Row icon={Phone} label="Telefoon" value="(06) 38 93 73 78" href="tel:+31638937378" />
              <Row
                icon={Phone}
                label="Telefoon 2"
                value="(06) 39 45 81 90"
                href="tel:+31639458190"
              />
              <Row
                icon={Mail}
                label="E-mail"
                value="glans.klasse@gmail.com"
                href="mailto:glans.klasse@gmail.com"
              />
              <Row icon={MapPin} label="Werkgebied" value="Amsterdam & omstreken" />
              <Row icon={Clock} label="Bereikbaar" value="Ma-Vr 08:00-18:00" />
            </div>

            <div className="mt-10 flex gap-3">
              <a
                href="#"
                aria-label="Instagram"
                className="rounded-full border border-border p-3 hover:border-accent hover:text-accent"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="rounded-full border border-border p-3 hover:border-accent hover:text-accent"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleQuoteSubmit}
              className="space-y-6 border border-border bg-cream p-8 lg:p-12"
            >
              <h2 className="font-display text-3xl">Offerte aanvragen</h2>
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Naam" name="naam" required />
                <Field label="Telefoon" name="tel" />
              </div>
              <Field label="E-mailadres" name="email" type="email" required />
              <div className="grid gap-6 sm:grid-cols-2">
                <Select
                  label="Type ruimte"
                  name="type"
                  options={["Woning", "Kantoor", "Horeca", "Anders"]}
                />
                <Select
                  label="Frequentie"
                  name="freq"
                  options={["Eenmalig", "Wekelijks", "Tweewekelijks", "Maandelijks"]}
                />
              </div>
              <Field label="Bericht" name="msg" textarea />
              <button
                type="submit"
                disabled={submittingQuote}
                className="w-full rounded-sm bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
              >
                {submittingQuote ? "Versturen..." : "Verstuur aanvraag"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

const baseSchema = z.object({
  naam: z
    .string()
    .trim()
    .min(2, "Naam is verplicht (min. 2 tekens).")
    .max(80, "Naam is te lang (max. 80 tekens)."),
  email: z
    .string()
    .trim()
    .email("Voer een geldig e-mailadres in.")
    .max(255)
    .optional()
    .or(z.literal("")),
  bericht: z
    .string()
    .trim()
    .min(3, "Bericht is te kort (min. 3 tekens).")
    .max(1000, "Bericht is te lang (max. 1000 tekens)."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "U moet akkoord gaan met de verwerking van uw gegevens." }),
  }),
});

const reviewSchema = baseSchema.extend({
  rating: z.number().int().min(1, "Geef een sterbeoordeling van 1 tot 5.").max(5),
});

type Mode = "bericht" | "review";

function FormSection() {
  const [mode, setMode] = useState<Mode>("review");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [startedAt] = useState(() => Date.now());

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const form = e.currentTarget;
    const fd = new FormData(form);
    const raw = {
      naam: String(fd.get("naam") || ""),
      email: String(fd.get("email") || ""),
      bericht: String(fd.get("bericht") || ""),
      consent: fd.get("consent") === "on",
      rating,
    };

    const schema = mode === "review" ? reviewSchema : baseSchema;
    const result = schema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const k = issue.path[0] as string;
        if (!fieldErrors[k]) fieldErrors[k] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Controleer het formulier op fouten.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "review") {
        await submitReviewToSheet({
          name: raw.naam,
          email: raw.email,
          rating: raw.rating,
          message: raw.bericht,
          website: String(fd.get("website") || ""),
          started_at: startedAt,
        });
        toast.success("Bedankt voor uw review! We controleren deze voor publicatie.");
      } else {
        await submitContactMessage({
          name: raw.naam,
          email: raw.email,
          message: raw.bericht,
          consent: raw.consent,
          website: String(fd.get("website") || ""),
          started_at: startedAt,
        });
        toast.success("Bedankt voor uw bericht - we nemen contact op.");
      }
      setSent(true);
      form.reset();
      setRating(0);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Er ging iets mis. Probeer het later opnieuw.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-3xl px-6 lg:px-12">
        <div className="text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">Bericht of review</span>
          <h2 className="mt-6 font-display text-4xl lg:text-5xl">
            Laat een bericht of review achter.
          </h2>
          <p className="mt-6 text-muted-foreground">
            Kies hieronder of u ons een privebericht stuurt of een openbare review wilt achterlaten.
            Bekijk bestaande reviews op de{" "}
            <Link to="/reviews" className="underline underline-offset-4 hover:text-accent">
              reviews-pagina
            </Link>
            .
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-border bg-border">
          <button
            type="button"
            onClick={() => {
              setMode("bericht");
              setErrors({});
              setSent(false);
            }}
            className={`flex items-center justify-center gap-2 px-6 py-4 text-xs uppercase tracking-[0.2em] transition-colors ${mode === "bericht" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-cream"}`}
          >
            <MessageSquare className="h-4 w-4" /> Prive bericht
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("review");
              setErrors({});
              setSent(false);
            }}
            className={`flex items-center justify-center gap-2 px-6 py-4 text-xs uppercase tracking-[0.2em] transition-colors ${mode === "review" ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-cream"}`}
          >
            <Sparkles className="h-4 w-4" /> Openbare review
          </button>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {mode === "bericht"
            ? "Een privebericht komt rechtstreeks bij ons binnen en wordt niet op de website getoond."
            : "Een review wordt na controle openbaar getoond op onze reviews-pagina."}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 space-y-6 border border-border bg-background p-8 lg:p-12"
        >
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Naam" name="naam" required error={errors.naam} />
            <FormField
              label={mode === "review" ? "E-mail (optioneel, niet getoond)" : "E-mail"}
              name="email"
              type="email"
              required={mode === "bericht"}
              error={errors.email}
            />
          </div>

          {mode === "review" && (
            <div>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Beoordeling *
              </span>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    aria-label={`${n} ster${n > 1 ? "ren" : ""}`}
                    className="leading-none transition-colors"
                  >
                    <Star
                      className="h-7 w-7"
                      strokeWidth={1.25}
                      fill={(hover || rating) >= n ? "currentColor" : "none"}
                      color={(hover || rating) >= n ? "var(--accent)" : "var(--border)"}
                    />
                  </button>
                ))}
              </div>
              {errors.rating && <p className="mt-2 text-xs text-destructive">{errors.rating}</p>}
            </div>
          )}

          <FormField
            label={mode === "review" ? "Uw review" : "Uw bericht"}
            name="bericht"
            textarea
            required
            error={errors.bericht}
          />

          <div className="space-y-3 border-t border-border pt-6">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Privacy (AVG):</strong> Glans &amp; Klasse
              verwerkt uw naam, e-mail en bericht uitsluitend om met u in contact te treden
              {mode === "review" ? " en om uw review na controle openbaar te tonen" : ""}. Wij delen
              uw gegevens niet met derden en bewaren deze niet langer dan nodig is. U kunt op elk
              moment verzoeken om inzage, correctie of verwijdering via{" "}
              <a href="mailto:glans.klasse@gmail.com" className="underline hover:text-accent">
                glans.klasse@gmail.com
              </a>
              .
            </p>
            <label className="flex items-start gap-3 text-sm text-foreground">
              <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-accent" />
              <span>
                Ik geef toestemming voor de verwerking van mijn gegevens zoals beschreven
                {mode === "review"
                  ? ", en voor het openbaar tonen van mijn voornaam en review op de website"
                  : ""}
                . *
              </span>
            </label>
            {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-sm bg-foreground px-8 py-4 text-xs uppercase tracking-[0.25em] text-background transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          >
            {submitting
              ? "Versturen..."
              : sent
                ? "Verstuurd - verstuur nog een"
                : mode === "review"
                  ? "Review plaatsen"
                  : "Bericht versturen"}
          </button>
        </form>
      </div>
    </section>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
  textarea,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string;
}) {
  const cls = `w-full border-0 border-b ${error ? "border-destructive" : "border-border"} bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none`;
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea name={name} rows={5} className={cls} maxLength={1000} />
      ) : (
        <input type={type} name={name} className={cls} maxLength={255} />
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}) {
  const Body = (
    <div className="flex items-start gap-4">
      <Icon className="mt-1 h-4 w-4 text-accent" strokeWidth={1.5} />
      <div>
        <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-foreground">{value}</div>
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block hover:text-accent">
      {Body}
    </a>
  ) : (
    Body
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "w-full border-0 border-b border-border bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-0";
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      {textarea ? (
        <textarea name={name} rows={4} className={cls} />
      ) : (
        <input type={type} name={name} required={required} className={cls} />
      )}
    </label>
  );
}

function Select({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        className="w-full border-0 border-b border-border bg-transparent py-3 text-sm text-foreground focus:border-accent focus:outline-none"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
