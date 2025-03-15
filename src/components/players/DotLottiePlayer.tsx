import { useEffect, useRef } from "react";
import { DotLottieReact, DotLottie } from "@lottiefiles/dotlottie-react";
import { MachineContext } from "../../context/MachineContext";
import ProgressIndicator from "../ProgressIndicator";
import AnimationControls from "../AnimationControls";

const DotLottiePlayer = () => {
  const file = MachineContext.useSelector((state) => state.context.file);
  const players = MachineContext.useSelector((state) => state.context.players);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.playbackSpeed,
  );
  const status = MachineContext.useSelector((state) => state.value);
  const { send } = MachineContext.useActorRef();
  const dotLottieRef = useRef<DotLottie | null>(null);
  const hasListenerRef = useRef(false);

  useEffect(() => {
    const instance = dotLottieRef.current;

    if (!instance) return;
    send({ type: "REGISTER_PLAYER", id: "player1", ref: instance });

    const handleLoad = () => {
      if (status === "playing") {
        console.log("Hello");
        instance.play();
      } else if (status === "paused") {
        instance.pause();
      } else if (status === "idle") {
        instance.stop();
      }
    };

    if (!hasListenerRef.current) {
      instance.addEventListener("load", handleLoad);
      hasListenerRef.current = true;
    }

    return () => {
      instance.removeEventListener("load", handleLoad);
      hasListenerRef.current = false;
    };
  }, [send, status]);
  console.log(file, status, players);
  return (
    <>
      <h2>DotLottie Player</h2>
      <DotLottieReact
        dotLottieRefCallback={(dotLottie) => {
          dotLottieRef.current = dotLottie;
        }}
        src={file ? URL.createObjectURL(file) : ""}
        autoplay={false}
        loop={isLooping}
        speed={playbackSpeed || 1}
        className="w-96 border"
      />
      <ProgressIndicator id="player1" />
      <AnimationControls id="player1" />
    </>
  );
};

export default DotLottiePlayer;
