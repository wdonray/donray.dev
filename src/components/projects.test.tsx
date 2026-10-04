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

  it("renders all four projects", () => {
    render(<Projects />);
    for (const title of [
      "pico.domains",
      "Cyclei",
      "Hide Zero Cards",
      "donray.dev",
    ]) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("links site projects to their websites", () => {
    render(<Projects />);
    const links = screen.getAllByRole("link", {
      name: /visit site/i,
    });
    const pico = links.find(
      (l) => l.getAttribute("href") === "https://www.pico.domains/",
    );
    expect(pico).toBeDefined();
    expect(pico).toHaveAttribute("target", "_blank");
    expect(pico).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links the repo-only project to GitHub", () => {
    render(<Projects />);
    const links = screen.getAllByRole("link", {
      name: /view on github/i,
    });
    const repo = links.find(
      (l) =>
        l.getAttribute("href") === "https://github.com/wdonray/donray.dev",
    );
    expect(repo).toBeDefined();
  });

  it("renders technology badges", () => {
    render(<Projects />);
    expect(screen.getByText("Nuxt.js")).toBeInTheDocument();
    expect(screen.getByText("GraphQL")).toBeInTheDocument();
    // "Tailwind CSS" is listed on two projects
    expect(screen.getAllByText("Tailwind CSS")).toHaveLength(2);
  });

  it("renders project subtitles", () => {
    render(<Projects />);
    expect(
      screen.getByText("Ultra-Short Domain Search Engine"),
    ).toBeInTheDocument();
  });
});
