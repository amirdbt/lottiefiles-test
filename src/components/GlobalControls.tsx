import { playerStatus } from "../constants";
import { MachineContext } from "../context/MachineContext";
import GlobalProgressIndicator from "./GlobalProgressIndicator";
import Tooltip from "./Tooltip";
import { StopCircle, Repeat, Play, Pause } from "lucide-react";

const GlobalControls = () => {
  const status = MachineContext.useSelector((state) => state.status);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const Icon = status === playerStatus.playing ? Pause : Play;
  // const actionType = status === playerStatus.playing ? "PAUSE" : "PLAY";
  const tootlTipText = status === playerStatus.playing ? "Pause" : "Play";
  return (
    <>
      <div className="flex w-full flex-col items-center rounded border p-4 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-white">Global Controls</h2>

        <div className="flex flex-row items-center justify-center gap-2">
          <Tooltip text={tootlTipText}>
            <Icon
              size={"30"}
              className="bg-primary cursor-pointer text-white"
            />
          </Tooltip>

          <Tooltip text="Stop">
            <StopCircle
              size={"30"}
              className="bg-primary cursor-pointer text-white"
            />
          </Tooltip>
          <Tooltip text="Click to seek">
            <GlobalProgressIndicator />
          </Tooltip>
          <Tooltip text={isLooping ? "Off Loop" : "On Loop"}>
            <Repeat
              size={"30"}
              className={`bg-primary cursor-pointer ${isLooping ? "text-gray-600" : "text-white"} `}
            />
          </Tooltip>

          <Tooltip text="Playback Speed">
            <select
              className="bg-primary cursor-pointer rounded-md border border-white p-1 text-sm text-white shadow-md transition-all duration-200 outline-none focus:ring-2 focus:ring-white"
              value={1}
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
