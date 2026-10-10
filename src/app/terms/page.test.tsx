import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPage, { metadata } from "./page";

describe("TermsPage", () => {
  it("has the expected metadata", () => {
    expect(metadata.title).toBe("Terms of Use");
    expect(metadata.alternates?.canonical).toBe("/terms");
  });

  it("renders the heading and effective date", () => {
    render(<TermsPage />);
    expect(
      screen.getByRole("heading", { name: "Terms of Use", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective October 10, 2026/)).toBeInTheDocument();
  });

  it("covers ownership, acceptable use, and liability", () => {
    render(<TermsPage />);
    for (const heading of [
      "Content ownership",
      "Acceptable use",
      "Disclaimers",
      "Limitation of liability",
      "Third-party links",
      "Governing law",
      "Changes to these terms",
    ]) {
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("calls out analytics API abuse in acceptable use", () => {
    render(<TermsPage />);
    expect(screen.getByText(/\/api\/track/)).toBeInTheDocument();
    expect(screen.getByText(/inflating page view/)).toBeInTheDocument();
  });

  it("names New Jersey as governing law", () => {
    render(<TermsPage />);
    expect(screen.getByText(/State of New Jersey/)).toBeInTheDocument();
  });

  it("links the contact email", () => {
    render(<TermsPage />);
    const email = screen.getByRole("link", {
      name: "donrayxwilliams@gmail.com",
    });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });
});
