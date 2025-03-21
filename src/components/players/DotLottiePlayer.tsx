import { useEffect, useState } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import { MachineContext } from "../../context/MachineContext";
import AnimationControls from "../AnimationControls";
import { playerStatus, playerTypes } from "../../constants";

const DotLottiePlayer = ({ playerId }: { playerId: string }) => {
  const file = MachineContext.useSelector((state) => state.context.file);

  const isLooping = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.playbackSpeed,
  );
  const status = MachineContext.useSelector(
    (state) => state.context.players[playerId]?.status,
  );

  const { send } = MachineContext.useActorRef();
  const [dottie, setDottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (dottie) {
      send({ type: "REGISTER_PLAYER", id: playerId, ref: dottie });
    }
    const handleLoad = () => {
      if (status === playerStatus.playing) {
        dottie?.play();
      } else if (status === playerStatus.paused) {
        dottie?.pause();
      } else if (status === playerStatus.stopped) {
        dottie?.setFrame(1);
        dottie?.stop();
      }
    };
    if (dottie) {
      dottie?.addEventListener("load", handleLoad);
    }
  }, [send, dottie, status, playbackSpeed, playerId]);

  return (
    <section className="flex flex-col items-center justify-center">
      <h2 className="mb-1 text-lg">DotLottie Player</h2>
      <DotLottieReact
        dotLottieRefCallback={(dotLottie) => {
          setDottie(dotLottie);
        }}
        src={file ? URL.createObjectURL(file) : ""}
        autoplay={false}
        data-testid="dotlottie"
        loop={isLooping}
        speed={playbackSpeed}
        className="h-[220px] w-[440px] rounded-2xl border bg-white"
      />

      <AnimationControls id={playerId} type={playerTypes.dotLottie} />
    </section>
  );
};

export default DotLottiePlayer;
