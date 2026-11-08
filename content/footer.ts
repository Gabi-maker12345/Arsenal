import { ph, type FooterContent } from "./schema";

export const footer: FooterContent = {
  headline: [ph("footer.headline.0"), ph("footer.headline.1")],
  cta: { label: ph("footer.cta.label"), href: ph("footer.cta.href") },
  columns: Array.from({ length: 4 }, (_, column) => ({
    title: ph(`footer.columns.${column}.title`),
    links: Array.from({ length: 3 }, (_, link) => ({
      label: ph(`footer.columns.${column}.links.${link}.label`),
      href: ph(`footer.columns.${column}.links.${link}.href`),
    })),
  })),
  legal: ph("footer.legal"),
  timezone: "Africa/Luanda",
};
