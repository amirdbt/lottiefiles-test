import { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { MachineContext } from "../../context/MachineContext";
import AnimationControls from "../AnimationControls";
import { playerTypes } from "../../constants";

const LottieWebPlayer = ({ playerId }: { playerId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { send } = MachineContext.useActorRef();
  const file = MachineContext.useSelector((state) => state.context.file);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.isLooping,
  );
  const [lottiePlayer, setLottiePlayer] = useState<AnimationItem | null>(null);

  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.playbackSpeed,
  );
  const playerStatus = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.status,
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: isLooping,
      autoplay: false,
      path: file ? URL.createObjectURL(file) : "",
    });
    setLottiePlayer(instance);
    return () => {
      instance.destroy(); // Clean up when component unmounts
    };
  }, [file, isLooping]);
  useEffect(() => {
    if (lottiePlayer) {
      send({ type: "REGISTER_PLAYER", id: playerId, ref: lottiePlayer });
      if (playerStatus === "playing") {
        lottiePlayer?.play();
      } else if (playerStatus === "paused") {
        lottiePlayer?.pause();
      } else if (playerStatus === "ready") {
        lottiePlayer?.stop();
      }
      lottiePlayer?.setLoop(isLooping);
      lottiePlayer?.setSpeed(playbackSpeed);
    }
  }, [lottiePlayer, send, playerStatus, playbackSpeed, playerId, isLooping]);
  return (
    <section className="flex flex-col items-center justify-center">
      <h2 className="mb-1">LottieWeb Player</h2>
      <div
        ref={containerRef}
        className="h-[220px] w-[440px] rounded-2xl border bg-white"
      />

      <AnimationControls id={playerId} type={playerTypes.lottieWeb} />
    </section>
  );
};

export default LottieWebPlayer;
