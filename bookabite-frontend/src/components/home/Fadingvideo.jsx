import { useRef, useState, useEffect } from "react";

export default function FadingVideo({ src, fallbackImage, className = "", style = {} }) {
  const videoRef = useRef(null);
  const [opacity, setOpacity] = useState(0);
  const [index, setIndex] = useState(0);

  const sources = Array.isArray(src) ? src : src ? [src] : [];
  const currentSrc = sources[index];

  const fadeTo = (target, duration) => {
    const start = performance.now();
    const startOpacity = opacity;
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setOpacity(startOpacity + (target - startOpacity) * t);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentSrc) return;

    const handleLoaded = () => fadeTo(1, 500);
    const handleTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (remaining <= 0.55 && remaining > 0) fadeTo(0, 550);
    };
    const handleEnded = () => {
      if (sources.length > 1) {
        setIndex((prev) => (prev + 1) % sources.length);
      } else {
        video.currentTime = 0;
        video.play();
        fadeTo(1, 500);
      }
    };

    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSrc]);

  if (!currentSrc) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundImage: fallbackImage ? `url(${fallbackImage})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          animation: "bab-kenburns 18s ease-in-out infinite alternate",
        }}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      style={{ ...style, opacity }}
      src={currentSrc}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  );
}