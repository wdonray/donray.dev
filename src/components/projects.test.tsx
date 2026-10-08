import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Projects from "./projects";

describe("Projects", () => {
  it("renders the section heading", () => {
    render(<Projects />);
    expect(
      screen.getByRole("heading", { name: "Projects" }),
    ).toBeInTheDocument();
  });

  it("renders all five projects", () => {
    render(<Projects />);
    for (const title of [
      "pico.domains",
      "Cyclei",
      "Hide Zero Cards",
      "PatternSpell",
      "donray.dev",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("lists active projects before past projects", () => {
    render(<Projects />);
    const pastHeading = screen.getByRole("heading", {
      name: "Past projects",
    });
    expect(pastHeading).toBeInTheDocument();
    // Active projects come before the "Past projects" heading...
    for (const title of ["Hide Zero Cards", "PatternSpell", "donray.dev"]) {
      expect(screen.getByText(title).compareDocumentPosition(pastHeading)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING,
      );
    }
    // ...and discontinued projects come after it.
    for (const title of ["pico.domains", "Cyclei"]) {
      expect(screen.getByText(title).compareDocumentPosition(pastHeading)).toBe(
        Node.DOCUMENT_POSITION_PRECEDING,
      );
    }
  });

  it("links site projects to their websites", () => {
    render(<Projects />);
    const links = screen.getAllByRole("link", {
      name: /visit site/i,
    });
    const site = links.find(
      (l) => l.getAttribute("href") === "https://hidezerocards.org",
    );
    expect(site).toBeDefined();
    expect(site).toHaveAttribute("target", "_blank");
    expect(site).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the repo-only project to GitHub", () => {
    render(<Projects />);
    const links = screen.getAllByRole("link", {
      name: /view on github/i,
    });
    const repo = links.find(
      (l) => l.getAttribute("href") === "https://github.com/wdonray/donray.dev",
    );
    expect(repo).toBeDefined();
  });

  it("renders technology badges", () => {
    render(<Projects />);
    expect(screen.getByText("Nuxt.js")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    // "Tailwind CSS" is listed on three projects
    expect(screen.getAllByText("Tailwind CSS")).toHaveLength(3);
  });

  it("renders project subtitles", () => {
    render(<Projects />);
    expect(
      screen.getByText("Ultra-Short Domain Search Engine"),
    ).toBeInTheDocument();
  });
});
