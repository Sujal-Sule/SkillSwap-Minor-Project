import React, { useState, useEffect, useRef, useCallback } from "react";
import type { User, Session } from "../types";
import VideoPlayer from "../components/VideoPlayer";
import Whiteboard from "../components/Whiteboard";
import {
  VideoCameraIcon,
  VideoCameraSlashIcon,
  MicrophoneSlashIcon,
  ClockIcon,
  TokenIcon,
  PlayCircleIcon,
  ArrowUpTrayIcon,
  SparklesIcon,
  MicrophoneIcon,
  ArrowPathIcon,
} from "../components/icons";
import { api } from "../services/api";

interface LiveSessionPageProps {
  session: Session;
  currentUser: User;
  otherUser: User;
  onEndSession: () => void;
}

// === IMPROVED WebRTC Configuration ===
const ICE_CONFIG = {
  iceServers: [] as RTCIceServer[],
  iceTransportPolicy: "all" as const,
  bundlePolicy: "max-bundle" as const,
  rtcpMuxPolicy: "require" as const,
  iceCandidatePoolSize: 10, // Increased for better candidate gathering
};

// Network quality detection
function calcNetworkQuality(rtt: number, packetLoss: number): 0 | 1 | 2 | 3 {
  if (rtt === 0 && packetLoss === 0) return 0;
  if (rtt > 500 || packetLoss > 10) return 1;
  if (rtt > 200 || packetLoss > 3) return 2;
  return 3;
}

