import {
  createMachine,
  assign,
  fromPromise,
  fromCallback,
  type EventObject,
} from "xstate";
import { AnimationContext, AnimationEvent } from "./animationMachine.types";
import { MAX_FILE_SIZE, playerStatus, seekType } from "../constants";
import { AnimationItem } from "lottie-web";

const trackProgress = fromCallback<
  EventObject,
  { players: Record<string, { ref: AnimationItem | null }> }
>(({ sendBack, input }) => {
  const { players } = input;

  const intervals = Object.entries(players).map(([id, player]) => {
    const ref = player?.ref;
    if (!ref) return () => {}; // Early return if no valid ref

    const interval = setInterval(() => {
      const currentTime = ref.currentFrame;
      const totalFrames = ref.totalFrames;
      if (currentTime !== undefined) {
        sendBack({
          type: "UPDATE_PROGRESS",
          id,
          currentTime: { [id]: Math.round(currentTime) },
        });
      }

      if (currentTime >= totalFrames - 1) {
        clearInterval(interval);

        sendBack({ type: "ANIMATION_ENDED", id });
      }
    }, 100);

    return () => clearInterval(interval);
  });

  return () => intervals.forEach((cleanup) => cleanup());
});

const animationMachine = createMachine(
  {
    id: "animationControl",
    initial: "idle",
    types: {
      context: {} as AnimationContext,
      events: {} as AnimationEvent,
    },
    context: {
      players: {},
      error: null,
      file: null,
      isPlaying: false,
      currentTime: {},
      isLooping: false,
      playbackSpeed: 1,
      globalSpeed: 1,
      isSeeking: false,
    } as AnimationContext,
    states: {
      idle: {
        always: [
          {
            target: "ready",
            guard: "hasValidFile",
          },
        ],

        on: {
          LOAD_FILE: [
            {
              target: "error",
              guard: "isFileMissing",
              actions: assign({ error: "No file selected." }),
            },
            {
              target: "error",
              guard: "isInvalidFileType",
              actions: assign({
                error: "Invalid file type. Please upload a .lottie file.",
              }),
            },
            {
              target: "error",
              guard: "isFileTooLarge",
              actions: assign({
                error: "File size exceeds 5MB limit",
              }),
            },
            {
              target: "loading",
              actions: assign({ file: ({ event }) => event.file }),
            },
          ],
          REGISTER_PLAYER: {
            actions: assign({
              players: ({ context, event }) => {
                return {
                  ...context.players,
                  [event.id]: {
                    ref: event.ref,
                    currentTime: 0,
                    isLooping: false,
                    isPlaying: false,
                    playbackSpeed: 1,
                    isSeeking: false,
                    status: playerStatus.idle,
                  },
                };
              },
            }),
          },
        },
      },
      loading: {
        invoke: {
          src: fromPromise(
            ({ input }: { input: File | null }) =>
              new Promise((resolve, reject) => {
                if (input) {
                  resolve(input);
                } else {
                  reject("Error loading file.");
                }
              }),
          ),
          input: ({ context }) => context.file,
          onDone: {
            target: "ready",
            actions: assign({
              file: ({ event }) => event?.output,
              error: null,
            }),
          },
          onError: {
            target: "error",
            actions: assign({
              error: ({ event }) => String(event.error),
              file: null,
            }),
          },
        },
      },
      error: {
        on: {
          RETRY: "idle",
        },
      },
      ready: {
        on: {
          REGISTER_PLAYER: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    ref: event.ref,
                    status: playerStatus.ready,
                  },
                };
              },
            }),
          },

          PLAY: {
            target: "playing",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: true,
                    status: playerStatus.playing,
                  },
                };
              },
            }),
          },
          PAUSE: {
            target: "paused",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    status: playerStatus.paused,
                  },
                };
              },
            }),
          },

          SEEK: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    currentTime: event?.currentTime[event.id] ?? 0,
                  },
                };
              },
            }),
          },
          SET_SPEED: {
            actions: assign({
              players: ({ context, event }) => {
                return {
                  ...context.players,
                  [event.id]: {
                    ...context.players[event.id],
                    playbackSpeed: event.value,
                  },
                };
              },
            }),
          },
          UPDATE_PROGRESS: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                if (!player) return context.players;

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    currentTime: event?.currentTime[event.id] ?? 0,
                  },
                };
              },
            }),
          },
          //Global Controls
          PLAY_ALL: {
            target: "playing",
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
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
            }),
          },
          SEEK_ALL: {
            actions: assign({
              players: ({ context, event }) => {
                const { direction } = event;

                return Object.entries(context.players).reduce(
                  (acc, [id, player]) => {
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
                  },
                  {},
                );
              },
            }),
          },
          SET_GLOBAL_SPEED: {
            actions: assign({
              players: ({ context, event }) =>
                Object.keys(context.players).reduce(
                  (acc, id) => ({
                    ...acc,
                    [id]: {
                      ...context.players[id],
                      playbackSpeed: event.value,
                    },
                  }),
                  {},
                ),
            }),
          },
        },
      },
      playing: {
        invoke: {
          src: "trackProgress",
          input: ({ context }) => ({
            players: context.players,
          }),
        },
        on: {
          UPDATE_PROGRESS: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                if (!player) return context.players;

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    currentTime: event?.currentTime[event.id] ?? 0,
                  },
                };
              },
            }),
          },
          ANIMATION_ENDED: {
            target: "stopped",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    status: playerStatus.stopped,
                    // currentTime: 0,
                  },
                };
              },
            }),
          },
          PAUSE: {
            target: "paused",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    status: playerStatus.paused,
                  },
                };
              },
            }),
          },
          STOP: {
            target: "ready",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                // @ts-expect-error :fix this later
                player?.ref?.stop();
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    currentTime: 0,
                    status: playerStatus.ready,
                  },
                };
              },
            }),
          },
          SEEK: {
            target: "playing",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    currentTime: event?.currentTime[event.id] ?? 0,
                    status: playerStatus.playing,
                  },
                };
              },
            }),
          },
          TOGGLE_LOOP: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                if (!player) return context.players;
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isLooping: !player.isLooping,
                  },
                };
              },
            }),
          },
          SET_SPEED: {
            actions: assign({
              players: ({ context, event }) => {
                return {
                  ...context.players,
                  [event.id]: {
                    ...context.players[event.id],
                    playbackSpeed: event.value,
                  },
                };
              },
            }),
          },
          //Global Controls
          PAUSE_ALL: {
            target: "paused",
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
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
            }),
          },
          LOOP_ALL: {
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
                  (acc, id) => ({
                    ...acc,
                    [id]: {
                      ...context.players[id],
                      isLooping: !context.players[id]?.isLooping,
                    },
                  }),
                  {},
                ),
              isLooping: ({ context }) => !context.isLooping,
            }),
          },
          STOP_ALL: {
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
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
            }),
          },
          SEEK_ALL: {
            actions: assign({
              players: ({ context, event }) => {
                const { direction } = event;

                return Object.entries(context.players).reduce(
                  (acc, [id, player]) => {
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
                  },
                  {},
                );
              },
            }),
          },
          SET_GLOBAL_SPEED: {
            actions: assign({
              players: ({ context, event }) =>
                Object.keys(context.players).reduce(
                  (acc, id) => ({
                    ...acc,
                    [id]: {
                      ...context.players[id],
                      playbackSpeed: event.value,
                    },
                  }),
                  {},
                ),
            }),
          },
        },
      },
      paused: {
        on: {
          PLAY: {
            target: "playing",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: true,
                    status: playerStatus.playing,
                  },
                };
              },
            }),
          },
          STOP: {
            target: "ready",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                // @ts-expect-error :fix this later
                player?.ref?.stop();
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    currentTime: 0,
                    status: playerStatus.ready,
                  },
                };
              },
            }),
          },
          TOGGLE_LOOP: {
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                if (!player) return context.players;
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isLooping: !player.isLooping,
                  },
                };
              },
            }),
          },
          SEEK: {
            target: "playing",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    currentTime: event?.currentTime[event.id] ?? 0,
                    status: playerStatus.playing,
                  },
                };
              },
            }),
          },
          SET_SPEED: {
            actions: assign({
              players: ({ context, event }) => {
                return {
                  ...context.players,
                  [event.id]: {
                    ...context.players[event.id],
                    playbackSpeed: event.value,
                  },
                };
              },
            }),
          },

          //Global Controls
          PLAY_ALL: {
            target: "playing",
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
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
            }),
          },
          STOP_ALL: {
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
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
            }),
          },
          LOOP_ALL: {
            actions: assign({
              players: ({ context }) =>
                Object.keys(context.players).reduce(
                  (acc, id) => ({
                    ...acc,
                    [id]: {
                      ...context.players[id],
                      isLooping: !context.players[id]?.isLooping,
                    },
                  }),
                  {},
                ),
              isLooping: ({ context }) => !context.isLooping,
            }),
          },
          SEEK_ALL: {
            actions: assign({
              players: ({ context, event }) => {
                const { direction } = event;

                return Object.entries(context.players).reduce(
                  (acc, [id, player]) => {
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
                  },
                  {},
                );
              },
            }),
          },
          SET_GLOBAL_SPEED: {
            actions: assign({
              players: ({ context, event }) =>
                Object.keys(context.players).reduce(
                  (acc, id) => ({
                    ...acc,
                    [id]: {
                      ...context.players[id],
                      playbackSpeed: event.value,
                    },
                  }),
                  {},
                ),
            }),
          },
        },
      },
      stopped: {
        on: {
          PLAY: {
            target: "playing",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: true,
                    status: playerStatus.playing,
                  },
                };
              },
            }),
          },
          STOP: {
            target: "ready",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                // @ts-expect-error :fix this later
                player?.ref?.stop();
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
                    currentTime: 0,
                    status: playerStatus.ready,
                  },
                };
              },
            }),
          },
        },
      },
    },
  },
  {
    guards: {
      isFileTooLarge: ({ event }: { event: AnimationEvent }) => {
        return (
          event?.type === "LOAD_FILE" &&
          event?.file?.size !== undefined &&
          event?.file?.size > MAX_FILE_SIZE
        );
      },
      isFileMissing: ({ event }: { event: AnimationEvent }) => {
        return event?.type === "LOAD_FILE" && !event.file;
      },
      isInvalidFileType: ({ event }: { event: AnimationEvent }) => {
        return (
          event?.type === "LOAD_FILE" &&
          !event.file?.name.endsWith(".lottie") &&
          !event.file?.name.endsWith(".json")
        );
      },
      hasValidFile: ({ context }) => Boolean(context.file),
    },
    actors: {
      trackProgress,
    },
  },
);

export default animationMachine;
