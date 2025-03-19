import { useCallback, useEffect, useState } from "react";
import { MachineContext } from "../context/MachineContext";
import { UploadCloud, XCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";

const ControlPanel = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const file = MachineContext.useSelector((state) => state.context.file);
  const error = MachineContext.useSelector((state) => state.context.error);
  const { send } = MachineContext.useActorRef();
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setSelectedFile(acceptedFiles[0]);
      send({ type: "LOAD_FILE", file: acceptedFiles[0] });
    },
    [send],
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { lottie: [".lottie", ".json"] },
    maxFiles: 1,
  });
  const handleModal = () => {
    if (!openModal) {
      send({ type: "RETRY" });
      setSelectedFile(null);
    }
    setOpenModal(!openModal);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        send({ type: "RETRY" });
      }, 1000);
    }
  }, [error, send]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleModal();
    }
  };

  return (
    <>
      <div className="rounded border p-4 shadow-md">
        <button
          onClick={handleModal}
          className={`text-primary ${file ? "" : "animate-bounceLoop"} flex cursor-pointer items-center justify-between gap-2 rounded-md border-none bg-white p-2 shadow-md transition-all duration-300 ease-in-out hover:scale-110`}
        >
          <UploadCloud /> Upload file
        </button>
      </div>
      {openModal && (
        <div className="fixed top-0 bottom-0 left-0 z-40 flex w-full items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.8)]">
          <div className="animate-bounceIn z-50 w-[960px] max-w-full rounded-md bg-white p-8 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-primary mb-3.5 text-xl">Upload a file 😊 </h2>
              <XCircle
                className="cursor-pointer"
                tabIndex={0}
                data-testid="close"
                onKeyDown={handleKeyDown}
                onClick={handleModal}
              />
            </div>
            <div
              {...getRootProps()}
              data-testid="upload-card"
              className="flex h-[200px] cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-[#fafafa] p-4"
            >
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag 'n' drop some files here, or click to select files</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {selectedFile && !error && (
              <p className="text-sm text-green-500">
                File loaded: {selectedFile.name}
              </p>
            )}
            <button
              onClick={handleModal}
              className={`bg-primary mt-2 flex cursor-pointer items-center justify-between gap-2 rounded-md border-none p-2 text-sm text-white shadow-md transition-all duration-300 ease-in-out hover:scale-110`}
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ControlPanel;
