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
    if (!videoEl || !stream) return;

    videoEl.srcObject = stream;

    // Listen for track additions/removals within the same stream
    // This handles screen share → camera restore when the stream object stays the same
    const handleTrackChange = () => {
      // Force the video element to notice the track change by reassigning srcObject
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      // Trigger play in case the video paused due to track change
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
      className={`relative rounded-lg overflow-hidden bg-slate-900 w-full aspect-video group border ${isFocused ? "border-sky-500 shadow-lg shadow-sky-500/30" : "border-slate-700"}`}
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

      {/* No stream placeholder */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl text-slate-400">
                {label.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{label}</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex justify-between items-center">
        <span className="text-white text-xs font-medium truncate max-w-[70%]">
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
