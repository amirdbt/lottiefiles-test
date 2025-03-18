import { playerStatus } from "../constants";
import { MachineContext } from "../context/MachineContext";
import { StopCircle, Repeat, Play, Pause } from "lucide-react";
import Tooltip from "./Tooltip";
import ProgressIndicator from "./ProgressIndicator";

const AnimationControls = ({ id, type }: { id: string; type: string }) => {
  const currentTime = MachineContext.useSelector(
    (state) => state.context.players[id]?.currentTime,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players[id]?.playbackSpeed,
  );
  const status = MachineContext.useSelector(
    (state) => state.context.players[id]?.status,
  );
  const isLooping = MachineContext.useSelector(
    (state) => state.context.players[id]?.isLooping,
  );
  const { send } = MachineContext.useActorRef();

  const handlePlaybackSpeedChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const speed = parseFloat(e.target.value);
    send({ type: "SET_SPEED", id, value: speed });
  };
  const Icon = status === playerStatus.playing ? Pause : Play;
  const actionType = status === playerStatus.playing ? "PAUSE" : "PLAY";
  const tootlTipText = status === playerStatus.playing ? "Pause" : "Play";

  return (
    <div className="mt-2">
      <div className="flex flex-row items-center justify-center gap-2">
        <Tooltip text={tootlTipText}>
          <Icon
            tabIndex={0}
            onClick={() => send({ type: actionType, id })}
            className="bg-primary cursor-pointer text-white"
          />
        </Tooltip>

        <Tooltip text="Stop">
          <StopCircle
            tabIndex={0}
            className="bg-primary cursor-pointer text-white"
            onClick={() => send({ type: "STOP", id, currentTime: { [id]: 0 } })}
          />
        </Tooltip>
        <Tooltip text="Click to seek">
          <ProgressIndicator id={id} type={type} />
        </Tooltip>
        <Tooltip text={isLooping ? "Off Loop" : "On Loop"}>
          <Repeat
            tabIndex={0}
            className={`bg-primary cursor-pointer ${isLooping ? "text-gray-600" : "text-white"} `}
            onClick={() =>
              send({
                type: "TOGGLE_LOOP",
                id,
                currentTime: { [id]: Math.round(currentTime) },
              })
            }
          />
        </Tooltip>

        <Tooltip text="Playback Speed">
          <select
            className="bg-primary cursor-pointer rounded-md border border-white p-1 text-sm text-white shadow-md transition-all duration-200 outline-none focus:ring-2 focus:ring-white"
            value={playbackSpeed}
            onChange={handlePlaybackSpeedChange}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </Tooltip>
      </div>
    </div>
  );
};

export default AnimationControls;
