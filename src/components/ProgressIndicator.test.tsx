import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MachineContext } from "../context/MachineContext";
import ProgressIndicator from "./ProgressIndicator";

vi.mock("../context/MachineContext", () => ({
  MachineContext: {
    useActorRef: vi.fn(),
    useSelector: vi.fn(),
  },
}));

describe("ProgressIndicator", () => {
  const mockSend = vi.fn();

  beforeEach(() => {
    //@ts-expect-error :""
    vi.mocked(MachineContext.useActorRef).mockReturnValue({ send: mockSend });
    vi.mocked(MachineContext.useSelector).mockImplementation((selector) =>
      selector({
        context: {
          players: {
            //@ts-expect-error :""
            player1: {
              currentTime: 50,
              ref: {
                totalFrames: 100,
                setFrame: vi.fn(),
                gotoFrame: vi.fn(),
              },
            },
          },
        },
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the progress bar with the correct width", () => {
    render(<ProgressIndicator id="player1" type="dotLottie" />);
    const innerDiv = screen.getByTestId("innerDiv");
    expect(innerDiv).toHaveStyle({ width: "51%" }); // (50 + 1) / 100 * 100 = 51%
  });

  it("should display the formatted current time and total frames", () => {
    render(<ProgressIndicator id="player1" type="dotLottie" />);
    expect(screen.getByText("50:100")).toBeInTheDocument();
  });
});
