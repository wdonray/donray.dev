import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet primitives", () => {
  it("renders footer, title, description, and close", () => {
    render(
      <Sheet open>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetHeader>
          <SheetFooter>Footer</SheetFooter>
          <SheetClose>Close</SheetClose>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open</SheetTrigger>
      </Sheet>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it.each(["left", "top", "bottom", "right"] as const)(
    "renders side=%s",
    (side) => {
      const { unmount } = render(
        <Sheet open>
          <SheetContent side={side}>Content</SheetContent>
        </Sheet>,
      );
      expect(screen.getByText("Content")).toBeInTheDocument();
      unmount();
    },
  );
});
