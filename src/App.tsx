import ControlPanel from "./components/ControlPanel";
// import GlobalControls from "./components/GlobalControls";
import DotLottiePlayer from "./components/players/DotLottiePlayer";
import LottieWebPlayer from "./components/players/LottieWebPlayer";
import MachineProvider from "./context/MachineProvider";

function App() {
  return (
    <MachineProvider>
      <ControlPanel />

      {/* <GlobalControls /> */}
      <div className="mt-4">
        <DotLottiePlayer />
        <LottieWebPlayer />
        {/* Add other players when ready */}
      </div>
    </MachineProvider>
  );
}

export default App;
