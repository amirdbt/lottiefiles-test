import React, { useState } from "react";
import { MachineContext } from "../context/MachineContext";

const ControlPanel = () => {
  const file = MachineContext.useSelector((state) => state.context.file);
  const error = MachineContext.useSelector((state) => state.context.error);
  const { send } = MachineContext.useActorRef();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    send({ type: "LOAD_FILE", file });
  };
  console.log({ selectedFile });
  return (
    <>
      <div className="rounded border p-4 shadow-md">
        <h2 className="mb-2 text-lg font-bold text-white">Control Panel</h2>
        <input
          type="file"
          accept=".json"
          // accept=".lottie"
          onChange={handleFileChange}
          className="mb-2 w-full border bg-amber-50 p-2"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {file && (
          <p className="text-sm text-green-500">File loaded: {file.name}</p>
        )}
      </div>
    </>
  );
};

export default ControlPanel;
