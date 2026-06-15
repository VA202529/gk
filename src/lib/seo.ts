export const SITE_URL = "https://www.glansklasse.nl";

export const SEO_KEYWORDS = [
  "schoonmaakbedrijf Amsterdam",
  "schoonmaak Amsterdam",
  "schoonmaker Amsterdam",
  "woningschoonmaak Amsterdam",
  "huis schoonmaken Amsterdam",
  "kantoor schoonmaak Amsterdam",
  "kleine kantoren schoonmaak",
  "eenmalige schoonmaak Amsterdam",
  "oplever schoonmaak Amsterdam",
  "verhuizing schoonmaak Amsterdam",
  "schoonmaakbedrijf Amstelveen",
  "schoonmaakbedrijf Diemen",
  "schoonmaakbedrijf Duivendrecht",
  "schoonmaakbedrijf Ouder-Amstel",
  "schoonmaakbedrijf Badhoevedorp",
  "Glans & Klasse",
  "Glans en Klasse schoonmaak",
  "premium schoonmaak Amsterdam",
  "betrouwbare schoonmaker Amsterdam",
  "schoonmaak offerte Amsterdam",
].join(", ");

export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  name: "Glans & Klasse",
  slogan: "Schoonmaak met allure",
  description:
    "Glans & Klasse is een jong schoonmaakbedrijf uit Amsterdam voor woningen, kleine kantoren en eenmalige schoonmaakbeurten.",
  url: `${SITE_URL}/`,
  email: "glans.klasse@gmail.com",
  telephone: "+31638937378",
  areaServed: ["Amsterdam", "Amstelveen", "Diemen", "Duivendrecht", "Ouder-Amstel", "Badhoevedorp"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Amsterdam",
    addressCountry: "NL",
  },
  openingHours: "Mo-Fr 08:00-18:00",
  priceRange: "€€",
  sameAs: [],
};

export function seo({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}) {
  const url = `${SITE_URL}${path}`;
  const image = `${SITE_URL}/og-image.jpg`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { name: "keywords", content: SEO_KEYWORDS },
      { name: "author", content: "Glans & Klasse" },
      { name: "robots", content: "index, follow" },
      { name: "language", content: "nl" },
      { name: "geo.region", content: "NL-NH" },
      { name: "geo.placename", content: "Amsterdam" },
      { name: "theme-color", content: "#111111" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Glans & Klasse" },
      { property: "og:locale", content: "nl_NL" },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "nl-NL", href: url },
    ],
  };
}
