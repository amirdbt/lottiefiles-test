export const formatTime = (
  currentFrame: number,
  totalFrames: number,
  durationInSeconds: number,
) => {
  if (!currentFrame || !totalFrames || !durationInSeconds) return "00:00";

  const progressRatio = currentFrame / totalFrames;
  const currentTimeInSeconds = progressRatio * durationInSeconds;

  const minutes = Math.floor(currentTimeInSeconds / 60);
  const seconds = Math.floor(currentTimeInSeconds % 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};