const LiveSessionPage: React.FC<LiveSessionPageProps> = ({
  session,
  currentUser,
  otherUser,
  onEndSession,
}) => {
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [effectsActive, setEffectsActive] = useState(false);
  const [viewMode, setViewMode] = useState<"whiteboard" | "screen_share">(
    "whiteboard"
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting" | "failed"
  >("connecting");
  const [networkQuality, setNetworkQuality] = useState<0 | 1 | 2 | 3>(0);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);

  // Refs
  const allStreamsRef = useRef<MediaStream[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iceRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isCleanedUpRef = useRef(false);
  
  // IMPROVED: Track ICE candidates for diagnostic
  const iceCandidatesRef = useRef<{ local: RTCIceCandidate[]; remote: RTCIceCandidate[] }>({
    local: [],
    remote: [],
  });
  
  // IMPROVED: Negotiation state
  const negotiationStateRef = useRef<"idle" | "negotiating" | "stable">("idle");

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // IMPROVED: Robust signaling through WebSocket
  const sendSignal = useCallback(
    (payload: any) => {
      const signal = {
        type: "signal",
        target: otherUser.id,
        sender: currentUser.id,
        payload,
        timestamp: Date.now(),
      };
      window.dispatchEvent(
        new CustomEvent("send-webrtc-signal", { detail: signal })
      );
    },
    [otherUser.id, currentUser.id]
  );

  const sendDataChannelMessage = useCallback((msg: Record<string, any>) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(JSON.stringify(msg));
    }
  }, []);

  // Timer
  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        const res = await api.put(`/sessions/${session.id}/start`);
        if (res.startedAt) {
          const timeString = res.startedAt.endsWith("Z")
            ? res.startedAt
            : res.startedAt + "Z";
          startTimeRef.current = new Date(timeString).getTime();
        }
      } catch (error) {
        console.error("Error syncing start time", error);
      }
    };
    fetchStartTime();

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(
          Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id]);

  // IMPROVED: Better stats collection
  const startStatsPolling = useCallback(
    (pc: RTCPeerConnection) => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

      statsIntervalRef.current = setInterval(async () => {
        if (!pc || pc.connectionState === "closed") return;

        try {
          const report = await pc.getStats();
          let bestRtt = 0;
          let bestPacketLoss = 0;
          let videoBitrate = 0;

          report.forEach((stat: any) => {
            // Get RTT from candidate pairs
            if (stat.type === "candidate-pair" && stat.state === "succeeded") {
              bestRtt = Math.max(bestRtt, (stat.currentRoundTripTime || 0) * 1000);
            }

            // Calculate packet loss and bitrate
            if (stat.type === "outbound-rtp" && stat.kind === "video") {
              videoBitrate = ((stat.bytesSent * 8) / 1000000) || 0;
              if (stat.packetsSent && stat.packetsLost) {
                bestPacketLoss = Math.max(
                  bestPacketLoss,
                  (stat.packetsLost / stat.packetsSent) * 100
                );
              }
            }

            if (stat.type === "inbound-rtp" && stat.kind === "video") {
              if (stat.packetsReceived && stat.packetsLost) {
                bestPacketLoss = Math.max(
                  bestPacketLoss,
                  (stat.packetsLost / stat.packetsReceived) * 100
                );
              }
            }
          });

          const quality = calcNetworkQuality(bestRtt, bestPacketLoss);
          setNetworkQuality(quality);

          // IMPROVED: Auto-adjust with smoother transitions
          if (!isScreenSharing) {
            const senders = pc.getSenders();
            const videoSender = senders.find((s) => s.track?.kind === "video");
            if (videoSender) {
              try {
                const params = videoSender.getParameters();
                if (params.encodings?.[0]) {
                  if (quality === 1) {
                    params.encodings[0].scaleResolutionDownBy = 4.0;
                    params.encodings[0].maxBitrate = 50000;
                    params.encodings[0].maxFramerate = 8;
                  } else if (quality === 2) {
                    params.encodings[0].scaleResolutionDownBy = 2.0;
                    params.encodings[0].maxBitrate = 120000;
                    params.encodings[0].maxFramerate = 15;
                  } else if (quality === 3) {
                    params.encodings[0].scaleResolutionDownBy = 1.0;
                    params.encodings[0].maxBitrate = 300000;
                    params.encodings[0].maxFramerate = 24;
                  }
                  await videoSender.setParameters(params).catch(() => {});
                }
              } catch (e) {
                console.warn("Stats adjustment failed", e);
              }
            }
          }
        } catch (e) {
          console.warn("Stats polling error", e);
        }
      }, 2000); // More frequent polling
    },
    [isScreenSharing]
  );

  // DataChannel handler
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === "mute_status") {
        if (msg.track === "audio") setRemoteMicOn(msg.enabled);
        if (msg.track === "video") setRemoteCameraOn(msg.enabled);
      }
    } catch (e) {
      console.error("DataChannel parse error", e);
    }
  }, []);

  const setupDataChannel = useCallback(
    (channel: RTCDataChannel) => {
      dataChannel.current = channel;
      channel.onmessage = handleDataChannelMessage;
      channel.onopen = () => {
        console.log("DataChannel opened");
        sendDataChannelMessage({
          type: "mute_status",
          track: "audio",
          enabled: isMicOn,
        });
        sendDataChannelMessage({
          type: "mute_status",
          track: "video",
          enabled: isCameraOn,
        });
      };
    },
    [handleDataChannelMessage, sendDataChannelMessage, isMicOn, isCameraOn]
  );

  // MAIN WebRTC Setup
  useEffect(() => {
    let makingOffer = false;
    let ignoreOffer = false;
    const polite = currentUser.id !== session.proposerId;
    isCleanedUpRef.current = false;

    const setupMediaAndConnection = async () => {
      try {
        // 1. Get TURN credentials FIRST
        let iceServers: RTCIceServer[] = [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ];
        try {
          const turnRes = await api.get("/turn/credentials");
          if (turnRes?.iceServers?.length > 0) {
            iceServers = turnRes.iceServers;
            console.log("Loaded TURN servers:", iceServers.length);
          }
        } catch (e) {
          console.warn("TURN fetch failed, using STUN only", e);
        }

        // 2. Request media with optimal constraints
        const nav = navigator as any;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        const isSlow =
          conn && (conn.effectiveType === "2g" || conn.effectiveType === "3g");
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        const useLowBandwidth = isSlow || isMobile;

        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
            sampleRate: 16000,
          } as any,
          video: useLowBandwidth
            ? {
                width: { ideal: 320, max: 480 },
                height: { ideal: 240, max: 360 },
                frameRate: { ideal: 15, max: 20 },
              }
            : {
                width: { ideal: 640, max: 1280 },
                height: { ideal: 480, max: 720 },
                frameRate: { ideal: 24, max: 30 },
              },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCleanedUpRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);
        cameraStreamRef.current = stream;
        allStreamsRef.current.push(stream);
        audioTrackRef.current = stream.getAudioTracks()[0] || null;
        videoTrackRef.current = stream.getVideoTracks()[0] || null;

        // 3. Create PeerConnection with optimal config
        const pc = new RTCPeerConnection({
          iceServers,
          iceTransportPolicy: "all",
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceCandidatePoolSize: 10,
        });
        peerConnection.current = pc;

        // 4. Add audio FIRST (priority)
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          const audioSender = pc.addTrack(audioTrack, stream);
          try {
            const params = audioSender.getParameters();
            if (!params.encodings) params.encodings = [{}];
            params.encodings[0].maxBitrate = 32000;
            await audioSender.setParameters(params);
          } catch (e) {
            console.warn("Audio params setup failed", e);
          }
        }

        // 5. Add video with simulcast for good connections
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          if (useLowBandwidth) {
            const videoSender = pc.addTrack(videoTrack, stream);
            try {
              const params = videoSender.getParameters();
              if (!params.encodings) params.encodings = [{}];
              params.encodings[0].maxBitrate = 150000;
              params.encodings[0].maxFramerate = 15;
              await videoSender.setParameters(params);
            } catch (e) {
              console.warn("Video params setup failed", e);
            }
          } else {
            // Simulcast for desktop
            const transceiver = pc.addTransceiver(videoTrack, {
              direction: "sendrecv",
              streams: [stream],
              sendEncodings: [
                { rid: "high", maxBitrate: 500000, maxFramerate: 30 },
                { rid: "mid", maxBitrate: 300000, maxFramerate: 24 },
                { rid: "low", maxBitrate: 100000, maxFramerate: 15 },
              ],
            });

            try {
              const params = transceiver.sender.getParameters();
              if (!params.encodings) params.encodings = [{}];
              await transceiver.sender.setParameters(params);
            } catch (e) {
              console.warn("Simulcast setup failed", e);
            }
          }
        }

        // 6. Create DataChannel
        const dc = pc.createDataChannel("control", { ordered: true });
        setupDataChannel(dc);
        pc.ondatachannel = (event) => setupDataChannel(event.channel);

        // 7. Handle remote tracks
        pc.ontrack = ({ track, streams }) => {
          console.log("Received remote track:", track.kind);
          if (streams[0]) {
            setRemoteStream(streams[0]);
          }
        };

        // 8. IMPROVED: ICE candidate handling
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            iceCandidatesRef.current.local.push(candidate);
            sendSignal({ type: "candidate", candidate });
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE Connection State:", pc.iceConnectionState);
        };

        pc.onicegatheringstatechange = () => {
          console.log("ICE Gathering State:", pc.iceGatheringState);
        };

        // 9. IMPROVED: Perfect negotiation with retry
        pc.onnegotiationneeded = async () => {
          if (makingOffer || pc.signalingState !== "stable") {
            console.log("Negotiation deferred");
            return;
          }

          try {
            makingOffer = true;
            await pc.setLocalDescription();
            sendSignal({
              type: "description",
              description: pc.localDescription,
            });
          } catch (err) {
            console.error("Negotiation error", err);
          } finally {
            makingOffer = false;
          }
        };

        // 10. Connection state monitoring
        pc.onconnectionstatechange = () => {
          console.log("Connection State:", pc.connectionState);
          switch (pc.connectionState) {
            case "connecting":
              setConnectionStatus("connecting");
              break;
            case "connected":
              setConnectionStatus("connected");
              if (iceRestartTimeoutRef.current) {
                clearTimeout(iceRestartTimeoutRef.current);
                iceRestartTimeoutRef.current = null;
              }
              break;
            case "disconnected":
              setConnectionStatus("reconnecting");
              // Auto-reconnect after 5 seconds
              iceRestartTimeoutRef.current = setTimeout(() => {
                if (pc?.connectionState === "disconnected") {
                  console.log("Auto ICE restart");
                  pc.restartIce();
                }
              }, 5000);
              break;
            case "failed":
              setConnectionStatus("failed");
              pc.restartIce();
              break;
            case "closed":
              setConnectionStatus("failed");
              break;
          }
        };

        // 11. Start stats polling
        startStatsPolling(pc);

        // 12. IMPROVED: Signal handling with proper queuing
        const candidateQueue: RTCIceCandidateInit[] = [];
        let isSettingRemoteDescription = false;

        const handleSignal = async (e: CustomEvent) => {
          const data = e.detail;
          if (data.sender === currentUser.id) return;

          const pc = peerConnection.current;
          if (!pc || pc.signalingState === "closed") return;

          try {
            const { description, candidate } = data.payload;

            if (description) {
              const offerCollision =
                description.type === "offer" &&
                (makingOffer || pc.signalingState !== "stable");

              ignoreOffer = !polite && offerCollision;
              if (ignoreOffer) {
                console.log("Offer collision - ignoring");
                return;
              }

              isSettingRemoteDescription = true;
              if (offerCollision) {
                await pc.setLocalDescription({ type: "rollback" });
              }

              await pc.setRemoteDescription(description);
              isSettingRemoteDescription = false;

              // Process queued candidates
              while (candidateQueue.length) {
                const buffered = candidateQueue.shift();
                if (buffered) {
                  try {
                    await pc.addIceCandidate(buffered);
                  } catch (e) {
                    console.warn("Buffered candidate failed", e);
                  }
                }
              }

              if (description.type === "offer") {
                await pc.setLocalDescription();
                sendSignal({
                  type: "description",
                  description: pc.localDescription,
                });
              }
            } else if (candidate) {
              if (pc.remoteDescription && !isSettingRemoteDescription) {
                try {
                  await pc.addIceCandidate(candidate);
                  iceCandidatesRef.current.remote.push(candidate);
                } catch (e) {
                  console.warn("ICE candidate failed", e);
                }
              } else {
                candidateQueue.push(candidate);
              }
            }
          } catch (err) {
            console.error("Signal handling error", err);
            isSettingRemoteDescription = false;
          }
        };

        window.addEventListener("webrtc-signal", handleSignal as EventListener);
        (window as any)._tempSignalHandler = handleSignal;
      } catch (err) {
        console.error("Setup error", err);
        setPermissionError(
          "Camera/Mic permissions required. Please allow access and refresh the page."
        );
      }
    };

    const startSession = () => {
      setupMediaAndConnection().then(() => {
        sendSignal({ type: "user_joined" });
      });
    };

    // Wait for signal readiness
    if ((window as any).SKILLSWAP_SIGNAL_READY) {
      startSession();
    } else {
      const readyHandler = () => {
        startSession();
        window.removeEventListener("skillswap-signal-ready", readyHandler);
      };
      window.addEventListener("skillswap-signal-ready", readyHandler);

      const timeoutId = setTimeout(() => {
        if (!peerConnection.current) {
          console.warn("Signal timeout - forcing start");
          startSession();
        }
      }, 5000);

      return () => {
        window.removeEventListener("skillswap-signal-ready", readyHandler);
        clearTimeout(timeoutId);
        performCleanup();
      };
    }

    return () => performCleanup();

    function performCleanup() {
      isCleanedUpRef.current = true;

      if ((window as any)._tempSignalHandler) {
        window.removeEventListener(
          "webrtc-signal",
          (window as any)._tempSignalHandler
        );
        delete (window as any)._tempSignalHandler;
      }

      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }

      if (iceRestartTimeoutRef.current) {
        clearTimeout(iceRestartTimeoutRef.current);
        iceRestartTimeoutRef.current = null;
      }

      if (dataChannel.current) {
        dataChannel.current.close();
        dataChannel.current = null;
      }

      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      allStreamsRef.current.forEach((stream) => {
        stream?.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
      });
      allStreamsRef.current = [];
    }
  }, []);

  // Audio/Video controls
  const toggleAudio = () => {
    if (audioTrackRef.current) {
      audioTrackRef.current.enabled = !audioTrackRef.current.enabled;
      setIsMicOn(audioTrackRef.current.enabled);
      sendDataChannelMessage({
        type: "mute_status",
        track: "audio",
        enabled: audioTrackRef.current.enabled,
      });
    }
  };

  const toggleVideo = () => {
    if (videoTrackRef.current) {
      videoTrackRef.current.enabled = !videoTrackRef.current.enabled;
      setIsCameraOn(videoTrackRef.current.enabled);
      sendDataChannelMessage({
        type: "mute_status",
        track: "video",
        enabled: videoTrackRef.current.enabled,
      });
    }
  };

  const toggleScreenShare = async () => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (isScreenSharing) {
      try {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");

        if (videoSender?.track) {
          videoSender.track.stop();
        }

        let camTrack = videoTrackRef.current;
        if (!camTrack || camTrack.readyState === "ended") {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: false,
          });
          camTrack = newStream.getVideoTracks()[0];
          allStreamsRef.current.push(newStream);
        }

        if (videoSender) {
          await videoSender.replaceTrack(camTrack);
        }

        setLocalStream(cameraStreamRef.current);
        setIsScreenSharing(false);
        setViewMode("whiteboard");
        sendSignal({ type: "mode_change", mode: "whiteboard" });
      } catch (e) {
        console.error("Error stopping screen share", e);
      }
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 15 },
          audio: false,
        });

        const screenTrack = displayStream.getVideoTracks()[0];
        allStreamsRef.current.push(displayStream);

        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");

        if (videoSender) {
          await videoSender.replaceTrack(screenTrack);
        }

        setLocalStream(displayStream);
        setIsScreenSharing(true);
        setViewMode("screen_share");
        sendSignal({ type: "mode_change", mode: "screen_share" });

        screenTrack.onended = () => {
          setIsScreenSharing(false);
          setViewMode("whiteboard");
        };
      } catch (err) {
        console.error("Error starting screen share", err);
      }
    }
  };

  const handleReconnect = () => {
    const pc = peerConnection.current;
    if (!pc) return;
    console.log("User requested reconnect");
    setConnectionStatus("reconnecting");
    pc.restartIce();
  };

  const handleEndSession = () => {
    allStreamsRef.current.forEach((stream) => {
      stream?.getTracks().forEach((t) => t.stop());
    });
    allStreamsRef.current = [];

    if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);
    if (dataChannel.current) dataChannel.current.close();
    if (peerConnection.current) peerConnection.current.close();

    setLocalStream(null);
    setRemoteStream(null);
    onEndSession();
  };

  const NetworkQualityBars = ({ quality }: { quality: 0 | 1 | 2 | 3 }) => {
    const colors = ["", "text-red-400", "text-yellow-400", "text-green-400"];
    return (
      <div className="flex items-end gap-0.5 h-4" title={`Network: ${["Unknown", "Poor", "Fair", "Good"][quality]}`}>
        <div className={`w-1 h-1.5 rounded-sm ${quality >= 1 ? colors[quality].replace("text-", "bg-") : "bg-slate-600"}`}></div>
        <div className={`w-1 h-2.5 rounded-sm ${quality >= 2 ? colors[quality].replace("text-", "bg-") : "bg-slate-600"}`}></div>
        <div className={`w-1 h-3.5 rounded-sm ${quality >= 3 ? colors[quality].replace("text-", "bg-") : "bg-slate-600"}`}></div>
      </div>
    );
  };

  const ConnectionOverlay = ({ status }: { status: string }) => {
    if (status === "connected") return null;
    return (
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30 rounded-lg">
        <div className="text-center">
          {status === "connecting" && (
            <>
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sky-300 text-sm font-medium">Connecting...</p>
            </>
          )}
          {status === "reconnecting" && (
            <>
              <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-amber-300 text-sm font-medium">Reconnecting...</p>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-8 h-8 text-red-400 mx-auto mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-red-300 text-sm font-medium">Connection Failed</p>
              <button onClick={handleReconnect} className="mt-2 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md">
                Retry
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (permissionError) {
    return (
      <div className="w-full h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Permissions Required</h2>
        <p className="text-slate-300 max-w-md mb-8">{permissionError}</p>
        <button onClick={handleEndSession} className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-background text-text-primary flex flex-col transition-colors duration-300">
      <header className="p-4 flex justify-between items-center bg-background/50 border-b border-slate-200/10 dark:border-slate-800/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <PlayCircleIcon className="w-8 h-8 text-sky-500" />
          <h1 className="text-xl font-black uppercase tracking-wider">
            Live Session: <span className="text-sky-500">{session.skill.name}</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-text-secondary font-mono text-sm font-semibold">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-sky-500" />
            <span>Time: {formatTime(elapsedTime)}</span>
          </div>
          <div className="flex items-center gap-2">
            <TokenIcon className="w-5 h-5 text-amber-500" />
            <span>Cost: 1 Token/Session</span>
          </div>
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-3 text-xs">
              <NetworkQualityBars quality={networkQuality} />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex p-4 gap-4 overflow-hidden bg-background">
        <div className="flex-1 flex flex-col rounded-[32px] overflow-hidden relative bg-slate-50 dark:bg-slate-950 border border-slate-200/10 dark:border-slate-800/10 shadow-[inset_3px_3px_6px_rgba(163,177,198,0.35),_inset_-3px_-3px_6px_rgba(255,255,255,0.85)] dark:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.55),_inset_-3px_-3px_6px_rgba(255,255,255,0.02)]">
          {viewMode === "whiteboard" ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center text-center text-text-muted/10 p-8 z-0 pointer-events-none">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-widest">Collaborative Whiteboard</h2>
                  <p className="mt-4 text-xl font-medium">Use the tools to draw, write, and collaborate in real-time.</p>
                </div>
              </div>
              <Whiteboard sessionId={session.id} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black rounded-[32px]">
              <VideoPlayer
                stream={isScreenSharing ? localStream : remoteStream}
                muted={true}
                label={isScreenSharing ? "You (Presenting)" : `${otherUser.name} (Screen)`}
                isLocal={isScreenSharing}
                isMicOn={true}
                objectFit="contain"
              />
            </div>
          )}
        </div>

        <aside className="w-[320px] flex-shrink-0 flex flex-col gap-4">
          <div className="flex-1 space-y-4 flex flex-col">
            {viewMode === "whiteboard" ? (
              <>
                <div className="relative">
                  <VideoPlayer
                    stream={remoteStream}
                    muted={false}
                    label={otherUser.name}
                    isLocal={false}
                    isMicOn={remoteMicOn}
                    isFocused={true}
                  />
                  <ConnectionOverlay status={connectionStatus} />
                </div>
                <VideoPlayer
                  stream={localStream}
                  muted={true}
                  label={isScreenSharing ? "Your Screen" : "You"}
                  isLocal={true}
                  isMicOn={isMicOn}
                  mirror={!isScreenSharing}
                />
              </>
            ) : (
              <>
                <VideoPlayer
                  stream={localStream}
                  muted={true}
                  label={isScreenSharing ? "Your Screen" : "You"}
                  isLocal={true}
                  isMicOn={isMicOn}
                  mirror={!isScreenSharing}
                />
                {isScreenSharing && (
                  <div className="relative">
                    <VideoPlayer
                      stream={remoteStream}
                      muted={false}
                      label={otherUser.name}
                      isLocal={false}
                      isMicOn={remoteMicOn}
                      isFocused={true}
                    />
                    <ConnectionOverlay status={connectionStatus} />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleAudio}
                className={`p-4 rounded-2xl transition-all border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] ${
                  isMicOn
                    ? "bg-background text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] border-rose-600"
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? (
                  <MicrophoneIcon className="w-6 h-6 text-text-primary" />
                ) : (
                  <MicrophoneSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-2xl transition-all border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] ${
                  isCameraOn
                    ? "bg-background text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                    : "bg-rose-500 text-white hover:bg-rose-600 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] border-rose-600"
                }`}
                title={isCameraOn ? "Stop Camera" : "Start Camera"}
              >
                {isCameraOn ? (
                  <VideoCameraIcon className="w-6 h-6 text-text-primary" />
                ) : (
                  <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-2xl transition-all border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] ${
                  isScreenSharing
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] border-emerald-600"
                    : "bg-background text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                <ArrowUpTrayIcon className={`w-6 h-6 ${isScreenSharing ? "text-white" : "text-text-primary"}`} />
              </button>
              <button
                onClick={handleReconnect}
                className="p-4 rounded-2xl bg-background text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)]"
                title="Reconnect Video"
              >
                <ArrowPathIcon className="w-6 h-6 text-text-primary" />
              </button>
              <button
                onClick={() => setEffectsActive(!effectsActive)}
                className={`p-4 rounded-2xl transition-all border border-slate-200/10 dark:border-slate-800/10 shadow-[4px_4px_10px_rgba(163,177,198,0.25),_-4px_-4px_10px_rgba(255,255,255,0.85)] dark:shadow-[4px_4px_10px_rgba(0,0,0,0.4)] ${
                  effectsActive
                    ? "bg-purple-600 text-white hover:bg-purple-700 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] border-purple-600"
                    : "bg-background text-text-primary hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
                title="Toggle Effects"
              >
                <SparklesIcon className={`w-6 h-6 ${effectsActive ? "text-white" : "text-text-primary"}`} />
              </button>
            </div>
            <button
              onClick={handleEndSession}
              className="w-full px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider rounded-2xl transition-all shadow-[inset_1px_1px_3px_rgba(0,0,0,0.2)] border border-rose-600 hover:shadow-lg"
            >
              End Session
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LiveSessionPage;
