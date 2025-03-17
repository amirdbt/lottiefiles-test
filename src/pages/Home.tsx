import ControlPanel from "../components/ControlPanel";
import DotLottiePlayer from "../components/players/DotLottiePlayer";
import LottieWebPlayer from "../components/players/LottieWebPlayer";

const Home = () => {
  return (
    <main>
      <ControlPanel />

      {/* <GlobalControls /> */}
      <div className="grid min-h-screen grid-cols-2 grid-rows-2">
        <div className="flex items-center justify-center border border-gray-600">
          <DotLottiePlayer playerId="player1" />
        </div>
        <div className="flex items-center justify-center border border-gray-600">
          <LottieWebPlayer playerId="player2" />
        </div>
        <div className="border border-gray-600"></div>
        <div className="border border-gray-600"></div>
        {/*
         */}
        {/* Add other players when ready */}
      </div>
    </main>
  );
};

export default Home;
