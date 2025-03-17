export const formatFrame = (currentFrame: number, totalFrames: number) => {
  if (!currentFrame || !totalFrames) return "00:00";
  return `${String(Math.round(currentFrame)).padStart(2, "0")}:${String(totalFrames).padStart(2, "0")}`;
};
