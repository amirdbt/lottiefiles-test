import { useEffect, useRef, useState } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { MachineContext } from "../../context/MachineContext";
import AnimationControls from "../AnimationControls";
import { playerStatus, playerTypes } from "../../constants";

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
  const status = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.status,
  );
  const genStatus = MachineContext.useSelector((state) => state.value);
  const error = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.error,
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      autoplay: false,
      path: file ? URL.createObjectURL(file) : "",
    });

    setLottiePlayer(instance);

    return () => {
      instance.destroy(); // Clean up when component unmounts
    };
  }, [file, send, playerId]);

  useEffect(() => {
    if (file && file.name.endsWith(".lottie")) {
      send({
        type: "SET_PLAYER_ERROR",
        id: playerId,
        error: "Invalid file format for LottieWeb. Please upload a .json file.",
      });
    }
  }, [file, send, playerId, genStatus]);

  useEffect(() => {
    if (lottiePlayer) {
      send({ type: "REGISTER_PLAYER", id: playerId, ref: lottiePlayer });
      if (status === playerStatus.playing) {
        lottiePlayer?.play();
      } else if (status === playerStatus.paused) {
        lottiePlayer?.pause();
      } else if (status === playerStatus.stopped) {
        lottiePlayer?.stop();
      }
      lottiePlayer?.setLoop(isLooping);
      lottiePlayer?.setSpeed(playbackSpeed);
    }
  }, [lottiePlayer, send, status, playbackSpeed, playerId, isLooping]);

  console.log({ error, status, genStatus });

  return (
    <section className="flex flex-col items-center justify-center">
      <h2 className="mb-1 text-lg">LottieWeb Player</h2>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div
        ref={containerRef}
        className="h-[220px] w-[440px] rounded-2xl border bg-white"
      />

      {!error && (
        <AnimationControls id={playerId} type={playerTypes.lottieWeb} />
      )}
    </section>
  );
};

export default LottieWebPlayer;
