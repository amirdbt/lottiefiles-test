import { createActor } from "xstate";
import animationMachine from "./animationMachine";
import { playerStatus } from "../constants";

describe("animationMachine", () => {
  let actor: ReturnType<typeof createActor>;

  beforeEach(() => {
    actor = createActor(animationMachine).start();
  });
  afterEach(() => {
    actor.stop();
  });

  test("should initialize in the 'idle' state", () => {
    expect(actor.getSnapshot().value).toBe(playerStatus.idle);
  });

  describe("LOAD_FILE transitions", () => {
    test("should transition to 'loading' when a valid file is loaded", async () => {
      const validFile = new File(["test content"], "animation.lottie", {
        type: "application/json",
      });
      actor.send({ type: "LOAD_FILE", file: validFile });
      expect(actor.getSnapshot().value).toBe(playerStatus.loading);
    });

    test("should transition to 'error' if file is too large", async () => {
      const largeFile = new File(
        ["test".repeat(6 * 1024 * 1024)],
        "large.lottie",
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
      actor.send({ type: "LOAD_FILE", file: largeFile });
      expect(actor.getSnapshot().value).toBe(playerStatus.error);
      expect(actor.getSnapshot().context.error).toBe(
        "File size exceeds 5MB limit",
      );
    }, 10000);

    test("should transition to 'error' if file is missing", () => {
      actor.send({ type: "LOAD_FILE", file: null });
      expect(actor.getSnapshot().value).toBe(playerStatus.error);
      expect(actor.getSnapshot().context.error).toBe("No file selected.");
    });

    test("should transition to 'error' if file type is invalid", () => {
      const invalidFile = new File(["content"], "invalid.txt");

      actor.send({ type: "LOAD_FILE", file: invalidFile });
      expect(actor.getSnapshot().value).toBe("error");
      expect(actor.getSnapshot().context.error).toBe(
        "Invalid file type. Please upload a .lottie file.",
      );
    });
  });

  describe("Error handling", () => {
    test("should clear errors when RETRY is sent", () => {
      actor.send({ type: "LOAD_FILE", file: null });
      actor.send({ type: "RETRY" });

      expect(actor.getSnapshot().value).toBe(playerStatus.idle);
      expect(actor.getSnapshot().context.error).toBeNull();
    });
  });

  describe("Progress Tracking", () => {
    beforeEach(() => {
      actor.send({
        type: "REGISTER_PLAYER",
        id: "player1",
        ref: { currentFrame: 0, totalFrames: 100 },
      });
      actor.send({ type: "PLAY" });
    });
    test("should track progress and end animation at the final frame", async () => {
      const players = actor.getSnapshot().context.players;
      expect(players["player1"].currentTime).toBe(0);

      actor.send({
        type: "UPDATE_PROGRESS",
        id: "player1",
        currentTime: { player1: 99 },
      });
      await new Promise((resolve) => setTimeout(resolve, 0)); // Ensure async update completes

      actor.send({
        type: "ANIMATION_ENDED",
        id: "player1",
      });
      expect(actor.getSnapshot().context.players["player1"].currentTime).toBe(
        0,
      );
    });
  });
  describe("Player Controls", () => {
    const mockPlayer = {
      ref: { currentFrame: 0, totalFrames: 100 },
      currentTime: 0,
      isLooping: false,
      isPlaying: false,
      playbackSpeed: 1,
      status: playerStatus.idle,
      error: "",
    };

    beforeEach(() => {
      actor.send({
        type: "REGISTER_PLAYER",
        id: "player1",
        ref: mockPlayer.ref,
      });
    });

    test("should register a player successfully", () => {
      expect(actor.getSnapshot().context.players["player1"]).toEqual(
        mockPlayer,
      );
    });

    test("should handle PLAY correctly", () => {
      actor.send({ type: "PLAY", id: "player1" });

      expect(actor.getSnapshot().context.players["player1"].isPlaying).toBe(
        false,
      );
    });

    test("should handle PAUSE correctly", () => {
      actor.send({ type: "PLAY" });
      actor.send({ type: "PAUSE" });

      expect(actor.getSnapshot().context.players["player1"].isPlaying).toBe(
        false,
      );
    });

    test("should handle STOP correctly", () => {
      actor.send({ type: "PLAY" });
      actor.send({ type: "STOP" });

      expect(actor.getSnapshot().context.players["player1"].isPlaying).toBe(
        false,
      );
    });
  });
  describe("Global Controls", () => {
    beforeEach(() => {
      actor.send({
        type: "REGISTER_PLAYER",
        id: "player1",
        ref: { currentFrame: 0, totalFrames: 100 },
      });
      actor.send({
        type: "REGISTER_PLAYER",
        id: "player2",
        ref: { currentFrame: 0, totalFrames: 100 },
      });
    });

    test("should handle PAUSE_ALL correctly", () => {
      actor.send({ type: "PLAY_ALL" });
      actor.send({ type: "PAUSE_ALL" });

      const players = actor.getSnapshot().context.players;
      expect(players["player1"].isPlaying).toBe(false);
      expect(players["player2"].isPlaying).toBe(false);
    });

    test("should handle STOP_ALL correctly", () => {
      actor.send({ type: "PLAY_ALL" });
      actor.send({ type: "STOP_ALL" });

      const players = actor.getSnapshot().context.players;
      expect(players["player1"].isPlaying).toBe(false);
      expect(players["player2"].isPlaying).toBe(false);
    });
  });
});
