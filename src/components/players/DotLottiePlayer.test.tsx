import { render } from "@testing-library/react";
import { vi } from "vitest";
import { MachineContext } from "../../context/MachineContext";
import DotLottiePlayer from "./DotLottiePlayer";

vi.mock("../../context/MachineContext", () => ({
  MachineContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSelector: vi.fn(() => ({ file: new Blob() })), // Mock Blob
    useActorRef: vi.fn(() => ({ send: vi.fn() })), // Mock actor ref
  },
}));

describe("DotLottiePlayer", () => {
  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => "mocked-object-url");
  });

  afterEach(() => {
    vi.restoreAllMocks(); // Reset mocks after each test
  });

  it("renders without crashing", () => {
    render(
      <MachineContext.Provider>
        <DotLottiePlayer playerId="player1" />
      </MachineContext.Provider>,
    );
  });
});
