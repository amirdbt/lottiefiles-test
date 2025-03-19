import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import { vi } from "vitest";
import { MachineContext } from "../context/MachineContext";

vi.mock("../context/MachineContext", () => ({
  MachineContext: {
    Provider: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    useSelector: vi.fn(() => ({})), // Mock selector hook to return default state
    useActorRef: vi.fn(() => ({ send: vi.fn() })), // Mock actor ref with 'send' method
  },
}));

// Mock lazy-loaded components
vi.mock("../components/players/DotLottiePlayer", () => ({
  default: () => <div data-testid="dotLottiePlayer">DotLottie Player</div>,
}));

vi.mock("../components/players/LottieWebPlayer", () => ({
  default: () => <div data-testid="lottieWebPlayer">LottieWeb Player</div>,
}));

vi.mock("../components/Skeleton", () => ({
  default: () => <div data-testid="skeleton">Loading...</div>,
}));

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const renderWithProvider = () =>
    render(
      <MachineContext.Provider>
        <Home />
      </MachineContext.Provider>,
    );

  it("renders ControlPanel, GlobalControls, and 4 player containers", () => {
    renderWithProvider();

    expect(screen.getByText("Upload file")).toBeInTheDocument();
    expect(screen.getByText("Global Control")).toBeInTheDocument();

    const playerContainers = screen.getAllByText("No player selected");
    expect(playerContainers).toHaveLength(4);
  });

  it("displays 'No player selected' by default", () => {
    renderWithProvider();
    expect(screen.getAllByText("No player selected")).toHaveLength(4);
  });

  it("renders DotLottiePlayer when 'dotlottie-web' is selected", async () => {
    renderWithProvider();

    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "dotLottie" } });

    // Verify skeleton appears first
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();

    // Wait for lazy-loaded component to appear
    await waitFor(() => {
      expect(screen.getByTestId("dotLottiePlayer")).toBeInTheDocument();
    });
  });

  it("renders LottieWebPlayer when 'lottie-web' is selected", async () => {
    renderWithProvider();

    const select = screen.getAllByRole("combobox")[1];
    fireEvent.change(select, { target: { value: "lottieWeb" } });

    // Verify skeleton appears first
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();

    // Wait for lazy-loaded component to appear
    await waitFor(() => {
      expect(screen.getByTestId("lottieWebPlayer")).toBeInTheDocument();
    });
  });

  it("updates state correctly when player type is changed", async () => {
    renderWithProvider();

    const select = screen.getAllByRole("combobox")[0];
    fireEvent.change(select, { target: { value: "dotLottie" } });

    await waitFor(() => {
      expect(screen.getByTestId("dotLottiePlayer")).toBeInTheDocument();
    });

    fireEvent.change(select, { target: { value: "lottieWeb" } });

    await waitFor(() => {
      expect(screen.getByTestId("lottieWebPlayer")).toBeInTheDocument();
    });
  });
});
