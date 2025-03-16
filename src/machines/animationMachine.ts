import {
  createMachine,
  assign,
  fromPromise,
  fromCallback,
  type EventObject,
} from "xstate";
import { AnimationContext, AnimationEvent } from "./animationMachine.types";
import { MAX_FILE_SIZE } from "../constants";
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
            // {
            //   target: "error",
            //   guard: "isInvalidFileType",
            //   actions: assign({
            //     error: "Invalid file type. Please upload a .lottie file.",
            //   }),
            // },
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
                console.log({ context, event });
                return {
                  ...context.players,
                  [event.id]: {
                    ref: event.ref,
                    currentTime: 0,
                    isLooping: false,
                    isPlaying: false,
                    playbackSpeed: 1,
                    isSeeking: false,
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
            actions: assign({ isPlaying: true }),
          },
          PAUSE_ALL: {
            target: "paused",
            actions: assign({ isPlaying: false }),
          },
          STOP_ALL: {
            target: "idle",
            actions: assign({ isPlaying: false }),
          },
          // SEEK_ALL: {
          //   actions: assign({ currentTime: ({ event }) => event.time }),
          // },
          SET_GLOBAL_SPEED: {
            actions: assign({ globalSpeed: ({ event }) => event.value }),
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
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];

                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    isPlaying: false,
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
                    currentTime: player.currentTime ?? 0,
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
            actions: assign({ isPlaying: false }),
          },
          STOP_ALL: {
            target: "idle",
            actions: assign({ isPlaying: false }),
          },
          // SEEK_ALL: {
          //   actions: assign({ currentTime: ({ event }) => event.time }),
          // },
          SET_GLOBAL_SPEED: {
            actions: assign({ globalSpeed: ({ event }) => event.value }),
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
                    currentTime: player.currentTime ?? 0,
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
            actions: assign({ isPlaying: true }),
          },
          STOP_ALL: {
            target: "idle",
            actions: assign({ isPlaying: false }),
          },
          // SEEK_ALL: {
          //   actions: assign({ currentTime: ({ event }) => event.time }),
          // },
          SET_GLOBAL_SPEED: {
            actions: assign({ globalSpeed: ({ event }) => event.value }),
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
          event?.type === "LOAD_FILE" && !event.file?.name.endsWith(".lottie")
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
