import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MachineContext } from "../context/MachineContext";
import ControlPanel from "./ControlPanel";

vi.mock("../context/MachineContext", () => ({
  MachineContext: {
    useSelector: vi.fn(),
    useActorRef: vi.fn(),
  },
}));

describe("ControlPanel", () => {
  const mockSend = vi.fn();

  beforeEach(() => {
    vi.mocked(MachineContext.useSelector).mockImplementation((selector) =>
      selector({
        //@ts-expect-error :""
        context: {
          file: null,
          error: null,
        },
      }),
    );
    // @ts-expect-error :""
    vi.mocked(MachineContext.useActorRef).mockReturnValue({
      send: mockSend,
    });
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should open and close the modal", () => {
    render(<ControlPanel />);
    const uploadButton = screen.getByText(/upload file/i);

    // to open modal
    fireEvent.click(uploadButton);
    expect(screen.getByText(/upload a file 😊/i)).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByTestId("close");
    fireEvent.click(closeButton);
    expect(screen.queryByText(/upload a file 😊/i)).not.toBeInTheDocument();
  });

  test("should call 'RETRY' when opening the modal if there’s an error", () => {
    vi.mocked(MachineContext.useSelector).mockImplementation((selector) =>
      selector({
        //@ts-expect-error :""
        context: {
          file: null,
          error: "File size exceeds limit",
        },
      }),
    );

    render(<ControlPanel />);

    const uploadButton = screen.getByText(/upload file/i);

    fireEvent.click(uploadButton);

    expect(mockSend).toHaveBeenCalledWith({ type: "RETRY" });
  });

  test("should call 'LOAD_FILE' when a file is uploaded", async () => {
    render(<ControlPanel />);

    const uploadButton = screen.getByText(/upload file/i);
    fireEvent.click(uploadButton);

    const fileInput = screen.getByTestId("upload-card").querySelector("input");

    const mockFile = new File(["test"], "sample.lottie", {
      type: "application/json",
    });

    // Fire the file drop event
    await waitFor(() => {
      fireEvent.change(fileInput as HTMLInputElement, {
        target: { files: [mockFile] },
      });
    });

    expect(mockSend).toHaveBeenCalledWith({
      type: "LOAD_FILE",
      file: mockFile,
    });
  });
  test("should display the file name when a file is uploaded successfully", async () => {
    render(<ControlPanel />);

    const uploadButton = screen.getByText(/upload file/i);
    fireEvent.click(uploadButton);

    const fileInput = screen.getByTestId("upload-card").querySelector("input");
    const mockFile = new File(["test"], "sample.lottie", {
      type: "application/json",
    });

    await waitFor(() => {
      fireEvent.change(fileInput as HTMLInputElement, {
        target: { files: [mockFile] },
      });
    });

    expect(
      screen.getByText(/file loaded: sample\.lottie/i),
    ).toBeInTheDocument();
  });
});
