import { useState } from "react";
import useAnimationMachine from "../context/useAnimationMachine";

const GlobalControls = () => {
  const { send, state } = useAnimationMachine();
  const [seekTime, setSeekTime] = useState(0);
  const [speed, setSpeed] = useState(1);

  const handlePlayAll = () => send({ type: "PLAY_ALL" });
  const handlePauseAll = () => send({ type: "PAUSE_ALL" });
  const handleStopAll = () => send({ type: "STOP_ALL" });

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(event.target.value);
    setSeekTime(time);
    send({ type: "SEEK", time });
  };
  const handleSpeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const speed = Number(event.target.value);
    setSpeed(speed);
    send({ type: "SET_GLOBAL_SPEED", value: speed });
  };
  console.log({ state });
  return (
    <>
      <div className="rounded border p-4 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-white">Global Controls</h2>

        <div className="mb-2 flex gap-2">
          <button
            onClick={handlePlayAll}
            className="rounded bg-green-500 p-2 text-white"
          >
            Play All
          </button>
          <button
            onClick={handlePauseAll}
            className="rounded bg-yellow-500 p-2 text-white"
          >
            Pause All
          </button>
          <button
            onClick={handleStopAll}
            className="rounded bg-red-500 p-2 text-white"
          >
            Stop All
          </button>
        </div>

        <div className="flex gap-2">
          <label className="text-white">
            Seek:
            <input
              type="range"
              min="0"
              max="100"
              value={seekTime}
              onChange={handleSeek}
              className="w-full bg-white"
            />
          </label>

          <label className="text-white">
            Speed:
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="3"
              value={speed}
              onChange={handleSpeedChange}
              className="rounded border bg-amber-50 p-2"
              placeholder="Speed"
            />
          </label>
        </div>
      </div>
    </>
  );
};

export default GlobalControls;
