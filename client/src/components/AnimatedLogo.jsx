import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import newLogo from "../assets/newLogoAnimation.mp4";
import newLogoSmall from "../assets/newLogoAnimationSmall.mp4";

const AnimatedLogo = ({ onComplete }) => {
  const videoRef = useRef(null);
  const [animationState, setAnimationState] = useState("enter");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    // Detect small screen
    const checkScreen = () => {
      setIsSmallScreen(window.innerWidth <= 640); // Tailwind's sm breakpoint
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true; // Allow autoplay
    video.playsInline = true; // For iOS
    const handleAutoplay = async () => {
      try {
        await video.play();
      } catch (err) {
        console.error("Autoplay failed:", err);
      }
    };
    const handleEnded = () => {
      setAnimationState("exit");
      if (onComplete) onComplete();
    };
    video.addEventListener("loadedmetadata", handleAutoplay);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("loadedmetadata", handleAutoplay);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onComplete, isSmallScreen]);

  const variants = {
    enter: {
      opacity: 0,
      scale: 0.95,
      y: 50,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -30,
      transition: { duration: 0.8, ease: "easeIn" },
    },
  };

  return (
    <AnimatePresence>
      {animationState !== "hidden" && (
        <motion.div
          key="logo"
          initial="enter"
          animate={animationState === "exit" ? "exit" : "visible"}
          exit="exit"
          variants={variants}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <video
            ref={videoRef}
            src={isSmallScreen ? newLogoSmall : newLogo}
            className="w-full h-full object-cover pointer-events-none"
            preload="auto"
            playsInline
            muted
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedLogo;
