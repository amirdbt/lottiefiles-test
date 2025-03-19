import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MachineContext } from "../context/MachineContext";
import AnimationControls from "./AnimationControls";
import { playerStatus } from "../constants";

vi.mock("../context/MachineContext", () => ({
  MachineContext: {
    useSelector: vi.fn(),
    useActorRef: vi.fn(() => ({ send: vi.fn() })),
  },
}));

describe("AnimationControls", () => {
  const mocksend = vi.fn();

  beforeEach(() => {
    vi.mocked(MachineContext.useSelector).mockImplementation((selector) =>
      selector({
        context: {
          players: {
            //@ts-expect-error :""
            player1: {
              currentTime: 50,
              playbackSpeed: 1,
              status: playerStatus.ready,
              isLooping: false,
            },
          },
        },
      }),
    );
    //@ts-expect-error :""
    vi.mocked(MachineContext.useActorRef).mockReturnValue({ send: mocksend });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  test("renders all controls", () => {
    render(<AnimationControls id="player1" type="lottie" />);
    const playPauseBtn = screen.getByTestId("playPause");
    const stop = screen.getByTestId("stop");
    const toggle_loop = screen.getByTestId("toggle_loop");
    const selectElement = screen.getByTestId("selectPlayback");

    expect(playPauseBtn).toBeInTheDocument();
    expect(stop).toBeInTheDocument();
    expect(toggle_loop).toBeInTheDocument();
    expect(selectElement).toBeInTheDocument();
  });

  test("handles play action correctly", () => {
    render(<AnimationControls id="player1" type="lottie" />);

    const playPauseBtn = screen.getByTestId("playPause");
    fireEvent.click(playPauseBtn);

    expect(mocksend).toHaveBeenCalledWith({ type: "PLAY", id: "player1" });
  });

  test("handles pause action correctly", () => {
    vi.mocked(MachineContext.useSelector).mockImplementation((selector) =>
      selector({
        context: {
          players: {
            //@ts-expect-error :""
            player1: {
              currentTime: 50,
              playbackSpeed: 1,
              status: playerStatus.playing,
              isLooping: false,
            },
          },
        },
      }),
    );

    render(<AnimationControls id="player1" type="lottie" />);
    const playPauseBtn = screen.getByTestId("playPause");

    fireEvent.click(playPauseBtn);

    expect(mocksend).toHaveBeenCalledWith({ type: "PAUSE", id: "player1" });
  });

  test("handles stop action correctly", () => {
    render(<AnimationControls id="player1" type="lottie" />);

    const stop = screen.getByTestId("stop");
    fireEvent.click(stop);

    expect(mocksend).toHaveBeenCalledWith({
      type: "STOP",
      id: "player1",
      currentTime: { player1: 0 },
    });
  });
  test("handles loop toggle correctly", () => {
    render(<AnimationControls id="player1" type="lottie" />);

    const toggle_loop = screen.getByTestId("toggle_loop");
    fireEvent.click(toggle_loop);

    expect(mocksend).toHaveBeenCalledWith({
      type: "TOGGLE_LOOP",
      id: "player1",
      currentTime: { player1: 50 },
    });
  });
  test("handles playback speed change correctly", () => {
    render(<AnimationControls id="player1" type="lottie" />);

    const selectElement = screen.getByTestId("selectPlayback");
    fireEvent.change(selectElement, { target: { value: "1.5" } });

    expect(mocksend).toHaveBeenCalledWith({
      type: "SET_SPEED",
      id: "player1",
      value: 1.5,
    });
  });
});
