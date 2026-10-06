import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageViewsByPage } from "./page-views-by-page";
import type { PageStat } from "@/lib/analytics";

function pageStat(path: string, totalViews: number, uniques: number): PageStat {
  return { path, totalViews, uniques, daily: [] };
}

describe("PageViewsByPage", () => {
  it("renders nothing when there are no pages", () => {
    const { container } = render(<PageViewsByPage pages={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders one row per page with views and uniques", () => {
    render(
      <PageViewsByPage
        pages={[
          pageStat("/", 1234, 56),
          pageStat("/analytics", 78, 9),
          pageStat("/version", 1, 1),
        ]}
      />,
    );

    expect(screen.getByText("Page views by page")).toBeVisible();
    expect(screen.getByText("All time, most viewed first")).toBeVisible();

    const table = screen.getByRole("table");
    const headers = within(table).getAllByRole("columnheader");
    expect(headers.map((h) => h.textContent)).toEqual([
      "Page",
      "Page views",
      "Unique visitors",
    ]);

    const rows = within(table).getAllByRole("row");
    // Header row + one row per page.
    expect(rows).toHaveLength(4);

    const bodyRows = rows.slice(1);
    expect(
      bodyRows.map((r) => within(r).getAllByRole("cell")[0].textContent),
    ).toEqual(["/", "/analytics", "/version"]);
    expect(
      bodyRows.map((r) => within(r).getAllByRole("cell")[1].textContent),
    ).toEqual(["1,234", "78", "1"]);
    expect(
      bodyRows.map((r) => within(r).getAllByRole("cell")[2].textContent),
    ).toEqual(["56", "9", "1"]);
  });

  it("renders pages in the order given (parent sorts most-viewed first)", () => {
    render(
      <PageViewsByPage pages={[pageStat("/b", 2, 2), pageStat("/a", 10, 5)]} />,
    );

    const rows = screen.getAllByRole("row").slice(1);
    expect(
      rows.map((r) => within(r).getAllByRole("cell")[0].textContent),
    ).toEqual(["/b", "/a"]);
  });
});
