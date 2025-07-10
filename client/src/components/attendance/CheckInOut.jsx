import React, { useState } from "react";
import { useCameraCapture } from "../../hooks/attendance/useCameraCapture";
import { FaCamera, FaPlay, FaStop } from "react-icons/fa";

const CheckInOut = ({ setCameraData }) => {
  const {
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    captureAndGetData,
  } = useCameraCapture();

  const [mode, setMode] = useState(""); // "Check In" or "Check Out"
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const handleStart = async (selectedMode) => {
    setGettingLocation(true);
    setMode(selectedMode);
    try {
      await startCamera();
    } finally {
      setGettingLocation(false);
    }
  };

  const handleCapture = async () => {
    try {
      const data = await captureAndGetData();
      if (data) {
        setCameraData(data);
        if (mode === "Check In") setIsCheckedIn(true);
        stopCamera();
        setMode("");
      }
    } catch (_) {
      // Fail silently, let parent handle
    }
  };

  const handleReset = () => {
    stopCamera();
    setMode("");
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-100/50 to-white/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-200 shadow-xl space-y-6">
      <h2 className="text-center text-xl font-bold uppercase tracking-wider text-indigo-700">
        {mode || "Check In / Out"}
      </h2>

      {!mode && (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => handleStart("Check In")}
            disabled={gettingLocation}
            className="px-5 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white text-sm sm:text-base font-semibold flex items-center gap-2 shadow-md transition-all"
          >
            <FaPlay />
            {gettingLocation ? "Locating..." : "Check In"}
          </button>

          <button
            onClick={() => handleStart("Check Out")}
            disabled={gettingLocation || !isCheckedIn}
            className={`px-5 py-2 rounded-full text-sm sm:text-base font-semibold flex items-center gap-2 shadow-md transition-all ${
              isCheckedIn
                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <FaStop />
            {gettingLocation
              ? "Locating..."
              : isCheckedIn
              ? "Check Out"
              : "Check In First"}
          </button>
        </div>
      )}

      {mode && (
        <>
          <div className="w-full aspect-video overflow-hidden rounded-xl border border-indigo-300 shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1] rounded-xl"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              onClick={handleCapture}
              className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 shadow hover:shadow-lg transition"
            >
              <FaCamera />
              Capture
            </button>
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 shadow hover:shadow-lg transition"
            >
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckInOut;
