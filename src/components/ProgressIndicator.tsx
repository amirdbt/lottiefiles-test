import { useRef } from "react";
import { MachineContext } from "../context/MachineContext";
import { formatTime } from "../utility";

const ProgressIndicator = ({ id }: { id: string }) => {
  const outProgressDiv = useRef<HTMLDivElement>(null);

  const currentTime = MachineContext.useSelector(
    (state) =>
      (state.context.currentTime as Record<string, number>)[
        id as keyof typeof state.context.currentTime
      ] ?? 0,
  ) as number;
  const players = MachineContext.useSelector((state) => state.context.players);
  const { send } = MachineContext.useActorRef();
  const totalFrames = (players && players[id]?.totalFrames) || 0;
  const duration = (players && players[id]?.duration) || 0;
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

    send({
      type: "SEEK",
      id,
      currentTime: { [id]: Math.round(newCurrentTime) },
    });
  };
  console.log({ duration, totalFrames, currentTime });
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
      <p>{formatTime(currentTime, totalFrames, duration)}</p>
    </>
  );
};

export default ProgressIndicator;
