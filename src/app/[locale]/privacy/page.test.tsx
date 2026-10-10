import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage, { generateMetadata } from "./page";

const params = Promise.resolve({ locale: "en" });

describe("PrivacyPage", () => {
  it("returns empty metadata for an unknown locale", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "xx" }),
    });
    expect(metadata).toEqual({});
  });

  it("notFounds for an unknown locale", async () => {
    await expect(
      PrivacyPage({ params: Promise.resolve({ locale: "xx" }) }),
    ).rejects.toThrow();
  });

  it("has the expected metadata", async () => {
    const metadata = await generateMetadata({ params });
    expect(metadata.title).toBe("Privacy Policy");
    expect(metadata.alternates?.canonical).toBe("/privacy");
  });

  it("renders the heading and effective date", async () => {
    render(await PrivacyPage({ params }));
    expect(
      screen.getByRole("heading", { name: "Privacy Policy", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Effective October 10, 2026/)).toBeInTheDocument();
  });

  it("discloses the analytics methodology", async () => {
    render(await PrivacyPage({ params }));
    expect(
      screen.getByRole("heading", { name: "What this site collects" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/salted SHA-256 hash/)).toBeInTheDocument();
    expect(screen.getByText(/No cookies are set/)).toBeInTheDocument();
  });

  it("covers retention, third parties, rights, and children", async () => {
    render(await PrivacyPage({ params }));
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

  it("links the contact email", async () => {
    render(await PrivacyPage({ params }));
    const email = screen.getByRole("link", {
      name: "donrayxwilliams@gmail.com",
    });
    expect(email).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });
});
