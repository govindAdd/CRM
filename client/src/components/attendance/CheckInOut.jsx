import React, { useState, useEffect } from "react";
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

  const [mode, setMode] = useState(null); // "check-in" | "check-out" | null
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pending_checkin_data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.clockIn && parsed?.location) {
          setHasCheckedIn(true);
        }
      }
    } catch (error) {
      console.error("Error loading localStorage data:", error);
    }
  }, []);

  const handleStart = async (selected) => {
    setMode(selected);
    setIsLoading(true);
    try {
      await startCamera();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async () => {
    try {
      const data = await captureAndGetData();
      if (data) {
        setCameraData(data);
        if (mode === "check-in") setHasCheckedIn(true);
        handleClose();
      }
    } catch (err) {
      console.error("Capture failed", err);
    }
  };

  const handleClose = () => {
    stopCamera();
    setMode(null);
  };

  return (
    <div className="w-full p-6 rounded-2xl shadow-xl border space-y-6
                    bg-gradient-to-br from-slate-100/60 to-white/90
                    dark:from-gray-700/50 dark:to-gray-800/70
                    dark:border-gray-600 transition-colors">
      <h3 className="text-center text-xl font-bold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 transition-colors">
        {mode ? mode.replace("-", " ") : "Check In / Check Out"}
      </h3>

      {!mode && (
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => handleStart("check-in")}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 transition-all shadow"
          >
            <FaPlay />
            {isLoading ? "Starting..." : "Check In"}
          </button>

          <button
            onClick={() => handleStart("check-out")}
            disabled={isLoading || !hasCheckedIn}
            className={`px-5 py-2 rounded-full font-semibold flex items-center gap-2 transition-all shadow ${
              hasCheckedIn
                ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
            }`}
          >
            <FaStop />
            {isLoading
              ? "Starting..."
              : hasCheckedIn
              ? "Check Out"
              : "Check In First"}
          </button>
        </div>
      )}

      {mode && (
        <>
          <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-indigo-300 dark:border-indigo-500">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-xl transform scale-x-[-1]"
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-3">
            <button
              onClick={handleCapture}
              className="bg-yellow-400 hover:bg-yellow-500 text-black dark:text-white px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition shadow"
            >
              <FaCamera />
              Capture
            </button>
            <button
              onClick={handleClose}
              className="bg-red-500 hover:bg-red-600 text-white dark:text-gray-200 px-6 py-2 rounded-full font-semibold flex items-center justify-center gap-2 transition shadow"
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
