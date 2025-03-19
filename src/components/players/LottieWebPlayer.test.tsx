import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MachineContext } from "../../context/MachineContext";
import LottieWebPlayer from "./LottieWebPlayer";

// Mock `lottie-web` to prevent actual rendering errors
vi.mock("lottie-web", () => ({
  default: {
    loadAnimation: vi.fn(() => ({
      play: vi.fn(),
      pause: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
      setLoop: vi.fn(),
      setSpeed: vi.fn(),
    })),
  },
}));

// Mock `MachineContext`
vi.mock("../../context/MachineContext", () => ({
  MachineContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSelector: vi.fn((selector) =>
      selector({
        context: {
          file: new File(["{}"], "test.json", { type: "application/json" }), // Mock a JSON file
          players: {
            player1: {
              isLooping: false,
              playbackSpeed: 1,
              status: "stopped",
              error: null,
            },
          },
        },
        value: "ready",
      }),
    ),
    useActorRef: vi.fn(() => ({ send: vi.fn() })),
  },
}));

beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => "mocked-object-url");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("LottieWebPlayer", () => {
  it("renders without crashing", () => {
    render(
      <MachineContext.Provider>
        <LottieWebPlayer playerId="player1" />
      </MachineContext.Provider>,
    );

    expect(screen.getByText("LottieWeb Player")).toBeInTheDocument();
  });
});
