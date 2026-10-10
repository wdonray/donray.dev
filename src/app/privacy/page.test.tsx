import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { metadata } from "./page";

describe("PrivacyPage", () => {
  it("has the expected metadata", () => {
    expect(metadata.title).toBe("Privacy Policy");
    expect(metadata.alternates?.canonical).toBe("/privacy");
  });

  it("renders the heading and effective date", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: "Privacy Policy", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective October 10, 2026/)).toBeInTheDocument();
  });

  it("discloses the analytics methodology", () => {
    render(<PrivacyPage />);
    expect(
      screen.getByRole("heading", { name: "What this site collects" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/salted SHA-256 hash/)).toBeInTheDocument();
    expect(screen.getByText(/No cookies are set/)).toBeInTheDocument();
  });

  it("covers retention, third parties, rights, and children", () => {
    render(<PrivacyPage />);
    for (const heading of [
      "How long it is kept",
      "Third parties",
      "Your rights",
      "Children",
      "Changes to this policy",
    ]) {
      expect(
        screen.getByRole("heading", { name: heading }),
      ).toBeInTheDocument();
    }
  });

  it("links the contact email", () => {
    render(<PrivacyPage />);
    const email = screen.getByRole("link", {
      name: "donrayxwilliams@gmail.com",
    });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });
});
