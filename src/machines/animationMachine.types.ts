export interface AnimationContext {
  isLooping: boolean;
  file: File | null;
  error: string | null;

  globalSpeed: number;
  source?: string;
  players: {
    [playerId: string]: {
      ref: object; // The player instance
      isPlaying: boolean; // Tracks play/pause state
      isLooping: boolean;
      playbackSpeed: number;
      currentTime: number;
      status: string;
      error?: string;
    };
  };
}

export type AnimationEvent =
  | { type: "REGISTER_PLAYER"; id: string; ref: object }
  | { type: "PLAY"; id: string }
  | { type: "PAUSE"; id: string }
  | { type: "STOP"; id: string; currentTime: Record<string, number> }
  | { type: "SEEK"; id: string; currentTime: Record<string, number> }
  | { type: "TOGGLE_LOOP"; id: string; currentTime: Record<string, number> }
  | { type: "UPDATE_PROGRESS"; id: string; currentTime: Record<string, number> }
  | {
      type: "ANIMATION_ENDED";
      id: string;
      currentTime: Record<string, number>;
    }
  | {
      type: "ANIMATION_ALL_ENDED";
      id: string;
      currentTime: Record<string, number>;
    }
  | { type: "SET_SPEED"; value: number; id: string }
  | { type: "LOAD_FILE"; file: File | null }
  | { type: "LOAD_FILE_SUCCESS"; file: File | null }
  | { type: "LOAD_FILE_ERROR"; error: string }
  | { type: "SET_PLAYER_ERROR"; id: string; error: string }
  | { type: "RETRY" }
  | { type: "PLAY_ALL" }
  | { type: "PAUSE_ALL" }
  | { type: "STOP_ALL" }
  | { type: "LOOP_ALL" }
  | { type: "RESUME_TRACKING" }
  | { type: "SEEK_ALL"; direction: string }
  | { type: "SET_GLOBAL_SPEED"; value: number };
