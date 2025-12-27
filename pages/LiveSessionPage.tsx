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
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const startTimeRef = useRef<number | null>(null);

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
                    // Ensure we treat the backend time as UTC or properly ISO formatted
                    // If it ends with Z, it's UTC. If not, appending Z often fixes 'local assumption' issues if backend is UTC.
                    // But standard is: backend sends ISO string.
                    const timeString = res.startedAt.endsWith('Z') ? res.startedAt : res.startedAt + 'Z';
                    startTimeRef.current = new Date(timeString).getTime();

                    // Initial sync
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
        const polite = currentUser.id !== session.proposerId; // Proposer is impolite (initiator)

        const setupMediaAndConnection = async () => {
            try {
                // 1. Get User Media
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                cameraStreamRef.current = stream;
                allStreamsRef.current.push(stream);
                setPermissionError(null);

                // 2. Init PeerConnection
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                peerConnection.current = pc;

                // 3. Add Tracks
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                // 4. Handle Remote Tracks
                pc.ontrack = ({ track, streams }) => {
                    console.log("Received remote track", track.kind, streams[0].id);
                    setRemoteStream(streams[0]);
                    // Fallback to ensure unmute catch if needed, but primary set should be immediate
                    track.onunmute = () => {
                        console.log("Track unmuted", track.kind);
                        setRemoteStream(streams[0]);
                    };
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

                // 6. Perfect Negotiation: Negotiation Needed
                pc.onnegotiationneeded = async () => {
                    try {
                        makingOffer = true;
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

                // Monitor Connection State (Handle Disconnects)
                pc.oniceconnectionstatechange = () => {
                    console.log("ICE Connection State:", pc.iceConnectionState);
                    if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'closed') {
                        console.log("Remote peer disconnected");
                        setRemoteStream(null);
                    }
                };

                pc.onconnectionstatechange = () => {
                    console.log("Peer Connection State:", pc.connectionState);
                    if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                        setRemoteStream(null);
                    }
                };

                console.log("Setup WebRTC - Me:", currentUser.id, "Proposer:", session.proposerId, "Polite:", polite);

                // Queue for ICE candidates
                const candidateQueue: RTCIceCandidateInit[] = [];
                let isSettingRemoteDescription = false;

                // 7. Signal Handling Logic (Closure captures polite/makingOffer)
                const handleSignal = async (e: CustomEvent) => {
                    const data = e.detail;
                    if (data.sender === currentUser.id) return;

                    // Handle Mode Change
                    if (data.payload?.type === 'mode_change') {
                        setViewMode(data.payload.mode);
                        return;
                    }

                    const pc = peerConnection.current;
                    if (!pc || pc.signalingState === 'closed') return;

                    const { description, candidate } = data.payload;

                    try {
                        if (description) {
                            // Perfect Negotiation Pattern
                            const offerCollision = (description.type === 'offer') &&
                                (makingOffer || pc.signalingState !== 'stable');

                            ignoreOffer = !polite && offerCollision;
                            if (ignoreOffer) {
                                console.log("Impolite peer matches collision, ignoring offer");
                                return;
                            }

                            isSettingRemoteDescription = true;
                            if (offerCollision) {
                                // Polite peer rolls back
                                console.log("Polite peer rolling back");
                                await pc.setLocalDescription({ type: 'rollback' });
                            }

                            // Guard: Don't set remote ANSWER if we are already stable (implies we rolled back or didn't offer)
                            if (description.type === 'answer' && pc.signalingState === 'stable') {
                                console.warn("Ignored remote answer because signalingState is stable (likely old answer to rolled-back offer)");
                                isSettingRemoteDescription = false;
                                return;
                            }

                            await pc.setRemoteDescription(description);
                            isSettingRemoteDescription = false;

                            // Flush buffered candidates
                            while (candidateQueue.length) {
                                const bufferedCandidate = candidateQueue.shift();
                                if (bufferedCandidate) {
                                    console.log("Flushing buffered candidate");
                                    await pc.addIceCandidate(bufferedCandidate);
                                }
                            }

                            if (description.type === 'offer') {
                                await pc.setLocalDescription(); // Auto-creates answer
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
                                    // Queue candidate if remote description is not yet set
                                    console.log("Queueing ICE candidate (remote description not set)");
                                    candidateQueue.push(candidate);
                                }
                            } catch (err) {
                                if (!ignoreOffer) throw err;
                            }
                        }
                    } catch (err) {
                        console.error("Signaling Error", err);
                        isSettingRemoteDescription = false;
                    }
                };

                // Attach Listener
                window.addEventListener('webrtc-signal', handleSignal as EventListener);

                // Cleanup Listener on unmount only
                // BUT wait, we need to return the cleanup function from setup? No, from useEffect.
                // We need to store handleSignal ref to remove it?
                // Actually, simplify: define handleSignal INSIDE setup, but we need to remove it.
                // We'll assign it to a ref or just use a named function outside if possible?
                // Closure problems.
                // Let's attach it to a MutableRef or property to clean it up.
                (window as any)._tempSignalHandler = handleSignal;

            } catch (err) {
                console.error("Error accessing media", err);
                setPermissionError("Camera/Mic access denied.");
            }
        };

        const startSession = () => {
            // 1. Get User Media and setup PeerConnection
            setupMediaAndConnection();
        };

        if ((window as any).SKILLSWAP_SIGNAL_READY) {
            startSession();
        } else {
            const readyHandler = () => {
                startSession();
                window.removeEventListener('skillswap-signal-ready', readyHandler);
            };
            window.addEventListener('skillswap-signal-ready', readyHandler);

            // Fallback timeout in case we missed the event or app is slow
            setTimeout(() => {
                if (!peerConnection.current) {
                    console.warn("Signal ready event timeout - forcing start");
                    startSession();
                }
            }, 2000);

            return () => window.removeEventListener('skillswap-signal-ready', readyHandler);
        }

        return () => {
            if ((window as any)._tempSignalHandler) {
                window.removeEventListener('webrtc-signal', (window as any)._tempSignalHandler);
                delete (window as any)._tempSignalHandler;
            }

            // Cleanup streams
            const stopTracks = (stream: MediaStream | null) => {
                if (stream) stream.getTracks().forEach(t => t.stop());
            };
            // Note: full cleanup handles in handleEndSession, here just stop if unmounts unexpectedly
            if (cameraStreamRef.current) stopTracks(cameraStreamRef.current);
            allStreamsRef.current.forEach(stopTracks);

            if (peerConnection.current) {
                peerConnection.current.close();
            }
        };
    }, []); // Run once

    const handleEndSession = () => {
        console.log("Ending session, cleaning up streams...");
        // Explicit cleanup
        const stopTracks = (stream: MediaStream | null) => {
            if (stream) {
                stream.getTracks().forEach(track => {
                    console.log(`Stopping track: ${track.kind} (${track.id})`);
                    track.stop();
                    track.enabled = false;
                });
            }
        };

        stopTracks(localStream);
        if (cameraStreamRef.current && cameraStreamRef.current !== localStream) {
            stopTracks(cameraStreamRef.current);
        }
        stopTracks(remoteStream);

        // Nuke all tracked streams
        if (allStreamsRef.current) {
            allStreamsRef.current.forEach(s => stopTracks(s));
            allStreamsRef.current = [];
        }

        if (peerConnection.current) {
            console.log("Closing PeerConnection");
            peerConnection.current.close();
            peerConnection.current = null;
        }
        onEndSession();
    };
    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            setIsMicOn(prev => !prev);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            setIsCameraOn(prev => !prev);
        }
    };

    const toggleScreenShare = async () => {
        if (isScreenSharing) {
            // Revert to Camera
            try {
                // Stop current screen share tracks
                localStream?.getTracks().forEach(track => track.stop());

                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                allStreamsRef.current.push(stream); // Track for cleanup

                // Replace Track in Sender
                if (peerConnection.current) {
                    const senders = peerConnection.current.getSenders();
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(stream.getVideoTracks()[0]);
                    }
                    // Audio track might be replaced automatically or simpler to replace too
                    const audioSender = senders.find(s => s.track?.kind === 'audio');
                    if (audioSender) {
                        audioSender.replaceTrack(stream.getAudioTracks()[0]);
                    }
                }

                setIsScreenSharing(false);
                setIsCameraOn(true);

                // Signal view mode change
                const signal = {
                    type: 'signal',
                    target: otherUser.id,
                    sender: currentUser.id,
                    payload: { type: 'mode_change', mode: 'whiteboard' }
                };
                window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
                setViewMode('whiteboard');

            } catch (e) {
                console.error("Failed to revert to camera", e);
            }
        } else {
            // Start Screen Share
            try {
                // Stop current camera tracks
                localStream?.getTracks().forEach(track => track.stop());

                const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                allStreamsRef.current.push(displayStream); // Track for cleanup
                const videoTrack = displayStream.getVideoTracks()[0];

                // Merge audio if needed, for now simplified just screen video + existing audio
                // Better: create composite or just replace video track
                const mixedStream = new MediaStream([videoTrack]);
                if (localStream) {
                    localStream.getAudioTracks().forEach(t => mixedStream.addTrack(t));
                }
                setLocalStream(mixedStream); // Show locally

                // Replace Track in PeerConnection
                if (peerConnection.current) {
                    const senders = peerConnection.current.getSenders();
                    const videoSender = senders.find(s => s.track?.kind === 'video');
                    if (videoSender) {
                        videoSender.replaceTrack(videoTrack);
                    }
                }

                setIsScreenSharing(true);

                // Signal view mode change
                const signal = {
                    type: 'signal',
                    target: otherUser.id,
                    sender: currentUser.id,
                    payload: { type: 'mode_change', mode: 'screen_share' }
                };
                window.dispatchEvent(new CustomEvent('send-webrtc-signal', { detail: signal }));
                setViewMode('screen_share'); // Technically I see my whiteboard, they see screen. 
                // Wait, if I share screen, *I* want to see my screen? No, I see my screen natively. 
                // The requester said: "see on my camera space also on dedicated space" logic.
                // If I share, I likely want the main view to remain Whiteboard for me, or follow suit.
                // Let's assume sync view.

                videoTrack.onended = () => {
                    toggleScreenShare();
                };

            } catch (err) {
                console.error("Error sharing screen:", err);
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
                                stream={remoteStream} // If I am receiver, I see remote (screen). If I am sender?
                                // If I am sender, I want to see what I am sharing (localStream)
                                // We need to know WHO is sharing. 
                                // Simplified: if isScreenSharing is true, I show localStream. Else remoteStream.
                                muted={true} // Main view usually muted to avoid echo if it's me
                                label={isScreenSharing ? "You (Screen)" : `${otherUser.name} (Screen)`}
                                isLocal={isScreenSharing}
                                isMicOn={true}
                                isFocused={false} // Custom style
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