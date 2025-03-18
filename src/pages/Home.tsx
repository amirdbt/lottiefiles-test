import { lazy, Suspense, useState } from "react";
import ControlPanel from "../components/ControlPanel";
import GlobalControls from "../components/GlobalControls";
import Skeleton from "../components/Skeleton";

const DotLottiePlayer = lazy(
  () => import("../components/players/DotLottiePlayer"),
);
const LottieWebPlayer = lazy(
  () => import("../components/players/LottieWebPlayer"),
);
const availablePlayers: Record<
  string,
  React.LazyExoticComponent<React.FC<{ playerId: string }>>
> = {
  dotLottie: DotLottiePlayer,
  lottieWeb: LottieWebPlayer,
} as const;
type PlayerType = keyof typeof availablePlayers | null;

const Home = () => {
  const [players, setPlayers] = useState<Record<string, string | null>>({
    player1: null,
    player2: null,
    player3: null,
    player4: null,
  });

  const handleChange = (player: string, playerType: PlayerType) => {
    setPlayers((prev) => ({
      ...prev,
      [player]: playerType,
    }));
  };

  return (
    <main>
      <ControlPanel />
      <div className="grid min-h-[75vh] grid-cols-1 grid-rows-2 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
        {Object.entries(players).map(([player, selectedPlayer]) => {
          const PlayerComponent = selectedPlayer
            ? availablePlayers[selectedPlayer]
            : null;

          return (
            <div
              key={player}
              className="flex flex-col items-center border border-gray-600 p-4"
            >
              <div className="flex w-full justify-self-end">
                <select
                  value={selectedPlayer || ""}
                  onChange={(e) =>
                    handleChange(player, e.target.value as PlayerType)
                  }
                  className="bg-primary cursor-pointer rounded-md border border-white p-1 text-sm text-white"
                >
                  <option value="" disabled>
                    Select a Player
                  </option>
                  <option value="dotLottie">dotlottie-web</option>
                  <option value="lottieWeb">lottie-web</option>
                </select>
              </div>

              {PlayerComponent ? (
                <Suspense fallback={<Skeleton />}>
                  <PlayerComponent playerId={player} />
                </Suspense>
              ) : (
                <div className="mt-10 text-center text-gray-400">
                  No player selected
                </div>
              )}
            </div>
          );
        })}
      </div>

      <GlobalControls />
    </main>
  );
};

export default Home;
