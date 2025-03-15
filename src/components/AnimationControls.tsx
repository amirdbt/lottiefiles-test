import { MachineContext } from "../context/MachineContext";

const AnimationControls = ({ id }: { id: string }) => {
  const value = MachineContext.useSelector((state) => state.value);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const { send } = MachineContext.useActorRef();
  console.log({ value, isLooping, id });
  return (
    <div>
      <div className=" ">
        <div className="flex gap-2">
          <button
            className="rounded-md bg-green-500 px-4 py-2 text-white"
            onClick={() => send({ type: "PLAY" })}
          >
            Play
          </button>

          <button
            className="rounded-md bg-yellow-500 px-4 py-2 text-white"
            onClick={() => send({ type: "PAUSE" })}
          >
            Pause
          </button>

          <button
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={() => send({ type: "STOP" })}
          >
            Stop
          </button>
          <button
            className="rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={() => send({ type: "TOGGLE_LOOP" })}
          >
            Loop
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimationControls;
