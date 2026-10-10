import { getTranslations } from "next-intl/server";
import type { BlogHeading } from "@/lib/blog";

/** Table of contents for a blog post, generated from its h2/h3 headings. */
export default async function TableOfContents({
  headings,
}: {
  headings: BlogHeading[];
}) {
  if (headings.length === 0) return null;

  const t = await getTranslations("tableOfContents");

  return (
    <nav
      aria-label={t("title")}
      className="mt-8 rounded-lg border border-border bg-muted/30 p-5"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {t("title")}
      </p>
      <ul className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${h.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
