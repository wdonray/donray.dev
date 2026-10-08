import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "./footer";

describe("Footer", () => {
  it("shows the copyright with the current year", () => {
    render(<Footer />);
    expect(
      screen.getByText(`© ${new Date().getFullYear()} Donray Williams`),
    ).toBeInTheDocument();
  });

  it("links to the site pages", () => {
    render(<Footer />);
    const analytics = screen.getByRole("link", { name: "Analytics" });
    expect(analytics).toHaveAttribute("href", "/analytics");

    const version = screen.getByRole("link", { name: "Version" });
    expect(version).toHaveAttribute("href", "/version");
  });

  it("links to social profiles", () => {
    render(<Footer />);
    const github = screen.getByRole("link", { name: "Visit GitHub profile" });
    expect(github).toHaveAttribute("href", "https://github.com/wdonray");
    expect(github).toHaveAttribute("target", "_blank");

    const linkedin = screen.getByRole("link", {
      name: "Visit LinkedIn profile",
    });
    expect(linkedin).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/donrayxwilliams/",
    );

    const email = screen.getByRole("link", { name: "Visit Email profile" });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });

  it("links to Buy Me A Coffee in a new tab", () => {
    render(<Footer />);
    const coffee = screen.getByRole("link", { name: "Buy me a coffee" });
    expect(coffee).toHaveAttribute(
      "href",
      "https://buymeacoffee.com/donrayxwils",
    );
    expect(coffee).toHaveAttribute("target", "_blank");
    expect(coffee).toHaveAttribute("rel", "noopener noreferrer");
  });
});
