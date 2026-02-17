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

// --- Signal deduplication ---
const processedSignalIds = new Set<string>();
const MAX_SIGNAL_CACHE = 500;
function isSignalDuplicate(signalId: string): boolean {
  if (!signalId) return false;
  if (processedSignalIds.has(signalId)) return true;
  processedSignalIds.add(signalId);
  // Prevent unbounded growth
  if (processedSignalIds.size > MAX_SIGNAL_CACHE) {
    const iterator = processedSignalIds.values();
    for (let i = 0; i < 100; i++) iterator.next();
    // Clear oldest entries (Set preserves insertion order)
    const toKeep = Array.from(processedSignalIds).slice(-400);
    processedSignalIds.clear();
    toKeep.forEach((id) => processedSignalIds.add(id));
  }
  return false;
}

let signalCounter = 0;
function nextSignalId(): string {
  return `${Date.now()}-${++signalCounter}`;
}

// --- Network quality calculation from stats ---
function calcNetworkQuality(rtt: number, packetLoss: number): 0 | 1 | 2 | 3 {
  if (rtt === 0 && packetLoss === 0) return 0; // unknown
  if (rtt > 500 || packetLoss > 10) return 1; // poor
  if (rtt > 200 || packetLoss > 3) return 2; // fair
  return 3; // good
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
    "whiteboard",
  );

  // New production-grade state
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting" | "failed"
  >("connecting");
  const [networkQuality, setNetworkQuality] = useState<0 | 1 | 2 | 3>(0);
  const [remoteMicOn, setRemoteMicOn] = useState(true);
  const [remoteCameraOn, setRemoteCameraOn] = useState(true);
  const [stats, setStats] = useState<{
    bitrate: number;
    packetLoss: number;
    rtt: number;
    jitter: number;
  }>({ bitrate: 0, packetLoss: 0, rtt: 0, jitter: 0 });

  // Refs
  const allStreamsRef = useRef<MediaStream[]>([]);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  const statsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevBytesRef = useRef<{ bytes: number; timestamp: number }>({
    bytes: 0,
    timestamp: 0,
  });
  const iceRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isCleanedUpRef = useRef(false);

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

  // --- Send signal helper (adds dedup ID) ---
  const sendSignal = useCallback(
    (payload: any) => {
      const signal = {
        type: "signal",
        target: otherUser.id,
        sender: currentUser.id,
        signalId: nextSignalId(),
        payload,
      };
      window.dispatchEvent(
        new CustomEvent("send-webrtc-signal", { detail: signal }),
      );
    },
    [otherUser.id, currentUser.id],
  );

  // --- Send DataChannel message ---
  const sendDataChannelMessage = useCallback((msg: Record<string, any>) => {
    if (dataChannel.current && dataChannel.current.readyState === "open") {
      dataChannel.current.send(JSON.stringify(msg));
    }
  }, []);

  // --- Timer Logic ---
  useEffect(() => {
    const fetchStartTime = async () => {
      try {
        const res = await api.put(`/sessions/${session.id}/start`);
        if (res.startedAt) {
          const timeString = res.startedAt.endsWith("Z")
            ? res.startedAt
            : res.startedAt + "Z";
          startTimeRef.current = new Date(timeString).getTime();
          const now = Date.now();
          setElapsedTime(
            Math.max(0, Math.floor((now - startTimeRef.current) / 1000)),
          );
        }
      } catch (error) {
        console.error("Error syncing start time", error);
      }
    };
    fetchStartTime();

    const interval = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        setElapsedTime(
          Math.max(0, Math.floor((now - startTimeRef.current) / 1000)),
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session.id]);

  // --- Stats polling for bandwidth monitoring & auto-adjust ---
  const startStatsPolling = useCallback(
    (pc: RTCPeerConnection) => {
      if (statsIntervalRef.current) clearInterval(statsIntervalRef.current);

      statsIntervalRef.current = setInterval(async () => {
        if (!pc || pc.connectionState === "closed") return;

        try {
          const report = await pc.getStats();
          let currentRtt = 0;
          let currentPacketLoss = 0;
          let currentJitter = 0;
          let totalBytesSent = 0;

          report.forEach((stat: any) => {
            if (stat.type === "candidate-pair" && stat.state === "succeeded") {
              currentRtt = stat.currentRoundTripTime
                ? stat.currentRoundTripTime * 1000
                : 0;
            }
            if (stat.type === "outbound-rtp" && stat.kind === "video") {
              totalBytesSent = stat.bytesSent || 0;
              if (stat.packetsLost !== undefined && stat.packetsSent) {
                currentPacketLoss = (stat.packetsLost / stat.packetsSent) * 100;
              }
            }
            if (stat.type === "inbound-rtp" && stat.kind === "video") {
              currentJitter = stat.jitter ? stat.jitter * 1000 : 0;
              if (stat.packetsLost !== undefined && stat.packetsReceived) {
                const total = stat.packetsReceived + stat.packetsLost;
                if (total > 0)
                  currentPacketLoss = Math.max(
                    currentPacketLoss,
                    (stat.packetsLost / total) * 100,
                  );
              }
            }
          });

          // Calculate bitrate
          const now = Date.now();
          let currentBitrate = 0;
          if (prevBytesRef.current.timestamp > 0) {
            const timeDiff = (now - prevBytesRef.current.timestamp) / 1000;
            if (timeDiff > 0) {
              currentBitrate = Math.round(
                ((totalBytesSent - prevBytesRef.current.bytes) * 8) /
                  timeDiff /
                  1000,
              ); // kbps
            }
          }
          prevBytesRef.current = { bytes: totalBytesSent, timestamp: now };

          setStats({
            bitrate: Math.max(0, currentBitrate),
            packetLoss: Math.round(currentPacketLoss * 10) / 10,
            rtt: Math.round(currentRtt),
            jitter: Math.round(currentJitter * 10) / 10,
          });

          const quality = calcNetworkQuality(currentRtt, currentPacketLoss);
          setNetworkQuality(quality);

          // Auto-adjust resolution based on quality — aggressive 3-tier
          if (!isScreenSharing) {
            const senders = pc.getSenders();
            const videoSender = senders.find((s) => s.track?.kind === "video");
            if (videoSender) {
              const params = videoSender.getParameters();
              if (params.encodings?.[0]) {
                if (quality === 1) {
                  // POOR: extreme downscale, near-audio-only
                  params.encodings[0].scaleResolutionDownBy = 4.0;
                  params.encodings[0].maxBitrate = 50000; // 50kbps
                  params.encodings[0].maxFramerate = 8;
                } else if (quality === 2) {
                  // FAIR: moderate downscale
                  params.encodings[0].scaleResolutionDownBy = 2.0;
                  params.encodings[0].maxBitrate = 120000; // 120kbps
                  params.encodings[0].maxFramerate = 15;
                } else if (quality === 3) {
                  // GOOD: full quality
                  params.encodings[0].scaleResolutionDownBy = 1.0;
                  params.encodings[0].maxBitrate = 300000;
                  delete (params.encodings[0] as any).maxFramerate;
                }
                videoSender.setParameters(params).catch(() => {});
              }
            }
          }
        } catch (e) {
          // Stats collection failed — non-critical
        }
      }, 3000);
    },
    [isScreenSharing],
  );

  // --- DataChannel message handler ---
  const handleDataChannelMessage = useCallback((event: MessageEvent) => {
    try {
      const msg = JSON.parse(event.data);
      switch (msg.type) {
        case "mute_status":
          if (msg.track === "audio") setRemoteMicOn(msg.enabled);
          if (msg.track === "video") setRemoteCameraOn(msg.enabled);
          break;
        case "reaction":
          // Future: handle reactions
          console.log("Received reaction:", msg.emoji);
          break;
        default:
          break;
      }
    } catch (e) {
      console.error("DataChannel parse error", e);
    }
  }, []);

  // --- Setup DataChannel ---
  const setupDataChannel = useCallback(
    (channel: RTCDataChannel) => {
      dataChannel.current = channel;
      channel.onmessage = handleDataChannelMessage;
      channel.onopen = () => {
        console.log("DataChannel opened");
        // Send current mute status to peer
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
      channel.onclose = () => {
        console.log("DataChannel closed");
      };
    },
    [handleDataChannelMessage, sendDataChannelMessage, isMicOn, isCameraOn],
  );

  // --- Media & WebRTC Logic ---
  useEffect(() => {
    let ignoreOffer = false;
    let makingOffer = false;
    const polite = currentUser.id !== session.proposerId;
    isCleanedUpRef.current = false;

    const setupMediaAndConnection = async () => {
      try {
        // 1. Detect connection type for adaptive constraints
        const nav = navigator as any;
        const conn =
          nav.connection || nav.mozConnection || nav.webkitConnection;
        const isSlow =
          conn &&
          (conn.effectiveType === "2g" ||
            conn.effectiveType === "3g" ||
            conn.downlink < 2);
        const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
        const useLowBandwidth = isSlow || isMobile;

        // Low-bandwidth: 320x240 @ 15fps | Normal: 480x360 @ 20fps
        const constraints: MediaStreamConstraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1, // Mono audio saves bandwidth
            sampleRate: 16000, // 16kHz is plenty for voice
          } as any,
          video: useLowBandwidth
            ? {
                width: { ideal: 320, max: 480 },
                height: { ideal: 240, max: 360 },
                frameRate: { ideal: 15, max: 20 },
              }
            : {
                width: { ideal: 480, max: 640 },
                height: { ideal: 360, max: 480 },
                frameRate: { ideal: 20, max: 24 },
              },
        };

        console.log("Requesting media with constraints:", constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCleanedUpRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        setLocalStream(stream);
        cameraStreamRef.current = stream;
        allStreamsRef.current.push(stream);
        setPermissionError(null);

        audioTrackRef.current = stream.getAudioTracks()[0] || null;
        videoTrackRef.current = stream.getVideoTracks()[0] || null;

        // 2. Fetch TURN credentials from backend
        let iceServers: RTCIceServer[] = [
          { urls: "stun:stun.l.google.com:19302" },
        ];
        try {
          const turnRes = await api.get("/turn/credentials");
          if (turnRes?.iceServers?.length > 0) {
            iceServers = turnRes.iceServers;
            console.log("Using TURN servers:", iceServers.length, "servers");
          }
        } catch (e) {
          console.warn("Failed to fetch TURN credentials, using STUN only", e);
        }

        // 3. Init PeerConnection with TURN support + bandwidth policy
        const pc = new RTCPeerConnection({
          iceServers,
          iceCandidatePoolSize: 2, // Smaller pool = faster initial connection
          bundlePolicy: "max-bundle", // Multiplex audio+video on one transport (less overhead)
          rtcpMuxPolicy: "require", // Reduce port usage
        });
        peerConnection.current = pc;

        // 4. Create DataChannel (offerer creates, answerer receives via ondatachannel)
        const dc = pc.createDataChannel("control", { ordered: true });
        setupDataChannel(dc);

        // Handle DataChannel from remote peer
        pc.ondatachannel = (event) => {
          console.log("Received DataChannel from remote peer");
          setupDataChannel(event.channel);
        };

        // 5. Add Tracks — prioritize audio, cap video bandwidth
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        // Add audio FIRST so it gets priority in bandwidth allocation
        if (audioTrack) {
          const audioSender = pc.addTrack(audioTrack, stream);
          // Cap audio bitrate to 24kbps Opus mono (clear voice, minimal data)
          try {
            const audioParams = audioSender.getParameters();
            if (!audioParams.encodings || audioParams.encodings.length === 0) {
              audioParams.encodings = [{}];
            }
            audioParams.encodings[0].maxBitrate = 24000; // 24kbps Opus
            (audioParams.encodings[0] as any).networkPriority = "high"; // Prioritize audio
            (audioParams.encodings[0] as any).priority = "high";
            await audioSender.setParameters(audioParams);
          } catch (e) {
            console.warn("Audio encoding setup fallback", e);
          }
        }

        if (videoTrack) {
          // On slow connections: single layer, low bitrate
          // On good connections: simulcast 2 layers (not 3 — saves CPU)
          const videoBitrate = useLowBandwidth ? 150000 : 300000; // 150kbps or 300kbps

          if (useLowBandwidth) {
            // Single encoding — no simulcast overhead on mobile
            const videoSender = pc.addTrack(videoTrack, stream);
            try {
              const params = videoSender.getParameters();
              if (!params.encodings || params.encodings.length === 0) {
                params.encodings = [{}];
              }
              params.encodings[0].maxBitrate = videoBitrate;
              params.encodings[0].maxFramerate = 15;
              (params.encodings[0] as any).networkPriority = "low"; // Audio takes priority
              (params.encodings[0] as any).priority = "low";
              await videoSender.setParameters(params);
            } catch (e) {
              console.warn("Video encoding setup fallback", e);
            }
          } else {
            // Simulcast with 2 layers for desktop/good connections
            const transceiver = pc.addTransceiver(videoTrack, {
              direction: "sendrecv",
              streams: [stream],
              sendEncodings: [
                { rid: "high", maxBitrate: 300000, scaleResolutionDownBy: 1.0 },
                { rid: "low", maxBitrate: 80000, scaleResolutionDownBy: 2.0 },
              ],
            });
            try {
              const sender = transceiver.sender;
              const params = sender.getParameters();
              if (!params.encodings || params.encodings.length === 0) {
                params.encodings = [{}];
              }
              if (params.encodings.length === 1) {
                params.encodings[0].maxBitrate = 300000;
              }
              await sender.setParameters(params);
              console.log(
                "Video encoding configured:",
                params.encodings.length,
                "layers",
              );
            } catch (e) {
              console.warn("Simulcast setup failed, using default encoding", e);
            }
          }

          console.log(
            `Mode: ${useLowBandwidth ? "LOW-BANDWIDTH" : "NORMAL"}, videoBitrate: ${videoBitrate / 1000}kbps`,
          );
        }

        // 6. Handle Remote Tracks
        pc.ontrack = ({ track, streams }) => {
          console.log("Received remote track", track.kind, streams[0]?.id);
          if (streams[0]) {
            setRemoteStream(streams[0]);

            track.onunmute = () => {
              console.log(`Remote track ${track.kind} unmuted`);
              setRemoteStream((prev) => (prev ? prev : streams[0]));
            };

            // Listen for track ending (remote peer stops camera/screen)
            track.onended = () => {
              console.log(`Remote track ${track.kind} ended`);
            };
          }
        };

        // 7. Handle ICE Candidates
        pc.onicecandidate = ({ candidate }) => {
          if (candidate) {
            sendSignal({ type: "candidate", candidate });
          }
        };

        // 8. Perfect Negotiation Implementation
        pc.onnegotiationneeded = async () => {
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

        // 9. Connection State Monitoring (modern API)
        pc.onconnectionstatechange = () => {
          console.log("Connection State:", pc.connectionState);
          switch (pc.connectionState) {
            case "connecting":
              setConnectionStatus("connecting");
              break;
            case "connected":
              setConnectionStatus("connected");
              // Clear any pending ICE restart timeout
              if (iceRestartTimeoutRef.current) {
                clearTimeout(iceRestartTimeoutRef.current);
                iceRestartTimeoutRef.current = null;
              }
              break;
            case "disconnected":
              setConnectionStatus("reconnecting");
              // Auto ICE restart after 3 seconds of disconnected
              iceRestartTimeoutRef.current = setTimeout(() => {
                if (pc.connectionState === "disconnected") {
                  console.log("Auto ICE restart triggered");
                  pc.restartIce();
                }
              }, 3000);
              break;
            case "failed":
              setConnectionStatus("failed");
              setRemoteStream(null);
              // Attempt one ICE restart on failure
              console.log("Connection failed — attempting ICE restart");
              pc.restartIce();
              break;
            case "closed":
              setConnectionStatus("failed");
              setRemoteStream(null);
              break;
          }
        };

        // Also keep ICE state monitoring for candidate gathering insights
        pc.oniceconnectionstatechange = () => {
          console.log("ICE State:", pc.iceConnectionState);
        };

        pc.onicegatheringstatechange = () => {
          console.log("ICE Gathering State:", pc.iceGatheringState);
        };

        // 10. Start stats polling
        startStatsPolling(pc);

        // Queue for ICE candidates arriving before remote description
        const candidateQueue: RTCIceCandidateInit[] = [];
        let isSettingRemoteDescription = false;

        // 11. Signal Handling
        const handleSignal = async (e: CustomEvent) => {
          const data = e.detail;
          if (data.sender === currentUser.id) return;

          // Deduplicate signals
          if (data.signalId && isSignalDuplicate(data.signalId)) {
            return;
          }

          // Handle Mode Change
          if (data.payload?.type === "mode_change") {
            console.log("Remote peer changed mode:", data.payload.mode);
            setViewMode(data.payload.mode);
            return;
          }

          // Handle User Joined
          if (data.payload?.type === "user_joined") {
            console.log("Remote user joined - triggering ICE restart");
            const pc = peerConnection.current;
            if (pc) {
              pc.restartIce();
            }
            return;
          }

          const pc = peerConnection.current;
          if (!pc || pc.signalingState === "closed") return;

          const { description, candidate } = data.payload;

          try {
            if (description) {
              const offerCollision =
                description.type === "offer" &&
                (makingOffer || pc.signalingState !== "stable");

              ignoreOffer = !polite && offerCollision;
              if (ignoreOffer) {
                console.log("Ignoring colliding offer (impolite)");
                return;
              }

              isSettingRemoteDescription = true;
              if (offerCollision) {
                await pc.setLocalDescription({ type: "rollback" });
              }

              await pc.setRemoteDescription(description);
              isSettingRemoteDescription = false;

              // Flush queued candidates
              while (candidateQueue.length) {
                const buffered = candidateQueue.shift();
                if (buffered) await pc.addIceCandidate(buffered);
              }

              if (description.type === "offer") {
                await pc.setLocalDescription();
                sendSignal({
                  type: "description",
                  description: pc.localDescription,
                });
              }
            } else if (candidate) {
              try {
                if (pc.remoteDescription && !isSettingRemoteDescription) {
                  await pc.addIceCandidate(candidate);
                } else {
                  candidateQueue.push(candidate);
                }
              } catch (err) {
                if (!ignoreOffer) console.warn("ICE candidate error:", err);
              }
            }
          } catch (err) {
            console.error("Signal Handling Error", err);
            isSettingRemoteDescription = false;
          }
        };

        window.addEventListener("webrtc-signal", handleSignal as EventListener);
        (window as any)._tempSignalHandler = handleSignal;
      } catch (err) {
        console.error("Access denied or API error", err);
        setPermissionError(
          "Camera/Mic permissions required. Please allow access and refresh the page.",
        );
      }
    };

    const startSession = () => {
      setupMediaAndConnection().then(() => {
        sendSignal({ type: "user_joined" });
      });
    };

    if ((window as any).SKILLSWAP_SIGNAL_READY) {
      startSession();
    } else {
      const readyHandler = () => {
        startSession();
        window.removeEventListener("skillswap-signal-ready", readyHandler);
      };
      window.addEventListener("skillswap-signal-ready", readyHandler);

      // Timeout fallback
      const timeoutId = setTimeout(() => {
        if (!peerConnection.current) {
          console.warn("Signal timeout - forcing start");
          startSession();
        }
      }, 3000);

      // Cleanup for the waiting path — this also covers the main cleanup below
      // because we return early HERE, we must include full cleanup
      return () => {
        window.removeEventListener("skillswap-signal-ready", readyHandler);
        clearTimeout(timeoutId);
        performCleanup();
      };
    }

    // Cleanup function — ALWAYS runs when unmounting
    return () => {
      performCleanup();
    };

    function performCleanup() {
      isCleanedUpRef.current = true;

      // Remove signal handler
      if ((window as any)._tempSignalHandler) {
        window.removeEventListener(
          "webrtc-signal",
          (window as any)._tempSignalHandler,
        );
        delete (window as any)._tempSignalHandler;
      }

      // Stop stats polling
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
        statsIntervalRef.current = null;
      }

      // Clear ICE restart timeout
      if (iceRestartTimeoutRef.current) {
        clearTimeout(iceRestartTimeoutRef.current);
        iceRestartTimeoutRef.current = null;
      }

      // Close data channel
      if (dataChannel.current) {
        dataChannel.current.close();
        dataChannel.current = null;
      }

      // Close peer connection
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }

      // Stop ALL tracked streams (camera, screen share, re-acquired streams)
      allStreamsRef.current.forEach((stream) => {
        stream?.getTracks().forEach((t) => {
          t.stop();
          t.enabled = false;
        });
      });
      allStreamsRef.current = [];

      // Also stop specific refs as safety net
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach((t) => t.stop());
        cameraStreamRef.current = null;
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEndSession = () => {
    console.log("Ending session and cleaning up");

    // Stop all tracked streams
    allStreamsRef.current.forEach((stream) => {
      stream?.getTracks().forEach((t) => {
        t.stop();
        t.enabled = false;
      });
    });
    allStreamsRef.current = [];

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }

    // Stop stats polling
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    // Close data channel
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

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
      // Notify peer via DataChannel
      sendDataChannelMessage({
        type: "mute_status",
        track: "audio",
        enabled: audioTrack.enabled,
      });
    }
  };

  const toggleVideo = () => {
    const videoTrack = videoTrackRef.current;
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
      // Notify peer via DataChannel
      sendDataChannelMessage({
        type: "mute_status",
        track: "video",
        enabled: videoTrack.enabled,
      });
    }
  };

  const toggleScreenShare = async () => {
    const pc = peerConnection.current;
    if (!pc) return;

    if (isScreenSharing) {
      // --- STOP SCREEN SHARE ---
      try {
        const senders = pc.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");

        if (videoSender && videoSender.track) {
          videoSender.track.stop();
        }

        // Restore Camera Track
        let camTrack = videoTrackRef.current;
        let streamToRestore = cameraStreamRef.current;

        if (!camTrack || camTrack.readyState === "ended") {
          // Only re-acquire VIDEO, keep existing audio
          console.log("Camera track ended. Re-acquiring video only...");
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 320, max: 480 },
              height: { ideal: 240, max: 360 },
            },
            audio: false, // Keep existing audio track
          });
          camTrack = newStream.getVideoTracks()[0];

          // Create a new combined stream with existing audio + new video
          const combinedStream = new MediaStream();
          if (
            audioTrackRef.current &&
            audioTrackRef.current.readyState !== "ended"
          ) {
            combinedStream.addTrack(audioTrackRef.current);
          }
          combinedStream.addTrack(camTrack);

          cameraStreamRef.current = combinedStream;
          videoTrackRef.current = camTrack;
          streamToRestore = combinedStream;
          allStreamsRef.current.push(newStream);
          allStreamsRef.current.push(combinedStream);
        }

        camTrack.enabled = isCameraOn;

        if (videoSender) {
          await videoSender.replaceTrack(camTrack);
          // Restore camera bitrate (200kbps for mobile-friendly)
          const params = videoSender.getParameters();
          if (params.encodings?.[0]) {
            params.encodings[0].maxBitrate = 200000;
            params.encodings[0].maxFramerate = 20;
          }
          await videoSender.setParameters(params).catch(() => {});
        }

        setLocalStream(streamToRestore);
        setIsScreenSharing(false);
        setViewMode("whiteboard");

        sendSignal({ type: "mode_change", mode: "whiteboard" });
      } catch (e) {
        console.error("Error stopping screen share:", e);
      }
    } else {
      // --- START SCREEN SHARE ---
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
          // Screen share bitrate (800kbps — mobile-friendly for text readability)
          const params = videoSender.getParameters();
          if (params.encodings?.[0]) {
            params.encodings[0].maxBitrate = 800000;
            // Disable downscaling for screen share (text clarity)
            params.encodings[0].scaleResolutionDownBy = 1.0;
            params.encodings[0].maxFramerate = 10; // Low FPS fine for screen content
          }
          await videoSender.setParameters(params).catch(() => {});
        }

        setLocalStream(displayStream);
        setIsScreenSharing(true);
        setViewMode("screen_share");

        sendSignal({ type: "mode_change", mode: "screen_share" });

        // Handle "Stop sharing" from browser bar
        screenTrack.onended = () => {
          console.log("Screen share ended natively");
          const restore = async () => {
            const pc = peerConnection.current;
            const senders = pc ? pc.getSenders() : [];
            const videoSender = senders.find((s) => s.track?.kind === "video");

            let camTrack = videoTrackRef.current;
            let streamToRestore = cameraStreamRef.current;

            if (!camTrack || camTrack.readyState === "ended") {
              const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                  width: { ideal: 320, max: 480 },
                  height: { ideal: 240, max: 360 },
                },
                audio: false,
              });
              camTrack = newStream.getVideoTracks()[0];

              const combinedStream = new MediaStream();
              if (
                audioTrackRef.current &&
                audioTrackRef.current.readyState !== "ended"
              ) {
                combinedStream.addTrack(audioTrackRef.current);
              }
              combinedStream.addTrack(camTrack);

              cameraStreamRef.current = combinedStream;
              videoTrackRef.current = camTrack;
              streamToRestore = combinedStream;
              allStreamsRef.current.push(newStream);
              allStreamsRef.current.push(combinedStream);
            }

            if (videoSender) {
              await videoSender.replaceTrack(camTrack).catch(console.error);
              // Restore camera bitrate
              const params = videoSender.getParameters();
              if (params.encodings?.[0]) {
                params.encodings[0].maxBitrate = 200000;
                params.encodings[0].maxFramerate = 20;
              }
              await videoSender.setParameters(params).catch(() => {});
            }
            setLocalStream(streamToRestore);
            setIsScreenSharing(false);
            setViewMode("whiteboard");

            sendSignal({ type: "mode_change", mode: "whiteboard" });
          };
          restore();
        };
      } catch (err) {
        console.error("Error starting screen share:", err);
      }
    }
  };

  const toggleEffects = () => {
    setEffectsActive((prev) => !prev);
  };

  const handleReconnect = useCallback(() => {
    const pc = peerConnection.current;
    if (!pc) return;

    console.log("User requested reconnect — ICE restart");
    setConnectionStatus("reconnecting");
    pc.restartIce();

    // If no reconnection in 10 seconds, show failed status
    if (iceRestartTimeoutRef.current)
      clearTimeout(iceRestartTimeoutRef.current);
    iceRestartTimeoutRef.current = setTimeout(() => {
      if (peerConnection.current?.connectionState !== "connected") {
        console.warn("Reconnect attempt timed out");
        setConnectionStatus("failed");
      }
    }, 10000);
  }, []);

  // --- Network Quality Bars ---
  const NetworkQualityBars = ({ quality }: { quality: 0 | 1 | 2 | 3 }) => {
    const colors = ["", "text-red-400", "text-yellow-400", "text-green-400"];
    const c = colors[quality] || "text-slate-600";
    return (
      <div
        className="flex items-end gap-0.5 h-4"
        title={`Network: ${["Unknown", "Poor", "Fair", "Good"][quality]}`}
      >
        <div
          className={`w-1 h-1.5 rounded-sm ${quality >= 1 ? c.replace("text-", "bg-") : "bg-slate-600"}`}
        ></div>
        <div
          className={`w-1 h-2.5 rounded-sm ${quality >= 2 ? c.replace("text-", "bg-") : "bg-slate-600"}`}
        ></div>
        <div
          className={`w-1 h-3.5 rounded-sm ${quality >= 3 ? c.replace("text-", "bg-") : "bg-slate-600"}`}
        ></div>
      </div>
    );
  };

  // --- Connection Status Overlay ---
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
              <p className="text-amber-300 text-sm font-medium">
                Reconnecting...
              </p>
            </>
          )}
          {status === "failed" && (
            <>
              <div className="w-8 h-8 text-red-400 mx-auto mb-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-red-300 text-sm font-medium">
                Connection Failed
              </p>
              <button
                onClick={handleReconnect}
                className="mt-2 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-md"
              >
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
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Permissions Required
        </h2>
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
            Live Session:{" "}
            <span className="text-slate-300 font-medium">
              {session.skill.name}
            </span>
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
          {/* Stats display */}
          {connectionStatus === "connected" && (
            <div className="flex items-center gap-3 text-xs">
              <NetworkQualityBars quality={networkQuality} />
              <span className="text-slate-500">{stats.bitrate}kbps</span>
              {stats.rtt > 0 && (
                <span className="text-slate-500">{stats.rtt}ms</span>
              )}
              {stats.packetLoss > 0 && (
                <span className="text-red-400">{stats.packetLoss}% loss</span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex p-4 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col rounded-lg overflow-hidden relative bg-slate-900 border border-slate-800">
          {viewMode === "whiteboard" ? (
            <>
              <div className="absolute inset-0 flex items-center justify-center text-center text-slate-700/20 p-8 z-0 pointer-events-none">
                <div>
                  <h2 className="text-4xl font-bold">
                    Collaborative Whiteboard
                  </h2>
                  <p className="mt-4 text-xl">
                    Use the tools to draw, write, and collaborate in real-time.
                  </p>
                </div>
              </div>
              <Whiteboard sessionId={session.id} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black">
              <VideoPlayer
                stream={isScreenSharing ? localStream : remoteStream}
                muted={true}
                label={
                  isScreenSharing
                    ? "You (Presenting)"
                    : `${otherUser.name} (Screen)`
                }
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
                  {connectionStatus === "connected" && (
                    <div className="absolute top-2 right-2 z-20">
                      <NetworkQualityBars quality={networkQuality} />
                    </div>
                  )}
                </div>
                <VideoPlayer
                  stream={localStream}
                  muted={true}
                  label={isScreenSharing ? "Your Screen" : "You"}
                  isLocal={true}
                  isMicOn={isMicOn}
                  mirror={!isScreenSharing}
                  filter={
                    effectsActive
                      ? "brightness(1.2) contrast(1.1) saturate(1.4) sepia(0.2)"
                      : undefined
                  }
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
                  filter={
                    effectsActive
                      ? "brightness(1.2) contrast(1.1) saturate(1.4) sepia(0.2)"
                      : undefined
                  }
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
                className={`p-4 rounded-full transition-colors ${
                  isMicOn
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? (
                  <MicrophoneIcon className="w-6 h-6 text-white" />
                ) : (
                  <MicrophoneSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  isCameraOn
                    ? "bg-slate-700 hover:bg-slate-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                title={isCameraOn ? "Stop Camera" : "Start Camera"}
                disabled={isScreenSharing}
              >
                {isCameraOn ? (
                  <VideoCameraIcon className="w-6 h-6 text-white" />
                ) : (
                  <VideoCameraSlashIcon className="w-6 h-6 text-white" />
                )}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition-colors ${isScreenSharing ? "bg-green-600 hover:bg-green-700" : "bg-slate-700 hover:bg-slate-600"}`}
                title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
              >
                <ArrowUpTrayIcon className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={handleReconnect}
                className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors pointer-events-auto"
                title="Reconnect Video (Fix Glitches)"
              >
                <ArrowPathIcon className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={toggleEffects}
                className={`p-4 rounded-full transition-colors ${effectsActive ? "bg-purple-600 hover:bg-purple-700" : "bg-slate-700 hover:bg-slate-600"} relative`}
                title="Toggle Effects (Beauty Mode)"
              >
                <SparklesIcon className="w-6 h-6 text-white" />
                {effectsActive && (
                  <span className="absolute top-1 right-1 block w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
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
    </div>
  );
};

export default LiveSessionPage;
