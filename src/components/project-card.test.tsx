import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard, type Project } from "./projects";

const base: Project = {
  slug: "test",
  title: "Test Project",
  description: "A test project",
  technologies: ["TypeScript"],
};

describe("ProjectCard branches", () => {
  it("falls back to title for image alt", () => {
    render(<ProjectCard project={{ ...base, image: "/test.png" }} index={0} />);
    expect(screen.getByRole("img")).toHaveAttribute("alt", "Test Project");
  });

  it("renders secondary GitHub button when url and github both exist", () => {
    render(
      <ProjectCard
        project={{
          ...base,
          url: "https://example.com",
          github: "https://github.com/example",
        }}
        index={0}
      />,
    );
    const links = screen.getAllByRole("link", { name: /github/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it("still renders the Details link with no external url or github", () => {
    render(<ProjectCard project={base} index={0} />);
    expect(
      screen.getByRole("link", {
        name: /view details about test project/i,
      }),
    ).toHaveAttribute("href", "/projects/test");
  });
});
