import { useEffect, useRef } from "react";
import lottie, { AnimationItem } from "lottie-web";
import { MachineContext } from "../../context/MachineContext";

const LottieWebPlayer = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<AnimationItem | null>(null);
  const { send } = MachineContext.useActorRef();
  const file = MachineContext.useSelector((state) => state.context.file);
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.playbackSpeed,
  );
  const status = MachineContext.useSelector((state) => state.value);

  useEffect(() => {
    if (containerRef.current) {
      instanceRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: isLooping,
        autoplay: true,
        path: file ? URL.createObjectURL(file) : "",
      });
      send({ type: "REGISTER_PLAYER", id: "player2", ref: instanceRef });
    }
  }, [file, isLooping, send]);

  return <div ref={containerRef} className="h-48 w-96 border" />;
};

export default LottieWebPlayer;
