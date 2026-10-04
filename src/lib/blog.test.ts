import { describe, expect, it } from "vitest";
import {
  getPost,
  getPostContent,
  getMdxOptions,
  getHeadings,
  POSTS,
} from "./blog";

describe("blog", () => {
  it("has at least one post with required fields", () => {
    expect(POSTS.length).toBeGreaterThan(0);
    for (const post of POSTS) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.excerpt).toBeTruthy();
      expect(post.readingMinutes).toBeGreaterThan(0);
    }
  });

  it("finds posts by slug", () => {
    const post = getPost("review-to-learn");
    expect(post?.title).toContain("proved me wrong");
    expect(getPost("nonexistent")).toBeUndefined();
  });

  it("sorts POSTS newest first by frontmatter date", () => {
    const dates = POSTS.map((p) => p.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("extracts headings for the table of contents", () => {
    const headings = getHeadings("review-to-learn");
    expect(headings.length).toBeGreaterThan(0);
    for (const h of headings) {
      expect(h.id).toBeTruthy();
      expect(h.text).toBeTruthy();
      expect([2, 3]).toContain(h.level);
    }
    expect(headings[0].text).toBe(
      "What does a review catch that nothing else does?",
    );
  });

  it("returns raw MDX source for next-mdx-remote/rsc", () => {
    // Regression guard: the RSC MDXRemote serializes the source itself.
    // Passing an already-serialized result made it render an empty body
    // with no build or test failure.
    const content = getPostContent("review-to-learn");
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain(
      "Should engineering managers stay in code review",
    );
    expect(content).not.toContain("compiledSource");
  });

  it("provides GFM and rehype plugins for MDX compilation", () => {
    const opts = getMdxOptions();
    expect(opts.mdxOptions.remarkPlugins).toHaveLength(1);
    expect(opts.mdxOptions.rehypePlugins).toHaveLength(3);
  });
});

describe("getPostMeta faq fallback", () => {
  it("defaults faq to empty array when frontmatter has none", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "src/content/blog");
    const tmp = path.join(dir, "__test-no-faq.mdx");
    fs.writeFileSync(
      tmp,
      `---\ntitle: "Test"\ndate: "2026-01-01"\nexcerpt: "Test excerpt"\n---\n\nBody.\n`,
    );
    try {
      const post = getPost("__test-no-faq");
      expect(post?.faq).toEqual([]);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
