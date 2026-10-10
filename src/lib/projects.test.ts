import { describe, expect, it } from "vitest";
import { getProject, PROJECTS } from "./projects";

describe("getProject", () => {
  it("returns the project structure for a known slug", () => {
    const project = getProject("hide-zero-cards");
    expect(project?.slug).toBe("hide-zero-cards");
    expect(project?.url).toBe("https://hidezerocards.org");
    expect(project?.stack).toContain("Next.js");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getProject("nope")).toBeUndefined();
  });

  it("covers every project once", () => {
    const slugs = PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const project of PROJECTS) {
      expect(getProject(project.slug)).toBe(project);
    }
  });
});
