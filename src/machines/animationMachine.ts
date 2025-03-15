import {
  createMachine,
  assign,
  fromPromise,
  fromCallback,
  type EventObject,
} from "xstate";
import { AnimationContext, AnimationEvent } from "./animationMachine.types";
import { MAX_FILE_SIZE } from "../constants";

const trackProgress = fromCallback<EventObject, { players: object }>(
  ({ sendBack, input }) => {
    const { players } = input;

    const intervals = Object.entries(players).map(([id, ref]) => {
      console.log({ ref });
      const interval = setInterval(() => {
        const currentTime = ref?.currentFrame;
        const totalFrames = ref?.totalFrames;
        console.log({ currentTime, totalFrames });
        if (currentTime !== undefined && !ref.isSeeking) {
          sendBack({
            type: "UPDATE_PROGRESS",
            id,
            currentTime: { [id]: Math.round(currentTime) },
          });
        }
        if (currentTime >= totalFrames) {
          clearInterval(interval);
          sendBack({ type: "ANIMATION_ENDED", id }); // Optional, if you want to handle this in the machine
        }
      }, 100);

      return () => clearInterval(interval);
    });

    return () => intervals.forEach((cleanup) => cleanup());
  },
);

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
        entry: [
          assign({ currentTime: {} }), // Reset progress
        ],

        on: {
          REGISTER_PLAYER: {
            actions: assign({
              players: ({ context, event }) => ({
                ...context.players,
                [event.id]: event.ref,
              }),
            }),
          },
          PLAY: {
            target: "playing",
            actions: assign({ isPlaying: true }),
          },
          PAUSE: {
            target: "paused",
            actions: assign({ isPlaying: false }),
          },
          STOP: {
            target: "idle",
            actions: assign({
              isPlaying: false,
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                [event.id]: 0,
              }),
            }),
          },
          SEEK: {
            actions: [
              assign({
                currentTime: ({ context, event }) => ({
                  ...context.currentTime,
                  ...(event.currentTime && {
                    [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                  }),
                }),
                isSeeking: true,
              }),
            ],
          },
          SET_SPEED: {
            actions: assign({ playbackSpeed: ({ event }) => event.value }),
          },
          UPDATE_PROGRESS: {
            actions: assign({
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                ...(event.currentTime && {
                  [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                }),
              }),
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
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                ...(event.currentTime && {
                  [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                }),
              }),
            }),
          },
          PAUSE: {
            target: "paused",
            actions: assign({ isPlaying: false }),
          },
          STOP: {
            target: "idle",
            actions: assign({
              isPlaying: false,
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                [event.id]: 0,
              }),
            }),
          },
          SEEK: {
            actions: [
              assign({
                currentTime: ({ context, event }) => ({
                  ...context.currentTime,
                  ...(event.currentTime && {
                    [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                  }),
                }),
                isSeeking: true,
              }),
            ],
          },
          TOGGLE_LOOP: {
            actions: assign({
              isLooping: ({ context }) => !context.isLooping,
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                ...(event.currentTime && {
                  [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                }),
              }),
            }),
          },
          SET_SPEED: {
            actions: assign({ playbackSpeed: ({ event }) => event.value }),
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
            actions: assign({ isPlaying: true }),
          },
          STOP: {
            target: "idle",
            actions: assign({
              isPlaying: false,
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                [event.id]: 0,
              }),
            }),
          },
          TOGGLE_LOOP: {
            actions: assign({
              isLooping: ({ context }) => !context.isLooping,
              currentTime: ({ context, event }) => ({
                ...context.currentTime,
                ...(event.currentTime && {
                  [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                }),
              }),
            }),
          },
          SEEK: {
            actions: [
              assign({
                currentTime: ({ context, event }) => ({
                  ...context.currentTime,
                  ...(event.currentTime && {
                    [event.id]: event.currentTime[event.id] ?? 0, // Ensure fallback if undefined
                  }),
                }),
                isSeeking: true,
              }),
            ],
          },
          SET_SPEED: {
            actions: assign({ playbackSpeed: ({ event }) => event.value }),
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
