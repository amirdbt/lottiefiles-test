import { MachineContext } from "./MachineContext";

function useAnimationMachine() {
  const { send } = MachineContext.useActorRef();
  const file = MachineContext.useSelector((state) => state.context.file);
  const error = MachineContext.useSelector((state) => state.context.error);
  const currentTime = MachineContext.useSelector(
    (state) => state.context.currentTime,
  );
  const globalSpeed = MachineContext.useSelector(
    (state) => state.context.globalSpeed,
  );
  const isPlaying = MachineContext.useSelector(
    (state) => state.context.isPlaying,
  );
  const isLooping = MachineContext.useSelector(
    (state) => state.context.isLooping,
  );
  const playbackSpeed = MachineContext.useSelector(
    (state) => state.context.playbackSpeed,
  );

  return {
    send,
    file,
    error,
    currentTime,
    globalSpeed,
    isPlaying,
    isLooping,
    playbackSpeed,
  };
}

export default useAnimationMachine;
