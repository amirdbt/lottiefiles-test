import { ReactNode } from "react";
import { MachineContext } from "./MachineContext";

const MachineProvider = ({ children }: { children: ReactNode }) => {
  return <MachineContext.Provider>{children}</MachineContext.Provider>;
};

export default MachineProvider;
