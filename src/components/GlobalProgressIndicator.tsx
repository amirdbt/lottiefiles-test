import { useRef } from "react";
import { formatFrame } from "../utility";

const GlobalProgressIndicator = () => {
  const outProgressDiv = useRef<HTMLDivElement>(null);

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className="customProgressBar w-[900px]"
        id="outerDiv"
        ref={outProgressDiv}
        //   onClick={handleSeek}
      >
        <div
          id="innerDiv"
          className={`h-3 rounded-[4px] bg-green-500`}
          style={{
            transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
            width: `${50}%`,
          }}
        ></div>
      </div>
      <div className="mr-2 w-11">
        <p className="text-lg text-white">{formatFrame(0, 0)}</p>
      </div>
    </div>
  );
};

export default GlobalProgressIndicator;
