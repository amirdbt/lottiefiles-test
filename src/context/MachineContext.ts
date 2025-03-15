import { createActorContext } from "@xstate/react";
import animationMachine from "../machines/animationMachine";
import { StateFrom } from "xstate";

export const MachineContext = createActorContext(animationMachine);
type AnimationState = StateFrom<typeof animationMachine>;

export const useAnimationSelector = <T>(
  selector: (state: AnimationState) => T,
): T => {
  return MachineContext.useSelector(selector);
};
