import React, { useState, useEffect, useRef } from 'react';
import type { User, Session } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import Whiteboard from '../components/Whiteboard';
import { VideoCameraIcon, VideoCameraSlashIcon, MicrophoneSlashIcon, ClockIcon, TokenIcon, PlayCircleIcon, ArrowUpTrayIcon, SparklesIcon, MicrophoneIcon, ArrowPathIcon } from '../components/icons';
import { api } from '../services/api';

interface LiveSessionPageProps {
    session: Session;
    currentUser: User;
    otherUser: User;
    onEndSession: () => void;
}

const LiveSessionPage: React.FC<LiveSessionPageProps> = ({ session, currentUser, otherUser, onEndSession }) => {
    // State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [effectsActive, setEffectsActive] = useState(false);
    const [viewMode, setViewMode] = useState<'whiteboard' | 'screen_share'>('whiteboard');

    // Refs
    const allStreamsRef = useRef<MediaStream[]>([]);
    const cameraStreamRef = useRef<MediaStream | null>(null); // Stores the original camera stream
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const startTimeRef = useRef<number | null>(null);
    const audioTrackRef = useRef<MediaStreamTrack | null>(null); // Dedicated ref for audio track
    const videoTrackRef = useRef<MediaStreamTrack | null>(null); // Dedicated ref for camera video track

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };



    // --- Timer Logic (Robust) ---
    useEffect(() => {
        const fetchStartTime = async () => {
            try {
                console.log("Syncing start time for session", session.id);
                const res = await api.put(`/sessions/${session.id}/start`);
                console.log("Start time res:", res);
                if (res.startedAt) {
                    const timeString = res.startedAt.endsWith('Z') ? res.startedAt : res.startedAt + 'Z';
                    startTimeRef.current = new Date(timeString).getTime();
                    const now = Date.now();
                    setElapsedTime(Math.max(0, Math.floor((now - startTimeRef.current) / 1000)));
                } else {
                    console.warn("No startedAt in response");
                }
            } catch (error) {
                console.error("Error syncing start time", error);
            }
        };
        fetchStartTime();

        const interval = setInterval(() => {
            if (startTimeRef.current) {
                const now = Date.now();
                setElapsedTime(Math.max(0, Math.floor((now - startTimeRef.current) / 1000)));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session.id]);


    // --- Media & WebRTC Logic ---
    useEffect(() => {
        let ignoreOffer = false;
        let makingOffer = false;
        const polite = currentUser.id !== session.proposerId;

        const setupMediaAndConnection = async () => {
            try {
                // 1. Get User Media with Bandwidth Constraints
                // Default to 480p to save data. Scale resolution down by default in sender if possible, but constraints are safer first step.
                const constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        frameRate: { ideal: 24, max: 30 }
                    }
                };

                console.log("Requesting media with constraints:", constraints);
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                setLocalStream(stream);
                cameraStreamRef.current = stream;
                allStreamsRef.current.push(stream);
                setPermissionError(null);

                // Store tracks for robust toggling
                audioTrackRef.current = stream.getAudioTracks()[0] || null;
                videoTrackRef.current = stream.getVideoTracks()[0] || null;

                // 2. Init PeerConnection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                    iceCandidatePoolSize: 2 // Optimization
                });
                peerConnection.current = pc;

                // 3. Add Tracks & Configure Bitrate
                stream.getTracks().forEach(track => {
                    const sender = pc.addTrack(track, stream);

                    // Apply Bitrate Limits for Video
                    if (track.kind === 'video') {
                        const params = sender.getParameters();
                        if (!params.encodings) params.encodings = [{}];
                        // Max 400kbps for mobile optimization
                        params.encodings[0].maxBitrate = 400000;
                        // params.encodings[0].scaleResolutionDownBy = 1.0; 
                        sender.setParameters(params).then(() => {
                            console.log("Video bitrate limited to 400kbps");
                        }).catch(e => console.warn("Bitrate limit failed", e));
                    }
                });

                // 4. Handle Remote Tracks
                pc.ontrack = ({ track, streams }) => {
                    console.log("Received remote track", track.kind, streams[0].id);
                    // Ensure we attach to the stream properly.
                    // If stream already exists, this might fire for the second track (audio/video).
                    // We set it every time to ensure state updates.
                    if (streams[0]) {
                        setRemoteStream(streams[0]);

                        // Handle track unmuting (important for screen share start/stop on remote side)
                        track.onunmute = () => {
                            console.log(`Remote track ${track.kind} unmuted`);
                            // Force re-render if needed or re-set stream
                            setRemoteStream(prev => prev ? prev : streams[0]);
                        };
                    }
                };

                // 5. Handle ICE Candidates
                pc.onicecandidate = ({ candidate }) => {
                    if (candidate) {
                        const signal = {
                            type: 'signal',
                            target: otherUser.id,
                            sender: currentUser.id,
                            payload: { type: 'candidate', candidate: candidate }
                        };
                        window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
                    }
                };

                // 6. Perfect Negotiation Implementation
                pc.onnegotiationneeded = async () => {
                    try {
                        makingOffer = true;
                        // For stability, wait a tick? No, standard is immediate.
                        await pc.setLocalDescription();
                        const signal = {
                            type: 'signal',
                            target: otherUser.id,
                            sender: currentUser.id,
                            payload: { type: 'description', description: pc.localDescription }
                        };
                        window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
                    } catch (err) {
                        console.error("Negotiation error", err);
                    } finally {
                        makingOffer = false;
                    }
                };

                // Connection Monitoring
                pc.oniceconnectionstatechange = () => {
                    console.log("ICE State:", pc.iceConnectionState);
                    if (['disconnected', 'failed', 'closed'].includes(pc.iceConnectionState)) {
                        // Don't nullify remote stream immediately on disconnected, it might be a temporary network glitch (switching wifi/data)
                        // Only on failed or closed.
                        if (pc.iceConnectionState !== 'disconnected') {
                            setRemoteStream(null);
                        }
                    }
                };

                // Queue for ICE candidates
                const candidateQueue: RTCIceCandidateInit[] = [];
                let isSettingRemoteDescription = false;

                // 7. Signal Handling
                const handleSignal = async (e: CustomEvent) => {
                    const data = e.detail;
                    if (data.sender === currentUser.id) return;

                    // Handle Mode Change
                    if (data.payload?.type === 'mode_change') {
                        console.log("Remote peer changed mode:", data.payload.mode);
                        setViewMode(data.payload.mode);
                        return;
                    }

                    // Handle User Joined (Trigger Renegotiation if needed)
                    if (data.payload?.type === 'user_joined') {
                        console.log("Remote user joined - checking connection");
                        const pc = peerConnection.current;
                        if (pc) {
                            console.log("Triggering ICE restart for new peer");
                            // Force negotiation start
                            pc.restartIce();
                        }
                        return;
                    }

                    const pc = peerConnection.current;
                    if (!pc || pc.signalingState === 'closed') return;

                    const { description, candidate } = data.payload;

                    try {
                        if (description) {
                            const offerCollision = (description.type === 'offer') &&
                                (makingOffer || pc.signalingState !== 'stable');

                            ignoreOffer = !polite && offerCollision;
                            if (ignoreOffer) {
                                console.log("Ignoring colliding offer (impolite)");
                                return;
                            }

                            isSettingRemoteDescription = true;
                            if (offerCollision) {
                                await pc.setLocalDescription({ type: 'rollback' });
                            }

                            await pc.setRemoteDescription(description);
                            isSettingRemoteDescription = false;

                            // Flush candidates
                            while (candidateQueue.length) {
                                const buffered = candidateQueue.shift();
                                if (buffered) await pc.addIceCandidate(buffered);
                            }

                            if (description.type === 'offer') {
                                await pc.setLocalDescription();
                                const signal = {
                                    type: 'signal',
                                    target: otherUser.id,
                                    sender: currentUser.id,
                                    payload: { type: 'description', description: pc.localDescription }
                                };
                                window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
                            }

                        } else if (candidate) {
                            try {
                                if (pc.remoteDescription && !isSettingRemoteDescription) {
                                    await pc.addIceCandidate(candidate);
                                } else {
                                    candidateQueue.push(candidate);
                                }
                            } catch (err) {
                                if (!ignoreOffer) throw err;
                            }
                        }
                    } catch (err) {
                        console.error("Signal Handling Error", err);
                        isSettingRemoteDescription = false;
                    }
                };

                window.addEventListener('webrtc-signal', handleSignal as EventListener);
                (window as any)._tempSignalHandler = handleSignal;

            } catch (err) {
                console.error("Access denied or API error", err);
                setPermissionError("Camera/Mic permissions required.");
            }
        };

        const startSession = () => {
            setupMediaAndConnection().then(() => {
                const signal = {
                    type: 'signal',
                    target: otherUser.id,
                    sender: currentUser.id,
                    payload: { type: 'user_joined' }
                };
                window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
            });
        };

        if ((window as any).SKILLSWAP_SIGNAL_READY) {
            startSession();
        } else {
            const readyHandler = () => {
                startSession();
                window.removeEventListener('skillswap-signal-ready', readyHandler);
            };
            window.addEventListener('skillswap-signal-ready', readyHandler);

            // Timeout fallback
            const timeoutId = setTimeout(() => {
                if (!peerConnection.current) {
                    console.warn("Signal timeout - forcing start");
                    startSession();
                }
            }, 3000);

            return () => {
                window.removeEventListener('skillswap-signal-ready', readyHandler);
                clearTimeout(timeoutId);
            };
        }

        return () => {
            if ((window as any)._tempSignalHandler) {
                window.removeEventListener('webrtc-signal', (window as any)._tempSignalHandler);
                delete (window as any)._tempSignalHandler;
            }
            // Logic handled in handleEndSession, but effectively cleanup here too for unmount.
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (cameraStreamRef.current) {
                cameraStreamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const handleEndSession = () => {
        console.log("Ending session and cleaning up");

        // Stop all tracks in all tracked streams
        allStreamsRef.current.forEach(stream => {
            stream?.getTracks().forEach(t => {
                t.stop();
                t.enabled = false;
            });
        });

        // Specifically stop camera and local refs
        if (cameraStreamRef.current) {
            cameraStreamRef.current.getTracks().forEach(t => t.stop());
        }
        if (localStream) {
            localStream.getTracks().forEach(t => t.stop());
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Reset states
        setLocalStream(null);
        setRemoteStream(null);
        setIsMicOn(false);
        setIsCameraOn(false);

        onEndSession();
    };

    const toggleAudio = () => {
        const audioTrack = audioTrackRef.current;
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        const videoTrack = videoTrackRef.current;

        // If screen sharing, toggling video should maybe just toggle the *camera* logic 
        // but we are hiding camera anyway. 
        // Standard behavior: Toggle camera on/off.

        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsCameraOn(videoTrack.enabled);

            // If we are NOT screen sharing, update the local preview visually if needed
            // But since localStream uses the same track, it might just go black.
            // That is expected behavior.
        }
    };

    const toggleScreenShare = async () => {
        const pc = peerConnection.current;
        if (!pc) return;

        if (isScreenSharing) {
            // --- STOP SCREEN SHARE ---
            try {
                // 1. Get the screen track and stop it
                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');

                if (videoSender && videoSender.track) {
                    videoSender.track.stop();
                }

                // 2. Restore Camera Track (Robust)
                let camTrack = videoTrackRef.current;
                let streamToRestore = cameraStreamRef.current;

                // CHECK VALIDITY: If track is ended or missing, re-acquire
                if (!camTrack || camTrack.readyState === 'ended' || !streamToRestore) {
                    console.log("Camera track ended or missing. Re-acquiring...");
                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 640 }, height: { ideal: 480 } },
                        audio: true // Start audio too to keep sync, will replace
                    });
                    camTrack = newStream.getVideoTracks()[0];

                    // Update refs
                    cameraStreamRef.current = newStream;
                    videoTrackRef.current = camTrack;
                    // Update Audio Ref too if needed
                    const newAudio = newStream.getAudioTracks()[0];
                    if (newAudio) {
                        audioTrackRef.current = newAudio;
                        const audioSender = senders.find(s => s.track?.kind === 'audio');
                        if (audioSender) audioSender.replaceTrack(newAudio);
                    }

                    streamToRestore = newStream;
                    allStreamsRef.current.push(newStream);
                }

                // Ensure enabled state matches UI
                camTrack.enabled = isCameraOn;

                if (videoSender) {
                    await videoSender.replaceTrack(camTrack);
                }

                // 3. Restore Local Preview
                setLocalStream(streamToRestore);

                setIsScreenSharing(false);
                setViewMode('whiteboard');

                // 4. Signal Mode Change
                window.dispatchEvent(new CustomEvent('send-webrtc-signal', {
                    detail: {
                        type: 'signal',
                        target: otherUser.id,
                        sender: currentUser.id,
                        payload: { type: 'mode_change', mode: 'whiteboard' }
                    }
                }));

            } catch (e) {
                console.error("Error stopping screen share:", e);
            }

        } else {
            // --- START SCREEN SHARE ---
            try {
                // 1. Get Screen Stream
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: 15 },
                    audio: false
                });

                const screenTrack = displayStream.getVideoTracks()[0];
                allStreamsRef.current.push(displayStream);

                // 2. Replace Track
                const senders = pc.getSenders();
                const videoSender = senders.find(s => s.track?.kind === 'video');

                if (videoSender) {
                    await videoSender.replaceTrack(screenTrack);
                }

                // 3. Update Local Preview
                setLocalStream(displayStream);

                setIsScreenSharing(true);
                setViewMode('screen_share');

                // 4. Signal Mode Change
                window.dispatchEvent(new CustomEvent('send-webrtc-signal', {
                    detail: {
                        type: 'signal',
                        target: otherUser.id,
                        sender: currentUser.id,
                        payload: { type: 'mode_change', mode: 'screen_share' }
                    }
                }));

                // 5. Handle "Stop sharing" from browser bar
                screenTrack.onended = () => {
                    console.log("Screen share ended natively");
                    // Execute robust restoration inline
                    const restore = async () => {
                        const pc = peerConnection.current;
                        const senders = pc ? pc.getSenders() : [];
                        const videoSender = senders.find(s => s.track?.kind === 'video');

                        let camTrack = videoTrackRef.current;
                        let streamToRestore = cameraStreamRef.current;

                        if (!camTrack || camTrack.readyState === 'ended' || !streamToRestore) {
                            const newStream = await navigator.mediaDevices.getUserMedia({
                                video: { width: { ideal: 640 }, height: { ideal: 480 } },
                                audio: true
                            });
                            camTrack = newStream.getVideoTracks()[0];
                            cameraStreamRef.current = newStream;
                            videoTrackRef.current = camTrack;
                            streamToRestore = newStream;

                            const newAudio = newStream.getAudioTracks()[0];
                            if (newAudio) {
                                audioTrackRef.current = newAudio;
                                const audioSender = senders.find(s => s.track?.kind === 'audio');
                                if (audioSender) audioSender.replaceTrack(newAudio);
                            }
                        }

                        if (videoSender) videoSender.replaceTrack(camTrack).catch(console.error);
                        setLocalStream(streamToRestore);
                        setIsScreenSharing(false);
                        setViewMode('whiteboard');

                        window.dispatchEvent(new CustomEvent('send-webrtc-signal', {
                            detail: {
                                type: 'signal',
                                target: otherUser.id,
                                sender: currentUser.id,
                                payload: { type: 'mode_change', mode: 'whiteboard' }
                            }
                        }));
                    };
                    restore();
                };

            } catch (err) {
                console.error("Error starting screen share:", err);
            }
        }
    };

    const toggleEffects = () => {
        setEffectsActive(prev => !prev);
    };

    if (permissionError) {
        return (
            <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">Permissions Required</h2>
                <p className="text-slate-300 max-w-md mb-8">{permissionError}</p>
                <button
                    onClick={handleEndSession}
                    className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-screen bg-slate-950 text-white flex flex-col">
            <header className="p-4 flex justify-between items-center bg-slate-950/50 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <PlayCircleIcon className="w-8 h-8 text-sky-400" />
                    <h1 className="text-xl font-bold">
                        Live Session: <span className="text-slate-300 font-medium">{session.skill.name}</span>
                    </h1>
                </div>
                <div className="flex items-center gap-6 text-slate-300 font-mono">
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-5 h-5" />
                        <span>Time: {formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <TokenIcon className="w-5 h-5 text-amber-400" />
                        <span>Cost: 1 Token/Session</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex p-4 gap-4 overflow-hidden">
                <div className="flex-1 flex flex-col rounded-lg overflow-hidden relative bg-slate-900 border border-slate-800">
                    {viewMode === 'whiteboard' ? (
                        <>
                            <div className="absolute inset-0 flex items-center justify-center text-center text-slate-700/20 p-8 z-0 pointer-events-none">
                                <div>
                                    <h2 className="text-4xl font-bold">Collaborative Whiteboard</h2>
                                    <p className="mt-4 text-xl">Use the tools to draw, write, and collaborate in real-time.</p>
                                </div>
                            </div>
                            <Whiteboard sessionId={session.id} />
                        </>
                    ) : (
                        // Screen Share View (Full Size)
                        <div className="w-full h-full flex items-center justify-center bg-black">
                            <VideoPlayer
                                stream={isScreenSharing ? localStream : remoteStream}
                                muted={true}
                                label={isScreenSharing ? "You (Presenting)" : `${otherUser.name} (Screen)`}
                                isLocal={isScreenSharing}
                                isMicOn={true}
                                isFocused={false}
                                objectFit="contain"
                            />
                        </div>
                    )}

                </div>

                <aside className="w-[320px] flex-shrink-0 flex flex-col gap-4">
                    <div className="flex-1 space-y-4 flex flex-col">
                        {/* Side views: If mode is whiteboard, show cams. If mode is screen share, show cams. */}
                        {/* If screen sharing, the main view has the screen. Side view should show FACES. */}
                        {/* If I am sharing screen: Main=MyScreen. Side=RemoteFace. 
                            If They are sharing: Main=TheirScreen. Side=MyFace? No, Side=RemoteFace still? */}

                        {/* Logic: Always show the "Other Person" in the top side box, UNLESS they are on the main screen? 
                            If they are on main screen (sharing), we could still show their face if we had multi-stream. 
                            But we only have 1 track per peer (video). So if they share screen, their face is GONE from the stream.
                            So we can only show what we have.
                        */}

                        {/* If viewMode is 'screen_share', the remote video track IS the screen. 
                            So VideoPlayer(remoteStream) shows screen.
                            So we shouldn't put it in the side bar if it's in the main bar.
                        */}

                        {viewMode === 'whiteboard' ? (
                            <>
                                <VideoPlayer stream={remoteStream} muted={false} label={otherUser.name} isLocal={false} isMicOn={true} isFocused={true} />
                                <VideoPlayer
                                    stream={localStream}
                                    muted={true}
                                    label={isScreenSharing ? "Your Screen" : "You"}
                                    isLocal={true}
                                    isMicOn={isMicOn}
                                    mirror={!isScreenSharing}
                                    filter={effectsActive ? 'brightness(1.2) contrast(1.1) saturate(1.4) sepia(0.2)' : undefined}
                                />
                            </>
                        ) : (
                            // Screen Share Mode Sidebar
                            <>
                                {/* Initial implementation: Keep showing local cam here so I can see myself. 
                                    Remote stream is occupied by screen share basically.
                                */}
                                <VideoPlayer
                                    stream={localStream}
                                    muted={true}
                                    label={isScreenSharing ? "Your Screen" : "You"}
                                    isLocal={true}
                                    isMicOn={isMicOn}
                                    mirror={!isScreenSharing}
                                    filter={effectsActive ? 'brightness(1.2) contrast(1.1) saturate(1.4) sepia(0.2)' : undefined}
                                />
                                {isScreenSharing && (
                                    // If I am sharing, I see remote user here
                                    <VideoPlayer stream={remoteStream} muted={false} label={otherUser.name} isLocal={false} isMicOn={true} isFocused={true} />
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleAudio}
                                className={`p-4 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
                            >
                                {isMicOn ? <MicrophoneIcon className="w-6 h-6 text-white" /> : <MicrophoneSlashIcon className="w-6 h-6 text-white" />}
                            </button>
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full transition-colors ${isCameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                title={isCameraOn ? 'Stop Camera' : 'Start Camera'}
                                disabled={isScreenSharing}
                            >
                                {isCameraOn ? <VideoCameraIcon className="w-6 h-6 text-white" /> : <VideoCameraSlashIcon className="w-6 h-6 text-white" />}
                            </button>
                            <button
                                onClick={toggleScreenShare}
                                className={`p-4 rounded-full transition-colors ${isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`}
                                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                            >
                                <ArrowUpTrayIcon className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={() => {
                                    if (peerConnection.current) {
                                        console.log("User requested ICE restart");
                                        peerConnection.current.restartIce();
                                    }
                                }}
                                className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors pointer-events-auto"
                                title="Reconnect Video (Fix Glitches)"
                            >
                                <ArrowPathIcon className="w-6 h-6 text-white" />
                            </button>
                            <button
                                onClick={toggleEffects}
                                className={`p-4 rounded-full transition-colors ${effectsActive ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-700 hover:bg-slate-600'} relative`}
                                title="Toggle Effects (Beauty Mode)"
                            >
                                <SparklesIcon className="w-6 h-6 text-white" />
                                {effectsActive && <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-white animate-pulse"></span>}
                            </button>
                        </div>
                        <button
                            onClick={handleEndSession}
                            className="w-full px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors"
                            title="End Session"
                        >
                            End Session
                        </button>
                    </div>
                </aside>
            </main>
        </div >
    );
};

export default LiveSessionPage;