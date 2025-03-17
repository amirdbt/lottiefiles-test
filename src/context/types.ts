import { ActorRefFrom, StateFrom } from "xstate";
import animationMachine from "../machines/animationMachine";

type AnimationMachineState = StateFrom<typeof animationMachine>;
type AnimationMachineActor = ActorRefFrom<typeof animationMachine>;
export interface MachineContextType {
  state: AnimationMachineState;
  send: AnimationMachineActor["send"];
  actorRef: AnimationMachineActor;
}
