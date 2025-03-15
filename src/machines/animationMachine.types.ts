export interface AnimationContext {
  players: object | null;
  isPlaying: boolean;
  currentTime: Record<string, number>;
  isLooping: boolean;
  file: File | null;
  error: string | null;
  playbackSpeed: number;
  globalSpeed: number;
  isSeeking?: boolean;
}

export type AnimationEvent =
  | { type: "REGISTER_PLAYER"; id: string; ref: object }
  | { type: "PLAY"; id: string }
  | { type: "PAUSE"; id: string }
  | { type: "STOP"; id: string; currentTime: Record<string, number> }
  | { type: "SEEK"; id: string; currentTime: Record<string, number> }
  | { type: "TOGGLE_LOOP"; id: string; currentTime: Record<string, number> }
  | { type: "UPDATE_PROGRESS"; id: string; currentTime: Record<string, number> }
  | { type: "SET_SPEED"; value: number }
  | { type: "LOAD_FILE"; file: File | null }
  | { type: "LOAD_FILE_SUCCESS"; file: File | null }
  | { type: "LOAD_FILE_ERROR"; error: string }
  | { type: "RETRY" }
  | { type: "PLAY_ALL" }
  | { type: "PAUSE_ALL" }
  | { type: "STOP_ALL" }
  | { type: "RESUME_TRACKING" }
  | { type: "SEEK_ALL"; time: number }
  | { type: "SET_GLOBAL_SPEED"; value: number };
