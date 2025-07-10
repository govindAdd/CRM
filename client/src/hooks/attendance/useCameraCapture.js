import { useRef, useState } from "react";

export const useCameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [timestamp, setTimestamp] = useState(null);

  // Start front camera preview
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreaming(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  // Stop camera and release stream
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    stream?.getTracks()?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  // Capture image from current video frame
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Mirror the image (for selfie mode)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/jpeg");
    const currentTime = new Date().toISOString();

    setCapturedImage(dataUrl);
    setTimestamp(currentTime);

    return { dataUrl, currentTime };
  };

  // Get user’s current GPS location
  const getGeoLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          resolve(coords);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocation(null);
          reject(err);
        }
      );
    });

  // Capture image + location + timestamp in a single call
  const captureAndGetData = async () => {
    const { dataUrl, currentTime } = captureImage() || {};
    const geo = await getGeoLocation();
    return {
      capturedImage: dataUrl,
      timestamp: currentTime,
      location: geo,
    };
  };

  return {
    videoRef,
    canvasRef,
    streaming,
    startCamera,
    stopCamera,
    captureImage,
    capturedImage,
    timestamp,
    location,
    setLocation,
    captureAndGetData,
  };
};
