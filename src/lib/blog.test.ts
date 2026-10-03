import { describe, expect, it } from "vitest";
import { getPost, getPostContent, getHeadings, POSTS } from "./blog";

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
    const post = getPost("422-code-reviews");
    expect(post?.title).toContain("422 code reviews");
    expect(getPost("nonexistent")).toBeUndefined();
  });

  it("extracts headings for the table of contents", () => {
    const headings = getHeadings("422-code-reviews");
    expect(headings.length).toBeGreaterThan(0);
    for (const h of headings) {
      expect(h.id).toBeTruthy();
      expect(h.text).toBeTruthy();
      expect([2, 3]).toContain(h.level);
    }
    expect(headings[0].text).toBe("The numbers");
  });

  it("returns raw MDX source for next-mdx-remote/rsc", () => {
    // Regression guard: the RSC MDXRemote serializes the source itself.
    // Passing an already-serialized result made it render an empty body
    // with no build or test failure.
    const content = getPostContent("422-code-reviews");
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain(
      "Should engineering managers stay in code review",
    );
    expect(content).not.toContain("compiledSource");
  });
});
