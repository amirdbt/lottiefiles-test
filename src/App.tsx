import MachineProvider from "./context/MachineProvider";
import Home from "./pages/Home";

function App() {
  return (
    <MachineProvider>
      <Home />
    </MachineProvider>
  );
}

export default App;
