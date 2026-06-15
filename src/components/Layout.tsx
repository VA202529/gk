import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Music2, Phone, Play, Youtube } from "lucide-react";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

const nav = [
  { to: "/", label: "Home" },
  { to: "/diensten", label: "Diensten" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

const socials = [
  {
    label: "YouTube",
    href: "https://youtube.com/@glansenklasse?si=atM1TF7jY7h-Csiw",
    icon: Youtube,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@glansenklase?_r=1&_t=ZG-97ExHe577HE",
    icon: Music2,
  },
  { label: "Instagram", href: "https://www.instagram.com/glansenklasse", icon: Instagram },
  { label: "Snapchat", href: "https://snapchat.com/t/iGpWaTb1", icon: Play },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61590465467076",
    icon: Facebook,
  },
  { label: "Pinterest", href: "https://pin.it/6wPCxFEFB", icon: Play },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
        <Link to="/" className="group flex flex-col leading-none">
          <span className="font-display text-2xl tracking-tight text-foreground">
            Glans <span className="text-accent">&</span> Klasse
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Schoonmaak met allure
          </span>
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`text-sm tracking-wide transition-colors hover:text-foreground ${path === n.to ? "text-foreground" : "text-muted-foreground"}`}
            >
              {n.label}
            </Link>
          ))}
          <Link
            to="/contact"
            className="rounded-sm border border-foreground px-5 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Offerte
          </Link>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden" aria-label="Menu">
          <div className="space-y-1.5">
            <span className="block h-px w-6 bg-foreground" />
            <span className="block h-px w-6 bg-foreground" />
          </div>
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <div className="flex flex-col px-6 py-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-4 lg:px-12">
        <div className="md:col-span-2">
          <div className="font-display text-3xl">
            Glans <span className="text-accent">&</span> Klasse
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/70">
            Premium schoonmaakdiensten voor wie geen genoegen neemt met minder dan perfectie.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className="rounded-full border border-primary-foreground/20 p-2 transition-colors hover:border-accent hover:text-accent"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-accent">Contact</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> (06) 38 93 73 78
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> (06) 39 45 81 90
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> glans.klasse@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Amsterdam, NL
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-accent">Navigatie</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-accent">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-xs text-primary-foreground/50 sm:flex-row sm:items-center sm:justify-between lg:px-12">
          <span>&copy; {new Date().getFullYear()} Glans & Klasse - Alle rechten voorbehouden.</span>
          <span>
            Ontwikkeld door{" "}
            <a
              href="https://vanappiah.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Van Appiah VA
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
      <Toaster />
    </div>
  );
}
