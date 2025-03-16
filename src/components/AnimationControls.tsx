import { MachineContext } from "../context/MachineContext";

const AnimationControls = ({ id }: { id: string }) => {
  const currentTime = MachineContext.useSelector(
    (state) => state.context.players[id]?.currentTime,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players[id]?.playbackSpeed,
  );
  const { send } = MachineContext.useActorRef();

  const handlePlaybackSpeedChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const speed = parseFloat(e.target.value);
    send({ type: "SET_SPEED", id, value: speed });
  };
  return (
    <div>
      <div className=" ">
        <div className="flex gap-2">
          <button
            className="cursor-pointer rounded-md bg-green-500 px-4 py-2 text-white"
            onClick={() => send({ type: "PLAY", id })}
          >
            Play
          </button>

          <button
            className="cursor-pointer rounded-md bg-yellow-500 px-4 py-2 text-white"
            onClick={() => send({ type: "PAUSE", id })}
          >
            Pause
          </button>

          <button
            className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={() => send({ type: "STOP", id, currentTime: { [id]: 0 } })}
          >
            Stop
          </button>
          <button
            className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={() =>
              send({
                type: "TOGGLE_LOOP",
                id,
                currentTime: { [id]: Math.round(currentTime) },
              })
            }
          >
            Loop
          </button>

          <select
            className="cursor-pointer rounded-md border px-4 py-2"
            value={playbackSpeed}
            onChange={handlePlaybackSpeedChange}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x (Normal)</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
