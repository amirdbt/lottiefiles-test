import { useRef } from "react";
import { MachineContext } from "../context/MachineContext";
import { formatFrame } from "../utility";
import { playerTypes } from "../constants";

const ProgressIndicator = ({ id, type }: { id: string; type: string }) => {
  const outProgressDiv = useRef<HTMLDivElement>(null);

  const { send } = MachineContext.useActorRef();
  const currentTime = MachineContext.useSelector(
    (state) => state.context.players[id]?.currentTime,
  );
  const player = MachineContext.useSelector(
    (state) => state.context.players[id],
  );
  const totalFrames =
    (player &&
      (player as { ref: { totalFrames: number } })?.ref?.totalFrames) ||
    0;

  const progressPercentage = totalFrames
    ? ((currentTime + 1) / totalFrames) * 100
    : 0;

  const handleSeek = (e: { pageX: number }) => {
    if (!outProgressDiv?.current) return;
    const rect = outProgressDiv.current.getBoundingClientRect();
    const outerWidth = outProgressDiv.current.offsetWidth;

    if (!rect || outerWidth === 0) return;

    const newWidth = Math.max(0, Math.min(e.pageX - rect.left, outerWidth));
    const newProgress = (newWidth / outerWidth) * 100;
    const newCurrentTime = (newProgress / 100) * totalFrames;
    if (type === playerTypes.dotLottie) {
      // @ts-expect-error : Set Frame does exist
      player?.ref?.setFrame(Math.round(newCurrentTime));
    } else {
      // @ts-expect-error : Set Frame does exist
      player?.ref?.gotoFrame(Math.round(newCurrentTime));
    }

    send({
      type: "SEEK",
      id,
      currentTime: { [id]: Math.round(newCurrentTime) },
    });
  };
  return (
    <>
      <div
        className="customProgressBar"
        id="outerDiv"
        ref={outProgressDiv}
        onClick={handleSeek}
      >
        <div
          id="innerDiv"
          className={`h-3 rounded-[4px] bg-green-500`}
          style={{
            transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
            width: `${progressPercentage}%`,
          }}
        ></div>
      </div>
      <p>{formatFrame(currentTime, totalFrames)}</p>
    </>
  );
};

export default ProgressIndicator;
