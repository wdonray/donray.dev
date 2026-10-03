import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders as span by default", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New").tagName).toBe("SPAN");
  });

  it("renders as child slot when asChild", () => {
    render(
      <Badge asChild>
        <span data-testid="child">Child badge</span>
      </Badge>,
    );
    const el = screen.getByTestId("child");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-slot", "badge");
  });
});
