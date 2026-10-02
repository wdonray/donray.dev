import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Experience from "./experience";

describe("Experience", () => {
  it("renders the section heading", () => {
    render(<Experience />);
    expect(
      screen.getByRole("heading", { name: "Experience" }),
    ).toBeInTheDocument();
  });

  it("shows the four most recent companies up front", () => {
    render(<Experience />);
    expect(
      screen.getByRole("heading", { name: "Justworks" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cyclei" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Leaflink" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Stuller, Inc." }),
    ).toBeInTheDocument();
  });

  it("hides earlier experience until expanded", () => {
    render(<Experience />);
    expect(
      screen.queryByRole("heading", { name: "Gemvision Corporation" }),
    ).not.toBeInTheDocument();
  });

  it("marks the current role at Justworks", () => {
    render(<Experience />);
    expect(screen.getByText("Current")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Engineering Manager" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jun 2026 – Present")).toBeInTheDocument();
  });

  it("collapses Justworks to the two resume roles", () => {
    render(<Experience />);
    expect(
      screen.getByRole("heading", { name: "Engineering Manager" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jan 2023 – Jun 2026")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Software Engineer" }),
    ).not.toBeInTheDocument();
  });

  it("describes the Engineering Manager role", () => {
    render(<Experience />);
    expect(
      screen.getByText(
        /player-coach leading frontend for onboarding and billing/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/6,800\+ people/i)).toBeInTheDocument();
  });

  it("shows Leaflink starting April 2022", () => {
    render(<Experience />);
    expect(screen.getByText("Apr 2022 – Dec 2022")).toBeInTheDocument();
  });

  it("shows Justworks location and employment type", () => {
    render(<Experience />);
    expect(
      screen.getByText("Manhattan, New York, United States"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Full-time").length).toBeGreaterThan(0);
  });

  it("expands and collapses earlier experience", async () => {
    const user = userEvent.setup();
    render(<Experience />);

    const toggle = screen.getByRole("button", {
      name: /view earlier experience/i,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Gemvision Corporation" }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /hide earlier experience/i }),
    ).toHaveAttribute("aria-expanded", "true");

    await user.click(
      screen.getByRole("button", { name: /hide earlier experience/i }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Gemvision Corporation" }),
      ).not.toBeInTheDocument();
    });
  });
});
