import { Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type Hls from "hls.js";

interface VideoProps {
  src: string;
  className?: string;
}

function getMp4Fallback(src: string) {
  const url = new URL(src);
  if (url.hostname !== "res.cloudinary.com") return;
  const converted = url.pathname
    .replace(/(\/video\/upload\/)sp_[^/]+\//, "$1f_mp4,vc_h264/")
    .replace(/\.(m3u8|mov|webm)$/i, ".mp4");
  if (converted === url.pathname) return;
  if (!converted.includes("/f_mp4,vc_h264/")) {
    url.pathname = converted.replace("/video/upload/", "/video/upload/f_mp4,vc_h264/");
  } else {
    url.pathname = converted;
  }
  return url.href;
}

function VideoPlayer({ src, className }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !attempt) return;

    let active = true;
    let hls: Hls | undefined;
    let fallback: string | undefined;
    try { fallback = getMp4Fallback(src); } catch { /* Local or relative source. */ }

    const play = () => {
      if (active) void video.play().catch(() => {});
    };
    const loadNative = (url: string) => {
      video.src = url;
      play();
    };
    const fail = () => {
      if (!active) return;
      hls?.destroy();
      hls = undefined;
      if (fallback) {
        const url = fallback;
        fallback = undefined;
        loadNative(url);
      } else {
        setStatus("error");
      }
    };
    const ready = () => setStatus("ready");
    video.addEventListener("error", fail);
    video.addEventListener("loadedmetadata", ready);

    if (!/\.m3u8(?:[?#]|$)/i.test(src) || video.canPlayType("application/vnd.apple.mpegurl")) {
      loadNative(src);
    } else {
      void import("hls.js").then(({ default: HlsPlayer }) => {
        if (!active) return;
        if (!HlsPlayer.isSupported()) {
          fail();
          return;
        }
        hls = new HlsPlayer();
        hls.on(HlsPlayer.Events.ERROR, (_event, data) => {
          if (data.fatal) fail();
        });
        hls.on(HlsPlayer.Events.MANIFEST_PARSED, play);
        hls.attachMedia(video);
        hls.loadSource(src);
      }).catch(fail);
    }

    return () => {
      active = false;
      hls?.destroy();
      video.removeEventListener("error", fail);
      video.removeEventListener("loadedmetadata", ready);
      video.removeAttribute("src");
      video.load();
    };
  }, [src, attempt]);

  return (
    <div className="relative bg-black">
      {!attempt ? (
        <button type="button" onClick={() => setAttempt(1)} className="flex aspect-video max-h-80 w-full items-center justify-center gap-2 bg-zinc-900 text-sm font-semibold text-white transition hover:bg-zinc-800">
          <Play size={20} aria-hidden="true" /> Play video
        </button>
      ) : (
        <>
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            aria-label="Post video"
            className={className ?? "max-h-[500px] w-full rounded-xl bg-black object-contain"}
          />
          {status === "loading" && <p role="status" className="px-4 py-2 text-sm text-zinc-400">Loading video…</p>}
          {status === "error" && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <p role="alert" className="text-zinc-300">This video couldn’t load.</p>
              <button type="button" onClick={() => {
                setStatus("loading");
                setAttempt((current) => current + 1);
              }} className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-3 py-1.5 text-white hover:bg-white/10">
                <RotateCcw size={15} aria-hidden="true" /> Try again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HlsVideoPlayer(props: VideoProps) {
  return <VideoPlayer key={props.src} {...props} />;
}
