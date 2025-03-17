import ControlPanel from "../components/ControlPanel";
import GlobalControls from "../components/GlobalControls";
import DotLottiePlayer from "../components/players/DotLottiePlayer";
import LottieWebPlayer from "../components/players/LottieWebPlayer";
//* LAZY LOAD THE ABOVE
const Home = () => {
  return (
    <main>
      <ControlPanel />

      <div className="grid min-h-[80vh] grid-cols-1 grid-rows-2 sm:grid-cols-1 md:grid-cols-2">
        <div className="flex items-center justify-center border border-gray-600">
          <DotLottiePlayer playerId="player1" />
        </div>
        <div className="flex items-center justify-center border border-gray-600">
          <LottieWebPlayer playerId="player2" />
        </div>
        <div className="border border-gray-600"></div>
        <div className="border border-gray-600"></div>
      </div>
      <GlobalControls />
    </main>
  );
};

export default Home;
