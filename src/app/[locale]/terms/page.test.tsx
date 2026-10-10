import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TermsPage, { generateMetadata } from "./page";

const params = Promise.resolve({ locale: "en" });

describe("TermsPage", () => {
  it("returns empty metadata for an unknown locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "xx" }),
    });
    expect(metadata).toEqual({});
  });

  it("notFounds for an unknown locale", async () => {
    await expect(
      TermsPage({ params: Promise.resolve({ locale: "xx" }) }),
    ).rejects.toThrow();
  });

  it("has the expected metadata", async () => {
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe("Terms of Use");
    expect(metadata.alternates?.canonical).toBe("/terms");
  });

  it("renders the heading and effective date", async () => {
    render(await TermsPage({ params }));
    expect(
      screen.getByRole("heading", { name: "Terms of Use", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective October 10, 2026/)).toBeInTheDocument();
  });

  it("covers ownership, acceptable use, and liability", async () => {
    render(await TermsPage({ params }));
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

  it("calls out analytics API abuse in acceptable use", async () => {
    render(await TermsPage({ params }));
    expect(screen.getByText(/\/api\/track/)).toBeInTheDocument();
    expect(screen.getByText(/inflating page view/)).toBeInTheDocument();
  });

  it("names New Jersey as governing law", async () => {
    render(await TermsPage({ params }));
    expect(screen.getByText(/State of New Jersey/)).toBeInTheDocument();
  });

  it("links the contact email", async () => {
    render(await TermsPage({ params }));
    const email = screen.getByRole("link", {
      name: "donrayxwilliams@gmail.com",
    });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });
});
