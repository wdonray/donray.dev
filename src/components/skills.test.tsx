import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Skills from "./skills";

describe("Skills", () => {
  it("renders the section heading", () => {
    render(<Skills />);
    expect(
      screen.getByRole("heading", { name: "Skills & Expertise" }),
    ).toBeInTheDocument();
  });

  it("renders all six skill categories", () => {
    render(<Skills />);
    for (const category of [
      "Frontend Development",
      "Backend & APIs",
      "Testing & Quality",
      "Platform & DevOps",
      "UI & Web Standards",
      "Leadership & Craft",
    ]) {
      expect(
        screen.getByRole("heading", { name: category }),
      ).toBeInTheDocument();
    }
  });

  it("renders representative skills", () => {
    render(<Skills />);
    expect(screen.getByText("Vitest")).toBeInTheDocument();
    expect(screen.getByText("Playwright")).toBeInTheDocument();
    expect(screen.getByText("Team Leadership")).toBeInTheDocument();
    expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
  });

  it("lists the verified stack additions", () => {
    render(<Skills />);
    for (const skill of [
      "Ruby",
      "Rails",
      "MySQL",
      "Testing Library",
      "GitHub Actions",
      "Datadog",
      "AWS S3",
      "Storybook",
      "Vue Router",
      "Vue I18n",
    ]) {
      expect(screen.getByText(skill)).toBeInTheDocument();
    }
  });

  it("omits unverified skills", () => {
    render(<Skills />);
    for (const skill of ["React", "Next.js", "Docker", "GraphQL", "Helm"]) {
      expect(screen.queryByText(skill)).not.toBeInTheDocument();
    }
  });
});
