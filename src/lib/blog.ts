import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";

const CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readingMinutes: number;
  faq: { q: string; a: string }[];
}

export interface BlogHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

/** All posts, newest first. */
export function getPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => getPostMeta(file.replace(/\.mdx$/, "")))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const POSTS = getPosts();

function readSource(slug: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), "utf8");
}

/** Frontmatter + reading time for a post. */
export function getPostMeta(slug: string): BlogPostMeta {
  const { data, content } = matter(readSource(slug));
  return {
    slug,
    title: data.title as string,
    date: data.date as string,
    excerpt: data.excerpt as string,
    readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    faq: (data.faq as { q: string; a: string }[] | undefined) ?? [],
  };
}

/** Back-compat: find a post's metadata by slug. */
export function getPost(slug: string): BlogPostMeta | undefined {
  try {
    return getPostMeta(slug);
  } catch {
    return undefined;
  }
}

/** Raw MDX body for a post (frontmatter stripped). Passed to next-mdx-remote/rsc's
 * MDXRemote, which serializes it at render time. */
export function getPostContent(slug: string): string {
  const { content } = matter(readSource(slug));
  return content;
}

/** Shared MDX compile options (GFM tables, syntax highlighting, heading anchors). */
export function getMdxOptions() {
  return {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { theme: "github-light" }],
        [rehypeAutolinkHeadings, { behavior: "append" }],
      ] as never[],
    },
  };
}

/** Extract h2/h3 headings for the table of contents. */
export function getHeadings(slug: string): BlogHeading[] {
  const { content } = matter(readSource(slug));
  const headings: BlogHeading[] = [];
  for (const line of content.split("\n")) {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (!match) continue;
    const text = match[2].trim();
    headings.push({
      id: text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-"),
      text,
      level: match[1].length as 2 | 3,
    });
  }
  return headings;
}
