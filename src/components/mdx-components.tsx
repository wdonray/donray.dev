import type { MDXComponents } from "mdx/types";

/**
 * Styled wrappers for MDX elements. Keeps blog typography consistent
 * with the rest of the site without per-post classNames.
 */
export const mdxComponents: MDXComponents = {
  h2: ({ children, id }) => (
    <h2
      id={id}
      className="text-2xl font-bold tracking-tight mt-10 scroll-mt-24"
    >
      {children}
    </h2>
  ),
  h3: ({ children, id }) => (
    <h3
      id={id}
      className="text-xl font-semibold tracking-tight mt-8 scroll-mt-24"
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="leading-relaxed text-foreground/90 mt-5">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-foreground underline decoration-khaki decoration-2 underline-offset-4 hover:decoration-foreground transition-colors"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-6 mt-5 space-y-2 text-foreground/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-6 mt-5 space-y-2 text-foreground/90">
      {children}
    </ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-khaki pl-4 italic mt-5 text-foreground/80">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="mt-6 overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm [&>code]:bg-transparent [&>code]:p-0">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">
      {children}
    </code>
  ),
};
