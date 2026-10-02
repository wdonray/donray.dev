import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Header from "./header";

describe("Header", () => {
  it("renders the brand link to the hero", () => {
    render(<Header />);
    const brand = screen.getByRole("link", { name: "Go to homepage" });
    expect(brand).toHaveAttribute("href", "/#hero");
    expect(brand).toHaveTextContent("donray.dev");
  });

  it("renders section navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "View skills section" })).toHaveAttribute(
      "href",
      "/#skills",
    );
    expect(
      screen.getByRole("link", { name: "View projects section" }),
    ).toHaveAttribute("href", "/#projects");
    expect(
      screen.getByRole("link", { name: "View experience section" }),
    ).toHaveAttribute("href", "/#experience");
  });

  it("renders external contact links", () => {
    render(<Header />);
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
    expect(linkedin).toHaveAttribute("target", "_blank");

    const email = screen.getByRole("link", { name: "Contact via email" });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
    expect(email).not.toHaveAttribute("target");
  });

  it("renders theme toggles for desktop and mobile", () => {
    render(<Header />);
    expect(
      screen.getAllByRole("button", { name: "Toggle theme" }),
    ).toHaveLength(2);
  });

  it("renders a mobile menu trigger", () => {
    render(<Header />);
    expect(
      screen.getByRole("button", { name: "Open menu" }),
    ).toBeInTheDocument();
  });
});
