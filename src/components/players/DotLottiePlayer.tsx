import { useEffect, useState } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import { MachineContext } from "../../context/MachineContext";
import AnimationControls from "../AnimationControls";
import { playerTypes } from "../../constants";

const DotLottiePlayer = ({ playerId }: { playerId: string }) => {
  const file = MachineContext.useSelector((state) => state.context.file);

  const isLooping = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.playbackSpeed,
  );
  const playerStatus = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.status,
  );
  const { send } = MachineContext.useActorRef();
  const [dottie, setDottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (dottie) {
      send({ type: "REGISTER_PLAYER", id: playerId, ref: dottie });
    }
    const handleLoad = () => {
      if (playerStatus === "playing") {
        dottie?.play();
      } else if (playerStatus === "paused") {
        dottie?.pause();
      } else if (playerStatus === "ready") {
        dottie?.setFrame(0);
        dottie?.stop();
      }
    };
    if (dottie) {
      dottie?.addEventListener("load", handleLoad);
    }
  }, [send, dottie, playerStatus, playbackSpeed, playerId]);
  return (
    <section className="flex flex-col items-center justify-center">
      <h2 className="mb-1">DotLottie Player</h2>
      <DotLottieReact
        dotLottieRefCallback={(dotLottie) => {
          setDottie(dotLottie);
        }}
        src={file ? URL.createObjectURL(file) : ""}
        autoplay={false}
        loop={isLooping}
        speed={playbackSpeed}
        className="h-[220px] w-[440px] rounded-2xl border bg-white"
      />

      <AnimationControls id={playerId} type={playerTypes.dotLottie} />
    </section>
  );
};

export default DotLottiePlayer;
