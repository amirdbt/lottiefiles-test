import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tooltip from "./Tooltip";
import { expect } from "vitest";

describe("Tooltip", () => {
  it("should have css class hidden by default tp hide it", () => {
    render(
      <Tooltip text="Sample Tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );
    const tooltipText = screen.getByText("Sample Tooltip");
    expect(tooltipText).toHaveClass("hidden");
  });

  it("should display the tooltip text on hover", async () => {
    render(
      <Tooltip text="Sample Tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );

    const user = userEvent.setup();

    const triggerElement = screen.getByText("Hover me");

    // Hover over the element
    await user.hover(triggerElement);

    const tooltipText = screen.getByText("Sample Tooltip");
    expect(tooltipText).toBeVisible(); // Tooltip should appear on hover
  });

  it("should hide the tooltip text when the mouse moves away", async () => {
    render(
      <Tooltip text="Sample Tooltip">
        <button>Hover me</button>
      </Tooltip>,
    );

    const user = userEvent.setup();

    const triggerElement = screen.getByText("Hover me");

    // Hover and then move away
    await user.hover(triggerElement);
    await user.unhover(triggerElement);

    const tooltipText = screen.queryByText("Sample Tooltip");
    expect(tooltipText).toHaveClass("hidden");
  });
});
