import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Hero from "./hero";

describe("Hero", () => {
  it("introduces Donray by name and role", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { name: /hi, i'm donray$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Engineering Manager" }),
    ).toBeInTheDocument();
  });

  it("shows years of experience since 2019", () => {
    render(<Hero />);
    const years = new Date().getFullYear() - 2019;
    expect(screen.getByText(`${years}+ years`)).toBeInTheDocument();
  });

  it("links to the hosted resume PDF", () => {
    render(<Hero />);
    const resume = screen.getByRole("link", { name: "View Resume" });
    expect(resume).toHaveAttribute(
      "href",
      "https://donray-public.s3.us-east-1.amazonaws.com/Donray+Williams+Frontend+Engineer.pdf",
    );
    expect(resume).toHaveAttribute("target", "_blank");
    expect(resume).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("links to contact via email", () => {
    render(<Hero />);
    const contact = screen.getByRole("link", { name: "Contact via email" });
    expect(contact).toHaveAttribute("href", "mailto:donrayxwilliams@gmail.com");
  });

  it("renders the headshot", () => {
    render(<Hero />);
    expect(screen.getByAltText("Donray Williams")).toBeInTheDocument();
  });
});
