import React, { useEffect, useRef } from "react";
import { MicrophoneIcon, MicrophoneSlashIcon } from "./icons";

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted: boolean;
  label: string;
  isLocal: boolean;
  isMicOn: boolean;
  isFocused?: boolean;
  filter?: string;
  objectFit?: "cover" | "contain";
  mirror?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  stream,
  muted,
  label,
  isLocal,
  isMicOn,
  isFocused,
  filter,
  objectFit = "cover",
  mirror,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (!stream) {
      videoEl.srcObject = null;
      return;
    }

    const currentSrcObject = videoEl.srcObject as MediaStream | null;
    const tracksEqual = (() => {
      if (!currentSrcObject) return false;
      const tracksA = currentSrcObject.getTracks();
      const tracksB = stream.getTracks();
      if (tracksA.length !== tracksB.length) return false;
      const idsA = new Set(tracksA.map((t) => t.id));
      return tracksB.every((t) => idsA.has(t.id));
    })();

    if (!tracksEqual) {
      videoEl.srcObject = stream;
    }

    videoEl.play().catch((err) => {
      if (err.name !== "AbortError") {
        console.warn("Autoplay failed:", err);
      }
    });

    const handleTrackChange = () => {
      const current = videoEl.srcObject as MediaStream | null;
      if (current !== stream) {
        videoEl.srcObject = stream;
      }
      videoEl.play().catch(() => {});
    };

    stream.addEventListener("addtrack", handleTrackChange);
    stream.addEventListener("removetrack", handleTrackChange);

    return () => {
      stream.removeEventListener("addtrack", handleTrackChange);
      stream.removeEventListener("removetrack", handleTrackChange);
    };
  }, [stream]);

  const shouldMirror = mirror !== undefined ? mirror : isLocal;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden bg-background w-full aspect-video group border transition-all ${isFocused ? "border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.3)]" : "border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)]"}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full"
        style={{
          objectFit,
          transform: shouldMirror ? "scaleX(-1)" : "none",
          filter: filter || "none",
        }}
      />

      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mx-auto mb-2 border border-slate-200/10 dark:border-slate-800/10 shadow-[2px_2px_5px_rgba(163,177,198,0.15),_-2px_-2px_5px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_5px_rgba(0,0,0,0.45)]">
              <span className="text-lg font-black text-text-primary">
                {label.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider">{label}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-center">
        <span className="text-white text-xs font-bold truncate max-w-[70%]">
          {label}
        </span>
        <div
          className={`w-5 h-5 ${isMicOn ? "text-green-400" : "text-red-400"}`}
        >
          {isMicOn ? (
            <MicrophoneIcon className="w-full h-full" />
          ) : (
            <MicrophoneSlashIcon className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
