import { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { MachineContext } from "../../context/MachineContext";
import AnimationControls from "../AnimationControls";
import ProgressIndicator from "../ProgressIndicator";
import { playerTypes } from "../../constants";

const LottieWebPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { send } = MachineContext.useActorRef();
  const file = MachineContext.useSelector((state) => state.context.file);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const [lottiePlayer, setLottiePlayer] = useState<AnimationItem | null>(null);

  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players["player2"]?.playbackSpeed,
  );

  const status = MachineContext.useSelector((state) => state.value);
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
      send({ type: "REGISTER_PLAYER", id: "player2", ref: lottiePlayer });
      if (status === "playing") {
        lottiePlayer?.play();
      } else if (status === "paused") {
        lottiePlayer?.pause();
      } else if (status === "ready") {
        lottiePlayer?.stop();
      }
      lottiePlayer?.setSpeed(playbackSpeed);
    }
  }, [lottiePlayer, send, status, playbackSpeed]);
  return (
    <>
      <div ref={containerRef} className="h-48 w-96 border" />

      <ProgressIndicator id="player2" type={playerTypes.lottieWeb} />
      <AnimationControls id="player2" />
    </>
  );
};

export default LottieWebPlayer;
