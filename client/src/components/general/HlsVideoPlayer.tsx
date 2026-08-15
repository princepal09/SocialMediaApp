import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface HlsVideoPlayerProps {
  src?: string;
  className?: string;
}

const HlsVideoPlayer = ({ src, className }: HlsVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari/iOS)
      video.src = src;
    } else {
      console.error("HLS is not supported in this browser");
    }

    return () => {
      if (hls) {
        hls.destroy();
      }

      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      controls
      playsInline
      className={
        className ?? "w-full max-h-[500px] rounded-xl object-contain bg-black"
      }
    />
  );
};

export default HlsVideoPlayer;
