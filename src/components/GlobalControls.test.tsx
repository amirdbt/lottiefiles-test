import { render, screen, fireEvent } from "@testing-library/react";
import { vi, Mock } from "vitest";
import GlobalControls from "./GlobalControls";
import { controlSource, playerStatus, seekType } from "../constants";
import { MachineContext } from "../context/MachineContext";
const mockSend = vi.fn();
vi.mock("../context/MachineContext", () => ({
  MachineContext: {
    useSelector: vi.fn(),
    useActorRef: () => ({ send: mockSend }),
  },
}));

describe("GlobalControls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should render the component correctly", () => {
    (MachineContext.useSelector as Mock)
      .mockReturnValueOnce(playerStatus.paused) // status
      .mockReturnValueOnce(controlSource.global) // source
      .mockReturnValueOnce(false); // isLooping

    render(<GlobalControls />);

    expect(screen.getByText("Global Control")).toBeInTheDocument();
    expect(screen.getByText("Playback Speed")).toBeInTheDocument();
  });

  test("should send STOP_ALL event when Stop button is clicked", () => {
    render(<GlobalControls />);
    const stopButton = screen.getByTestId("stop_all");

    fireEvent.click(stopButton);

    expect(mockSend).toHaveBeenCalledWith({ type: "STOP_ALL" });
  });

  test("should send SEEK_ALL event with 'start' when 'Go to start' is clicked", () => {
    render(<GlobalControls />);
    const goToStartButton = screen.getByTestId("seek_all_start");

    fireEvent.click(goToStartButton);

    expect(mockSend).toHaveBeenCalledWith({
      type: "SEEK_ALL",
      direction: seekType.start,
    });
  });

  test("should send PLAY_ALL event when Play button is clicked", () => {
    (MachineContext.useSelector as Mock)
      .mockReturnValueOnce(playerStatus.paused) // status
      .mockReturnValueOnce(controlSource.global); // source

    render(<GlobalControls />);
    const playButton = screen.getByTestId("playPause");

    fireEvent.click(playButton);

    expect(mockSend).toHaveBeenCalledWith({ type: "PLAY_ALL" });
  });

  test("should send PAUSE_ALL event when Pause button is clicked", () => {
    (MachineContext.useSelector as Mock)
      .mockReturnValueOnce(playerStatus.playing) // status
      .mockReturnValueOnce(controlSource.global); // source

    render(<GlobalControls />);
    const pauseButton = screen.getByTestId("playPause");

    fireEvent.click(pauseButton);

    expect(mockSend).toHaveBeenCalledWith({ type: "PAUSE_ALL" });
  });

  test("should send LOOP_ALL event when Loop button is clicked", () => {
    render(<GlobalControls />);
    const loopButton = screen.getByTestId("loop_all");

    fireEvent.click(loopButton);

    expect(mockSend).toHaveBeenCalledWith({ type: "LOOP_ALL" });
  });

  test("should update speed and send SET_GLOBAL_SPEED event when speed is changed", () => {
    render(<GlobalControls />);
    const speedSelect = screen.getByTestId("select_global_speed");

    fireEvent.change(speedSelect, { target: { value: "1.5" } });

    expect(mockSend).toHaveBeenCalledWith({
      type: "SET_GLOBAL_SPEED",
      value: 1.5,
    });
  });

  test("should show correct tooltip text for Play when paused", () => {
    (MachineContext.useSelector as Mock)
      .mockReturnValueOnce(playerStatus.paused) // status
      .mockReturnValueOnce(controlSource.global); // source

    render(<GlobalControls />);
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  test("should show correct tooltip text for Pause when playing", () => {
    (MachineContext.useSelector as Mock)
      .mockReturnValueOnce(playerStatus.playing) // status
      .mockReturnValueOnce(controlSource.global); // source

    render(<GlobalControls />);
    expect(screen.getByText("Pause")).toBeInTheDocument();
  });
});
