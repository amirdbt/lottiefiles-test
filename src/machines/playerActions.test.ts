import { playerStatus, controlSource, seekType } from "../constants";
import { describe, expect, it } from "vitest";
import {
  handlePlay,
  handlePause,
  handleToggleLoop,
  handleStop,
  updatePlayerProgress,
  handleSetSpeed,
  handlePlayAll,
  handlePauseAll,
  handleStopAll,
  handleSeekAll,
  handleSetGlobalSpeed,
  handleLoopAll,
} from "./playerActions";
import { AnimationContext } from "./animationMachine.types";

const mockContext: AnimationContext = {
  players: {
    player1: {
      ref: { totalFrames: 100 }, // The player instance
      isPlaying: false, // Tracks play/pause state
      isLooping: false,
      playbackSpeed: 1,
      currentTime: 0,
      status: playerStatus.ready,
      error: "",
    },
    player2: {
      ref: { totalFrames: 100 }, // The player instance
      isPlaying: false, // Tracks play/pause state
      isLooping: false,
      playbackSpeed: 1,
      currentTime: 0,
      status: playerStatus.ready,
      error: "",
    },
  },
  isLooping: false,
  file: new File([], "mockFile"),
  error: "",
  globalSpeed: 1,
  source: "",
};

describe("handlePlay", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: { ...mockContext.players.player1, status: playerStatus.idle },
      player2: { ...mockContext.players.player2, status: playerStatus.stopped },
    },
  };
  it("should update the specified player to 'playing' status", () => {
    const result = handlePlay({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players?.player1?.isPlaying).toBe(true);
    expect(result.players?.player1.status).toBe(playerStatus.playing);
  });

  it("should not modify other players", () => {
    const result = handlePlay({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players.player2.isPlaying).toBe(false);
    expect(result.players.player2.status).toBe(playerStatus.stopped);
  });

  it("should set the source to 'individual'", () => {
    const result = handlePlay({
      context: mockContext,
      event: { id: "player1" },
    });

    expect(result.source).toBe(controlSource.individual);
  });
});
describe("handlePause", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: true,
        status: playerStatus.playing,
      },
    },
  };

  it("should update the specified player to 'pause' status", () => {
    const result = handlePause({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players?.player1?.isPlaying).toBe(false);
    expect(result.players?.player1.status).toBe(playerStatus.paused);
  });

  it("should not modify other players", () => {
    const result = handlePause({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players.player2.isPlaying).toBe(true);
    expect(result.players.player2.status).toBe(playerStatus.playing);
  });

  it("should set the source to 'individual'", () => {
    const result = handlePause({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.source).toBe(controlSource.individual);
  });
});
describe("handleToggleLoop", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
        isLooping: !mockContext.players.player1.isLooping,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: false,
        status: playerStatus.paused,
        isLooping: !mockContext.players.player2.isLooping,
      },
    },
  };
  it("should toggle the loop feature of specified player to 'true' while playing", () => {
    const result = handleToggleLoop({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players?.player1?.isLooping).toBe(
      !edgeCaseContext.players.player1.isLooping,
    );
    expect(result.players?.player1.status).toBe(playerStatus.playing);
  });

  it("should toggle the loop feature of specified player to 'true' while pause", () => {
    const result = handleToggleLoop({
      context: edgeCaseContext,
      event: { id: "player2" },
    });

    expect(result.players.player2.isLooping).toBe(
      !edgeCaseContext.players.player2.isLooping,
    );
    expect(result.players.player2.status).toBe(playerStatus.paused);
  });
});
describe("handleStop", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: false,
        status: playerStatus.paused,
      },
    },
  };
  it("should update the specified player to 'ready' status while playing", () => {
    const result = handleStop({
      context: edgeCaseContext,
      event: { id: "player1" },
    });

    expect(result.players?.player1?.isPlaying).toBe(false);
    expect(result.players?.player1.status).toBe(playerStatus.ready);
    expect(result.players?.player1.currentTime).toBe(0);
  });

  it("should update the specified player to 'ready' status while pause", () => {
    const result = handleStop({
      context: edgeCaseContext,
      event: { id: "player2" },
    });

    expect(result.players.player2.isPlaying).toBe(false);
    expect(result.players.player2.status).toBe(playerStatus.ready);
    expect(result.players?.player2.currentTime).toBe(0);
  });
});
describe("updatePlayerProgress", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
        currentTime: 56,
      },
    },
  };
  it("should update the specified player's currentTime", () => {
    const result = updatePlayerProgress({
      context: edgeCaseContext,
      event: { id: "player1", currentTime: { player1: 56 } },
    });

    expect(result.players.player1?.currentTime).toBe(56);
  });
  it("should default to 0 if no currentTime is provided", () => {
    const result = updatePlayerProgress({
      context: edgeCaseContext,
      event: { id: "player1" }, // No currentTime in event
    });

    expect(result.players.player1?.currentTime).toBe(0);
  });
});
describe("handleSetSpeed", () => {
  const edgeCaseContext = {
    ...mockContext,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: false,
        status: playerStatus.ready,
        playbackSpeed: 0.5,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: true,
        status: playerStatus.playing,
        playbackSpeed: 1.5,
      },
    },
  };
  it("should update the specified player's playback speed while ready", () => {
    const result = handleSetSpeed({
      context: edgeCaseContext,
      event: { id: "player1", value: 0.5 },
    });

    expect(result.players?.player1?.playbackSpeed).toBe(0.5);
    expect(result.players?.player1?.status).toBe(playerStatus.ready);
  });
  it("should update the specified player's playback speed while playing", () => {
    const result = handleSetSpeed({
      context: edgeCaseContext,
      event: { id: "player2", value: 1.5 },
    });

    expect(result.players?.player2?.playbackSpeed).toBe(1.5);
    expect(result.players?.player2?.status).toBe(playerStatus.playing);
  });
});
describe("handlePlayAll", () => {
  const edgeCaseContext = {
    ...mockContext,
    source: controlSource.global,
  };
  it("should update all players to 'playing' status", () => {
    const result = handlePlayAll({
      context: edgeCaseContext,
    });
    expect(result.source).toBe(controlSource.global);
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.isPlaying).toBe(true);
      expect(typedPlayer.status).toBe(playerStatus.playing);
    });
  });
});
describe("handlePauseAll", () => {
  const edgeCaseContext = {
    ...mockContext,
    source: controlSource.global,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: true,
        status: playerStatus.playing,
      },
    },
  };
  it("should update all players to 'paused' status", () => {
    const result = handlePauseAll({
      context: edgeCaseContext,
    });
    expect(result.source).toBe(controlSource.global);
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.isPlaying).toBe(false);
      expect(typedPlayer.status).toBe(playerStatus.paused);
    });
  });
});
describe("handleStopAll", () => {
  const edgeCaseContext = {
    ...mockContext,
    source: controlSource.global,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        status: playerStatus.playing,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: true,
        status: playerStatus.playing,
      },
    },
  };
  it("should update all players to 'ready' status", () => {
    const result = handleStopAll({
      context: edgeCaseContext,
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.isPlaying).toBe(false);
      expect(typedPlayer.status).toBe(playerStatus.ready);
      expect(typedPlayer.currentTime).toBe(0);
    });
  });
});
describe("handleSeekAll", () => {
  const edgeCaseContext1 = {
    ...mockContext,
    source: controlSource.global,
    players: {
      player1: {
        ...mockContext.players.player1,
        isPlaying: true,
        ref: { totalFrames: 100 },
        currentTime: 5,
        status: playerStatus.playing,
      },
      player2: {
        ...mockContext.players.player2,
        isPlaying: true,
        ref: { totalFrames: 100 },
        currentTime: 5,
        status: playerStatus.playing,
      },
    },
  };
  it("should seek all players to the start", () => {
    const result = handleSeekAll({
      context: edgeCaseContext1,
      event: { direction: seekType.start },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;

      expect(typedPlayer.currentTime).toBe(0);
    });
  });
  it("should seek all players to the end", () => {
    const result = handleSeekAll({
      context: edgeCaseContext1,
      event: { direction: seekType.end },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.currentTime).toBe(100);
    });
  });
  it("should seek all players one frame forward", () => {
    const result = handleSeekAll({
      context: edgeCaseContext1,
      event: { direction: seekType.forward },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.currentTime).toBe(6);
    });
  });
  it("should seek all players one frame backward", () => {
    const result = handleSeekAll({
      context: edgeCaseContext1,
      event: { direction: seekType.backward },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.currentTime).toBe(4);
    });
  });
  it("should not exceed total frames when moving forward", () => {
    const edgeCaseContext = {
      ...mockContext,
      players: {
        player1: { ...mockContext.players.player1, currentTime: 100 },
        player2: { ...mockContext.players.player2, currentTime: 100 },
      },
    };

    const result = handleSeekAll({
      context: edgeCaseContext,
      event: { direction: seekType.forward },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.currentTime).toBe(100);
    });
  });
  it("should not go below zero when moving backward", () => {
    const edgeCaseContext = {
      ...mockContext,
      players: {
        player1: { ...mockContext.players.player1, currentTime: 0 },
        player2: { ...mockContext.players.player2, currentTime: 0 },
      },
    };

    const result = handleSeekAll({
      context: edgeCaseContext,
      event: { direction: seekType.backward },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.currentTime).toBe(0);
    });
  });
});
describe("handleSetGlobalSpeed", () => {
  const edgeCaseContext = {
    ...mockContext,
    source: controlSource.global,
    players: {
      player1: {
        ...mockContext.players.player1,
        playbackSpeed: 0.5,
      },
      player2: {
        ...mockContext.players.player2,
        playbackSpeed: 0.5,
      },
    },
  };
  it("should update all players playback speed", () => {
    const result = handleSetGlobalSpeed({
      context: edgeCaseContext,
      event: { value: 0.5 },
    });
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.playbackSpeed).toBe(0.5);
    });
  });
});
describe("handleLoopAll", () => {
  const edgeCaseContext = {
    ...mockContext,
    source: controlSource.global,
    isLooping: !mockContext.isLooping,
    players: {
      player1: {
        ...mockContext.players.player1,
        isLooping: !mockContext.players.player1.isLooping,
      },
      player2: {
        ...mockContext.players.player2,
        isLooping: !mockContext.players.player1.isLooping,
      },
    },
  };
  it("should loop all players", () => {
    const result = handleLoopAll({
      context: edgeCaseContext,
    });
    expect(result.isLooping).toBe(!edgeCaseContext.isLooping);
    Object.values(result.players).forEach((player) => {
      const typedPlayer = player as typeof mockContext.players.player1;
      expect(typedPlayer.isLooping).toBe(!edgeCaseContext.isLooping);
    });
  });
});
