import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "./dropdown-menu";

async function openMenu() {
  const user = userEvent.setup();
  render(
    <DropdownMenu>
      <DropdownMenuTrigger>Open</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Group</DropdownMenuLabel>
          <DropdownMenuItem>Item</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>
            Check
            <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem value="a">Radio</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>Sub item</DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>,
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  return user;
}

describe("DropdownMenu primitives", () => {
  it("opens and renders items, labels, and shortcuts", async () => {
    await openMenu();
    expect(screen.getByRole("menuitem", { name: "Item" })).toBeInTheDocument();
    expect(screen.getByText("Group")).toBeInTheDocument();
    expect(screen.getByText("⌘C")).toBeInTheDocument();
  });

  it("renders checkbox and radio items", async () => {
    await openMenu();
    expect(
      screen.getByRole("menuitemcheckbox", { name: /Check/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitemradio", { name: "Radio" }),
    ).toBeInTheDocument();
  });

  it("opens a submenu", async () => {
    const user = await openMenu();
    await user.hover(screen.getByRole("menuitem", { name: "More" }));
    expect(await screen.findByText("Sub item")).toBeInTheDocument();
  });

  it("selects an item on click", async () => {
    const user = await openMenu();
    await user.click(screen.getByRole("menuitem", { name: "Item" }));
    expect(
      screen.queryByRole("menuitem", { name: "Item" }),
    ).not.toBeInTheDocument();
  });
});
