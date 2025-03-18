/* eslint-disable @typescript-eslint/no-explicit-any */
import { controlSource, playerStatus, seekType } from "../constants";
import { AnimationContext } from "./animationMachine.types";
export const handlePlay = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  return {
    source: controlSource.individual,
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        isPlaying: true,
        status: playerStatus.playing,
      },
    },
  };
};
export const handlePause = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];

  return {
    source: controlSource.individual,

    players: {
      ...context.players,
      [event.id]: {
        ...player,
        isPlaying: false,
        status: playerStatus.paused,
      },
    },
  };
};
export const handleToggleLoop = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  if (!player) return context.players;
  return {
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        isLooping: !player.isLooping,
      },
    },
  };
};
export const handleStop = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  return {
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        isPlaying: false,
        currentTime: 0,
        status: playerStatus.ready,
      },
    },
  };
};
export const updatePlayerProgress = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  if (!player) return context.players;
  return {
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        currentTime: event?.currentTime[event.id] ?? 0,
      },
    },
  };
};
export const handleSetSpeed = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  return {
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        playbackSpeed: event.value,
      },
    },
  };
};
export const handleRegisterPlayer = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const player = context.players[event.id];
  return {
    players: {
      ...context.players,
      [event.id]: {
        ...player,
        ref: event.ref,
        status: playerStatus.ready,
      },
    },
  };
};

export const handlePlayAll = ({ context }: { context: AnimationContext }) => {
  return {
    source: controlSource.global,

    players: Object.keys(context.players).reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...context.players[id],
          isPlaying: true,
          status: playerStatus.playing,
        },
      }),
      {},
    ),
  };
};
export const handlePauseAll = ({ context }: { context: AnimationContext }) => {
  return {
    source: controlSource.global,

    players: Object.keys(context.players).reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...context.players[id],
          isPlaying: false,
          status: playerStatus.paused,
        },
      }),
      {},
    ),
  };
};
export const handleStopAll = ({ context }: { context: AnimationContext }) => {
  return {
    players: Object.keys(context.players).reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...context.players[id],
          isPlaying: false,
          currentTime: 0,
          status: playerStatus.ready,
        },
      }),
      {},
    ),
  };
};
export const handleSeekAll = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  const { direction } = event;
  return {
    players: Object.entries(context.players).reduce((acc, [id, player]) => {
      let newFrame = player.currentTime;

      if (direction === seekType.start) {
        newFrame = 0;
      } else if (direction === seekType.end) {
        //@ts-expect-error: it does exist
        newFrame = player.ref?.totalFrames;
      } else if (direction === seekType.forward) {
        newFrame = Math.min(
          player.currentTime + 1, //@ts-expect-error: it does exist
          player.ref?.totalFrames,
        );
      } else if (direction === seekType.backward) {
        newFrame = Math.max(player.currentTime - 1, 0);
      }
      //@ts-expect-error: it does exist
      acc[id] = {
        ...player,
        currentTime: newFrame,
      };

      return acc;
    }, {}),
  };
};
export const handleSetGlobalSpeed = ({
  context,
  event,
}: {
  context: AnimationContext;
  event: any;
}) => {
  return {
    players: Object.keys(context.players).reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...context.players[id],
          playbackSpeed: event.value,
        },
      }),
      {},
    ),
  };
};
export const handleLoopAll = ({ context }: { context: AnimationContext }) => {
  return {
    isLooping: !context.isLooping,
    players: Object.keys(context.players).reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...context.players[id],
          isLooping: !context.players[id]?.isLooping,
        },
      }),
      {},
    ),
  };
};
