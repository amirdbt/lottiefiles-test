import { useState } from "react";
import { playerStatus, seekType } from "../constants";
import { MachineContext } from "../context/MachineContext";
import Tooltip from "./Tooltip";
import {
  StopCircle,
  Repeat,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const GlobalControls = () => {
  const [speed, setSpeed] = useState(1);
  const status = MachineContext.useSelector((state) => state.value);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const { send } = MachineContext.useActorRef();
  const handlePlaybackSpeedChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const speed = parseFloat(e.target.value);
    setSpeed(speed);
    send({ type: "SET_GLOBAL_SPEED", value: speed });
  };

  const Icon = status === playerStatus.playing ? Pause : Play;
  const actionType = status === playerStatus.playing ? "PAUSE_ALL" : "PLAY_ALL";
  const tootlTipText = status === playerStatus.playing ? "Pause" : "Play";

  return (
    <>
      <div className="flex w-full flex-col items-center rounded border p-4 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-white">Global Control</h2>

        <div className="flex flex-row items-center justify-center space-x-7 rounded-md border bg-gray-200 px-4 py-2">
          <Tooltip text="Stop">
            <StopCircle
              size={"30"}
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
              onClick={() => send({ type: "STOP_ALL" })}
            />
          </Tooltip>
          <Tooltip text="Go to start">
            <SkipBack
              size={"30"}
              onClick={() =>
                send({ type: "SEEK_ALL", direction: seekType.start })
              }
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </Tooltip>
          <Tooltip text="Go back 1 frame">
            <ChevronLeft
              size={"30"}
              onClick={() =>
                send({ type: "SEEK_ALL", direction: seekType.backward })
              }
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </Tooltip>
          <Tooltip text={tootlTipText}>
            <Icon
              size={"30"}
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
              onClick={() => send({ type: actionType })}
            />
          </Tooltip>

          <Tooltip text="Go forward 1 frame">
            <ChevronRight
              size={"30"}
              onClick={() =>
                send({ type: "SEEK_ALL", direction: seekType.forward })
              }
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </Tooltip>
          <Tooltip text="Go to end">
            <SkipForward
              size={"30"}
              onClick={() =>
                send({ type: "SEEK_ALL", direction: seekType.end })
              }
              className="text-primary cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
            />
          </Tooltip>
          <Tooltip text={isLooping ? "Off Loop" : "On Loop"}>
            <Repeat
              size={"30"}
              className={`cursor-pointer transition-all duration-300 ease-in-out hover:scale-110 ${isLooping ? "text-gray-600" : "text-whprimaryite"} `}
              onClick={() => send({ type: "LOOP_ALL" })}
            />
          </Tooltip>

          <Tooltip text="Playback Speed">
            <select
              className="text-primary border-primary cursor-pointer rounded-md border p-1 text-sm shadow-md transition-all duration-200 ease-in-out outline-none hover:scale-110 focus:ring-2 focus:ring-white"
              value={speed}
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
    </>
  );
};

export default GlobalControls;
