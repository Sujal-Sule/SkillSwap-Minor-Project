import React, { useEffect, useRef } from 'react';
import { MicrophoneIcon, MicrophoneSlashIcon } from './icons';

interface VideoPlayerProps {
    stream: MediaStream | null;
    muted: boolean;
    label: string;
    isLocal: boolean;
    isMicOn: boolean;
    isFocused?: boolean;
    filter?: string; // New prop for CSS filters
    objectFit?: 'cover' | 'contain';
    mirror?: boolean; // New prop to explicitly control mirroring
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ stream, muted, label, isLocal, isMicOn, isFocused, filter, objectFit, mirror }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Default mirroring behavior: mirror if local, unless explicitly set otherwise
    const shouldMirror = mirror !== undefined ? mirror : isLocal;

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className={`bg-slate-800 rounded-lg overflow-hidden aspect-[16/10] relative flex items-center justify-center transition-all duration-300 ${isFocused ? 'border-2 border-sky-500 shadow-lg shadow-sky-500/20' : 'border-2 border-slate-700'}`}>
            {!stream && (
                <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                    {/* Placeholder content could be better, maybe user initials? */}
                    <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-2xl">
                        {label.charAt(0)}
                    </div>
                </div>
            )}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={muted}
                style={{
                    transform: shouldMirror ? 'scaleX(-1)' : 'none',
                    filter: filter || 'none',
                    objectFit: objectFit || 'cover'
                }}
                className="w-full h-full relative z-10"
            ></video>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between z-20">
                <span className="text-white text-sm font-semibold">{label}</span>
                {isMicOn ? (
                    <MicrophoneIcon className="w-4 h-4 text-green-400" />
                ) : (
                    <MicrophoneSlashIcon className="w-4 h-4 text-red-400" />
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;