import {
  createMachine,
  assign,
  fromPromise,
  fromCallback,
  type EventObject,
} from "xstate";
import { AnimationContext, AnimationEvent } from "./animationMachine.types";
import { MAX_FILE_SIZE, playerStatus } from "../constants";
import { AnimationItem } from "lottie-web";
import {
  handlePause,
  handlePlay,
  updatePlayerProgress,
  handleSetSpeed,
  handleStop,
  handleToggleLoop,
  handleRegisterPlayer,
  handlePlayAll,
  handleStopAll,
  handlePauseAll,
  handleSeekAll,
  handleSetGlobalSpeed,
  handleLoopAll,
} from "./playerActions";

const trackProgress = fromCallback<
  EventObject,
  { eventType: string; players: Record<string, { ref: AnimationItem | null }> }
>(({ sendBack, input }) => {
  const { players, eventType } = input;
  const animationFrameIds: Record<string, number> = {};

  Object.entries(players).forEach(([id, player]) => {
    const ref = player?.ref;
    if (!ref) return; // Skip if no valid ref

    const track = () => {
      const currentTime = ref.currentFrame;
      const totalFrames = ref.totalFrames;

      if (currentTime !== undefined) {
        sendBack({
          type: "UPDATE_PROGRESS",
          id,
          currentTime: { [id]: Math.round(currentTime) },
        });
      }

      if (currentTime < totalFrames - 1) {
        animationFrameIds[id] = requestAnimationFrame(track);
      } else {
        if (eventType === "PLAY") {
          sendBack({ type: "ANIMATION_ENDED", id });
        } else {
          sendBack({ type: "ANIMATION_ALL_ENDED", id });
        }
      }
    };

    animationFrameIds[id] = requestAnimationFrame(track);
  });

  return () => {
    Object.values(animationFrameIds).forEach((frameId) =>
      cancelAnimationFrame(frameId),
    );
  };
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
      globalSpeed: 1,
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
              actions: assign({
                file: ({ event }) => {
                  return event.file;
                },
              }),
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
                    status: playerStatus.idle,
                    error: "",
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
          RETRY: {
            target: "idle",
            actions: assign({
              error: null,
              file: null,
            }),
          },
        },
      },
      ready: {
        on: {
          REGISTER_PLAYER: {
            actions: assign(handleRegisterPlayer),
          },
          SET_PLAYER_ERROR: {
            target: "idle",
            actions: assign({
              players: ({ context, event }) => {
                const player = context.players[event.id];
                return {
                  ...context.players,
                  [event.id]: {
                    ...player,
                    error: event.error,
                    status: playerStatus.idle,
                  },
                };
              },
            }),
          },
          RETRY: {
            target: "idle",
            actions: assign({
              error: null,
              file: null,
            }),
          },
          PLAY: {
            target: "playing",
            actions: assign(handlePlay),
          },

          PAUSE: {
            target: "paused",
            actions: assign(handlePause),
          },

          SEEK: {
            actions: assign(updatePlayerProgress),
          },
          SET_SPEED: {
            actions: assign(handleSetSpeed),
          },
          UPDATE_PROGRESS: {
            actions: assign(updatePlayerProgress),
          },
          //Global Controls
          PLAY_ALL: {
            target: "playing",
            actions: assign(handlePlayAll),
          },
          SEEK_ALL: {
            actions: assign(handleSeekAll),
          },
          SET_GLOBAL_SPEED: {
            actions: assign(handleSetGlobalSpeed),
          },
        },
      },
      playing: {
        invoke: {
          src: "trackProgress",
          input: ({ context, event }) => {
            return {
              players: context.players,
              eventType: event.type,
            };
          },
        },
        on: {
          UPDATE_PROGRESS: {
            actions: assign(updatePlayerProgress),
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
          ANIMATION_ALL_ENDED: {
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
            actions: assign(handlePause),
          },
          STOP: {
            target: "ready",
            actions: assign(handleStop),
          },
          SEEK: {
            target: "playing",
            actions: assign(updatePlayerProgress),
          },
          TOGGLE_LOOP: {
            actions: assign(handleToggleLoop),
          },
          SET_SPEED: {
            actions: assign(handleSetSpeed),
          },
          //Global Controls
          PAUSE_ALL: {
            target: "paused",
            actions: assign(handlePauseAll),
          },
          LOOP_ALL: {
            actions: assign(handleLoopAll),
          },
          STOP_ALL: {
            target: "ready",
            actions: assign(handleStopAll),
          },
          SEEK_ALL: {
            actions: assign(handleSeekAll),
          },
          SET_GLOBAL_SPEED: {
            actions: assign(handleSetGlobalSpeed),
          },
        },
      },
      paused: {
        on: {
          PLAY: {
            target: "playing",
            actions: assign(handlePlay),
          },
          STOP: {
            target: "ready",
            actions: assign(handleStop),
          },
          TOGGLE_LOOP: {
            actions: assign(handleToggleLoop),
          },
          SEEK: {
            target: "playing",
            actions: assign(updatePlayerProgress),
          },
          SET_SPEED: {
            actions: assign(handleSetSpeed),
          },

          //Global Controls
          PLAY_ALL: {
            target: "playing",
            actions: assign(handlePlayAll),
          },
          STOP_ALL: {
            target: "ready",
            actions: assign(handleStopAll),
          },
          LOOP_ALL: {
            actions: assign(handleLoopAll),
          },
          SEEK_ALL: {
            actions: assign(handleSeekAll),
          },
          SET_GLOBAL_SPEED: {
            actions: assign(handleSetGlobalSpeed),
          },
        },
      },
      stopped: {
        on: {
          PLAY: {
            target: "playing",
            actions: assign(handlePlay),
          },
          STOP: {
            target: "ready",
            actions: assign(handleStop),
          },
          PLAY_ALL: {
            target: "playing",
            actions: assign(handlePlayAll),
          },
          STOP_ALL: {
            target: "ready",
            actions: assign(handleStopAll),
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
