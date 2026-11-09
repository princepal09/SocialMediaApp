import { useEffect, useRef } from "react";
import type Hls from "hls.js";

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
    let active = true;

    if (!src.includes(".m3u8") || video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      void import("hls.js").then(({ default: HlsPlayer }) => {
        if (!active || !HlsPlayer.isSupported()) return;
        hls = new HlsPlayer();
        hls.loadSource(src);
        hls.attachMedia(video);
      }).catch(() => {
        if (active) video.src = src;
      });
    }

    return () => {
      active = false;
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
