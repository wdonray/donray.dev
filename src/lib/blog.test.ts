import { describe, expect, it } from "vitest";
import { getPost, getHeadings, POSTS } from "./blog";

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
    expect(headings[0].text).toBe("Standards stay calibrated");
  });
});
