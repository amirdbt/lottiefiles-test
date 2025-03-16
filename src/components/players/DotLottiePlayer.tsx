import { useEffect, useState } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import { MachineContext } from "../../context/MachineContext";
import ProgressIndicator from "../ProgressIndicator";
import AnimationControls from "../AnimationControls";
import { playerTypes } from "../../constants";

const DotLottiePlayer = () => {
  const file = MachineContext.useSelector((state) => state.context.file);

  const isLooping = MachineContext.useSelector(
    (state) => state.context.players["player1"]?.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.players["player1"]?.playbackSpeed,
  );
  const status = MachineContext.useSelector((state) => state.value);
  const { send } = MachineContext.useActorRef();
  const [dottie, setDottie] = useState<DotLottie | null>(null);

  useEffect(() => {
    if (dottie) {
      send({ type: "REGISTER_PLAYER", id: "player1", ref: dottie });
    }
    const handleLoad = () => {
      if (status === "playing") {
        dottie?.play();
      } else if (status === "paused") {
        dottie?.pause();
      } else if (status === "ready") {
        dottie?.setFrame(0);
        dottie?.stop();
      }
    };
    if (dottie) {
      dottie?.addEventListener("load", handleLoad);
    }
  }, [send, dottie, status, playbackSpeed]);
  return (
    <>
      <h2>DotLottie Player</h2>
      <DotLottieReact
        dotLottieRefCallback={(dotLottie) => {
          setDottie(dotLottie);
        }}
        src={file ? URL.createObjectURL(file) : ""}
        autoplay={false}
        loop={isLooping}
        speed={playbackSpeed}
        className="w-96 border"
      />

      <ProgressIndicator id="player1" type={playerTypes.dotLottie} />
      <AnimationControls id="player1" />
    </>
  );
};

export default DotLottiePlayer;
