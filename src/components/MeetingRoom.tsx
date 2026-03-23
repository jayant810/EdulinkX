// src/components/MeetingRoom.tsx
// Ported from WebMeet's Room.tsx — uses EdulinkX auth instead of NextAuth
import { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import {
  Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Users,
  Monitor, Shield, MessageSquare,
  Send, Hand, Pin, X, UserX, MicOff as MicOffIcon, VideoOff as VideoOffIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/auth/AuthProvider";

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || "https://web-meet.duckdns.org";

// ─── Types ───
interface ParticipantOverlayProps {
  number?: number;
  name: string;
  image?: string | null;
  isMe?: boolean;
  isAdmin?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isHandRaised?: boolean;
  isSharing?: boolean;
  isPinned?: boolean;
  isPresentation?: boolean;
}

interface UserState {
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isSharing: boolean;
  screenStreamId?: string;
  cameraStreamId?: string;
  image?: string | null;
}

interface ChatMessage {
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

// ─── Sub-components ───
const ParticipantOverlay = memo(
  ({ number, name, isMe, isMuted, isHandRaised, isPinned, isPresentation }: ParticipantOverlayProps) => (
    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between z-10">
      <div className="flex justify-end gap-2">
        {isPinned && (
          <div className="bg-blue-600/90 p-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg pointer-events-auto cursor-pointer">
            <Pin className="w-3.5 h-3.5 text-white fill-current" />
          </div>
        )}
        {isHandRaised && (
          <div className="bg-yellow-500 p-1.5 rounded-full backdrop-blur-md border border-white/10 shadow-lg animate-bounce">
            <Hand className="w-3.5 h-3.5 text-black fill-current" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 max-w-[90%]">
        <div className="bg-[#202124]/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2 text-white shadow-xl overflow-hidden shrink-0 text-xs">
          {number && <span className="font-bold text-blue-300 shrink-0">{number}.</span>}
          <span className="font-semibold truncate">
            {isPresentation ? `${name}'s Presentation` : isMe ? `${name} (You)` : name}
          </span>
          {isPresentation && (
            <span className="text-[9px] bg-blue-600 px-1.5 py-0.5 rounded-sm font-black tracking-widest uppercase text-white ml-1">
              Presentation
            </span>
          )}
          {isMuted && !isPresentation && <MicOff className="w-3.5 h-3.5 text-red-400 shrink-0 ml-1" />}
        </div>
      </div>
    </div>
  )
);
ParticipantOverlay.displayName = "ParticipantOverlay";

const VideoTile = memo(
  ({
    stream,
    isVideoOff,
    name,
    image,
    overlayProps,
    isLocal,
    isMuted,
  }: {
    stream: MediaStream | null;
    isVideoOff?: boolean;
    name: string;
    image?: string | null;
    overlayProps: ParticipantOverlayProps;
    isLocal?: boolean;
    isMuted?: boolean;
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Check if video tracks are actually active (handles remote black-screen issue)
    const hasActiveVideo = stream && stream.getVideoTracks().some((t) => t.enabled && !t.muted && t.readyState === "live");
    const shouldShowVideo = !isVideoOff && hasActiveVideo;

    useEffect(() => {
      if (videoRef.current && stream && shouldShowVideo) {
        if (videoRef.current.srcObject !== stream) videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    }, [stream, shouldShowVideo]);

    return (
      <div
        className={`relative bg-[#1a1b1e] rounded-2xl overflow-hidden shadow-2xl border-2 flex items-center justify-center group transition-all duration-500 w-full h-full ${
          overlayProps.isPinned ? "border-blue-500 ring-4 ring-blue-500/20" : "border-transparent hover:border-white/5"
        }`}
      >
        {shouldShowVideo && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || isMuted}
            className={`w-full h-full object-contain transition-transform duration-700 ${
              isLocal && !overlayProps.isPresentation ? "scale-x-[-1]" : ""
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-4xl shadow-2xl border-4 border-white/5 ${isLocal ? "bg-blue-600" : "bg-[#5f6368]"}`}>
              <span className="text-white font-black uppercase">{name.charAt(0)}</span>
            </div>
          </div>
        )}
        <ParticipantOverlay {...overlayProps} isMe={isLocal} name={name} image={image} isVideoOff={isVideoOff} />
      </div>
    );
  }
);
VideoTile.displayName = "VideoTile";

const OverflowTile = memo(({ count, onClick }: { count: number; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="relative bg-[#3c4043] rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center group cursor-pointer hover:bg-[#4a4e52] transition-all duration-300 w-full h-full border-2 border-transparent"
  >
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5f6368] flex items-center justify-center mb-3 shadow-lg border border-white/10 group-hover:bg-blue-600 group-hover:scale-110 transition-all">
      <span className="text-xl font-black text-white">+{count}</span>
    </div>
    <span className="text-xs text-neutral-300 font-bold tracking-tight uppercase text-center px-2 font-mono">
      View {count} more
    </span>
  </div>
));
OverflowTile.displayName = "OverflowTile";

// ─── Main Component ───
interface MeetingRoomProps {
  roomId: string;
  isAdmin?: boolean;
  onLeave: () => void;
}

export default function MeetingRoom({ roomId, isAdmin: isAdminProp = false, onLeave }: MeetingRoomProps) {
  const { user, token } = useAuth();
  const currentUserId = String(user?.id || "");
  const currentUserName = user?.name || user?.email || "User";

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localScreenStream, setLocalScreenStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [remoteUserNames, setRemoteUserNames] = useState<Record<string, { name: string; image?: string | null }>>({});
  const [remoteStates, setRemoteStates] = useState<Record<string, UserState>>({});

  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [pinnedUser, setPinnedUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(isAdminProp);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sidebarTab, setSidebarTab] = useState<"chat" | "participants" | null>(null);

  // Termination / kick states
  const [roomEnded, setRoomEnded] = useState(false);
  const [wasKicked, setWasKicked] = useState(false);
  const [isWaitingForHost, setIsWaitingForHost] = useState(!isAdminProp);

  const socketRef = useRef<Socket | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const localScreenStreamRef = useRef<MediaStream | null>(null);
  const initializedRef = useRef(false);
  const makingOfferRef = useRef<Record<string, boolean>>({});

  const sortedParticipants = useMemo(() => {
    const list: any[] = [];
    if (!currentUserId) return list;

    list.push({
      id: currentUserId,
      name: currentUserName,
      image: null,
      isMe: true,
      isAdmin,
      isMuted,
      isVideoOff,
      isHandRaised,
      isSharing: false,
      isPinned: pinnedUser === currentUserId,
      stream: localStream,
    });

    if (isScreenSharing && localScreenStream) {
      list.push({
        id: currentUserId + "-screen",
        name: currentUserName,
        isMe: true,
        isSharing: true,
        isPinned: pinnedUser === currentUserId + "-screen",
        isPresentation: true,
        stream: localScreenStream,
        isVideoOff: false,
      });
    }

    Object.entries(remoteUserNames).forEach(([id, data]) => {
      const state = remoteStates[id] || { isMuted: false, isVideoOff: false, isHandRaised: false, isSharing: false };
      const cameraStream = state.cameraStreamId ? remoteStreams[state.cameraStreamId] : null;
      list.push({
        id,
        name: data.name,
        image: data.image,
        isMe: false,
        isAdmin: false,
        ...state,
        isSharing: false,
        isPinned: pinnedUser === id,
        stream: cameraStream,
      });
      if (state.isSharing && state.screenStreamId) {
        const screenStream = remoteStreams[state.screenStreamId];
        if (screenStream) {
          list.push({
            id: id + "-screen",
            name: data.name,
            isMe: false,
            isAdmin: false,
            isSharing: true,
            isPinned: pinnedUser === id + "-screen",
            isPresentation: true,
            stream: screenStream,
            isVideoOff: false,
          });
        }
      }
    });

    return list.sort((a, b) => {
      if (a.isPresentation !== b.isPresentation) return a.isPresentation ? -1 : 1;
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
      return 0;
    });
  }, [currentUserId, currentUserName, isAdmin, isMuted, isVideoOff, isHandRaised, isScreenSharing, localStream, localScreenStream, remoteUserNames, remoteStates, remoteStreams, pinnedUser]);

  const activePresenter = useMemo(() => sortedParticipants.find((p) => p.isPresentation), [sortedParticipants]);
  const visibleParticipants = sortedParticipants.slice(0, sidebarTab ? (activePresenter ? 4 : 6) : 12);
  const overflowCount = sortedParticipants.length - visibleParticipants.length;

  // ─── Improved grid layout ───
  const getGridClass = (count: number) => {
    if (count === 1) return "grid-cols-1 max-w-4xl";
    if (count === 2) return "grid-cols-2 max-w-6xl";
    if (count <= 4) return "grid-cols-2 max-w-6xl";
    if (count <= 6) return "grid-cols-3";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  };

  const triggerNegotiation = async (userId: string) => {
    const pc = peersRef.current[userId];
    if (!pc || pc.signalingState !== "stable") return;
    try {
      makingOfferRef.current[userId] = true;
      await pc.setLocalDescription();
      socketRef.current?.emit("offer", { target: userId, sdp: pc.localDescription });
    } catch (err) {
      console.error(`[WebRTC] Negotiation error for ${userId}:`, err);
    } finally {
      makingOfferRef.current[userId] = false;
    }
  };

  const getMedia = async () => {
    if (localStreamRef.current) return localStreamRef.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: 1.7777 },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      // Default: mic and camera OFF
      stream.getAudioTracks().forEach((t) => (t.enabled = false));
      stream.getVideoTracks().forEach((t) => { t.enabled = false; t.stop(); }); // Force hardware light off initially
      Object.entries(peersRef.current).forEach(([, pc]) => {
        if (pc.signalingState !== "closed") stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      });
      return stream;
    } catch {
      console.error("Camera failed.");
      return null;
    }
  };

  const cleanupAndLeave = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
    socketRef.current?.disconnect();
    onLeave();
  }, [onLeave]);

  useEffect(() => {
    if (!currentUserId || initializedRef.current) return;
    initializedRef.current = true;

    const socket = io(SIGNALING_SERVER, {
      path: "/socket.io/",
      transports: ["websocket"],
      reconnection: true,
      withCredentials: true,
    });
    socketRef.current = socket;

    const createPeerConnection = (userId: string) => {
      if (peersRef.current[userId]) return peersRef.current[userId];
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peersRef.current[userId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current!));
      }
      if (localScreenStreamRef.current) {
        localScreenStreamRef.current.getTracks().forEach((track) => pc.addTrack(track, localScreenStreamRef.current!));
      }

      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice-candidate", { target: userId, candidate });
      };
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          const stream = event.streams[0];
          setRemoteStreams((prev) => ({ ...prev, [stream.id]: stream }));
          setRemoteStates((prev) => {
            const userState = prev[userId] || { isMuted: false, isVideoOff: false, isHandRaised: false, isSharing: false };
            if (stream.id !== userState.screenStreamId && !userState.cameraStreamId)
              return { ...prev, [userId]: { ...userState, cameraStreamId: stream.id } };
            return prev;
          });
        }
      };
      pc.onnegotiationneeded = () => triggerNegotiation(userId);
      return pc;
    };

    socket.on("connect", () => {
      setIsAdmin(isAdminProp);
      // All EdulinkX users are pre-authorized — skip waiting room
      socket.emit("join-room", roomId, currentUserId, currentUserName, isAdminProp, true, null);
    });

    socket.on("join-approved", async () => {
      setIsWaitingForHost(false);
      socket.emit("ready-to-connect", roomId, currentUserId, currentUserName, null);
      getMedia();
    });

    socket.on("waiting-for-admin", () => {
      setIsWaitingForHost(true);
    });

    socket.on("request-to-join", (u: any) =>
      // Still handle in case waiting room is re-enabled
      socket.emit("approve-user", roomId, u.userId)
    );

    socket.on("user-connected", (userId: string, userName: string, userImage: string | null) => {
      setRemoteUserNames((prev) => ({ ...prev, [userId]: { name: userName, image: userImage } }));
      createPeerConnection(userId);
    });

    socket.on("room-participants", (users: any[]) =>
      users.forEach((u) => {
        setRemoteUserNames((prev) => ({ ...prev, [u.userId]: { name: u.userName, image: u.userImage } }));
        createPeerConnection(u.userId);
      })
    );

    socket.on("offer", async ({ sdp, caller }: any) => {
      const pc = peersRef.current[caller] || createPeerConnection(caller);
      const polite = currentUserId < caller;
      if (!polite && (makingOfferRef.current[caller] || pc.signalingState !== "stable")) return;
      try {
        await pc.setRemoteDescription(sdp);
        await pc.setLocalDescription();
        socket.emit("answer", { target: caller, sdp: pc.localDescription });
      } catch (err) {
        console.error("Offer error:", err);
      }
    });

    socket.on("answer", async ({ sdp, caller }: any) => {
      const pc = peersRef.current[caller];
      if (pc) await pc.setRemoteDescription(sdp);
    });
    socket.on("ice-candidate", async ({ candidate, caller }: any) => {
      const pc = peersRef.current[caller];
      if (pc) try { await pc.addIceCandidate(candidate); } catch {}
    });

    socket.on("user-disconnected", (userId: string) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }
      setRemoteUserNames((prev) => { const n = { ...prev }; delete n[userId]; return n; });
      setRemoteStates((prev) => { const n = { ...prev }; delete n[userId]; return n; });
    });

    socket.on("user-mute-status", ({ userId, isMuted: m }: any) =>
      setRemoteStates((prev) => ({ ...prev, [userId]: { ...prev[userId], isMuted: m } }))
    );
    socket.on("user-video-status", ({ userId, isVideoOff: v }: any) =>
      setRemoteStates((prev) => ({ ...prev, [userId]: { ...prev[userId], isVideoOff: v } }))
    );
    socket.on("user-hand-status", ({ userId, isRaised }: any) =>
      setRemoteStates((prev) => ({ ...prev, [userId]: { ...prev[userId], isHandRaised: isRaised } }))
    );
    socket.on("user-screen-share-status", ({ userId, isSharing: s, streamId }: any) => {
      setRemoteStates((prev) => ({ ...prev, [userId]: { ...prev[userId], isSharing: s, screenStreamId: streamId } }));
    });

    socket.on("chat-message", (message: any) => setMessages((prev) => [...prev, message]));

    // ─── Moderation events (received) ───
    socket.on("room-ended", () => {
      setRoomEnded(true);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
    });

    socket.on("you-were-kicked", () => {
      setWasKicked(true);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
    });

    socket.on("force-muted", () => {
      const audioTrack = localStreamRef.current?.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = false;
        setIsMuted(true);
        socket.emit("toggle-mute", roomId, currentUserId, true);
      }
    });

    socket.on("force-video-off", () => {
      const videoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = false;
        setIsVideoOff(true);
        socket.emit("toggle-video", roomId, currentUserId, true);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, currentUserId, currentUserName, isAdminProp]);

  const toggleMute = () => {
    const t = localStreamRef.current?.getAudioTracks()[0];
    if (t) {
      t.enabled = !t.enabled;
      setIsMuted(!t.enabled);
      socketRef.current?.emit("toggle-mute", roomId, currentUserId, !t.enabled);
    }
  };

  const toggleVideo = async () => {
    if (isVideoOff) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, aspectRatio: 1.7777 } 
        });
        const newTrack = stream.getVideoTracks()[0];
        
        if (localStreamRef.current) {
          localStreamRef.current.getVideoTracks().forEach(t => localStreamRef.current?.removeTrack(t));
          localStreamRef.current.addTrack(newTrack);
          setLocalStream(new MediaStream(localStreamRef.current.getTracks()));
        }

        Object.values(peersRef.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(newTrack);
        });

        setIsVideoOff(false);
        socketRef.current?.emit("toggle-video", roomId, currentUserId, false);
      } catch (err) {
        console.error("Camera failed to restart", err);
      }
    } else {
      localStreamRef.current?.getVideoTracks().forEach(t => {
        t.enabled = false;
        t.stop(); // Turn off hardware light
        localStreamRef.current?.removeTrack(t);
      });
      setIsVideoOff(true);
      socketRef.current?.emit("toggle-video", roomId, currentUserId, true);
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      localScreenStreamRef.current?.getTracks().forEach((t) => t.stop());
      setIsScreenSharing(false);
      setLocalScreenStream(null);
      localScreenStreamRef.current = null;
      socketRef.current?.emit("toggle-screen-share", roomId, currentUserId, false, null);
      Object.keys(peersRef.current).forEach((id) => triggerNegotiation(id));
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        localScreenStreamRef.current = stream;
        setLocalScreenStream(stream);
        setIsScreenSharing(true);
        socketRef.current?.emit("toggle-screen-share", roomId, currentUserId, true, stream.id);
        Object.values(peersRef.current).forEach((pc) => pc.addTrack(stream.getVideoTracks()[0], stream));
        stream.getVideoTracks()[0].onended = () => toggleScreenShare();
        Object.keys(peersRef.current).forEach((id) => triggerNegotiation(id));
      } catch (err) {
        console.error("ScreenShare Error:", err);
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;
    const msg = {
      userId: currentUserId,
      userName: currentUserName,
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    socketRef.current.emit("chat-message", roomId, msg);
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
  };

  // ─── Host moderation actions ───
  const kickUser = (targetUserId: string) => {
    socketRef.current?.emit("kick-user", roomId, targetUserId);
    // Remove them from our local state immediately
    setRemoteUserNames((prev) => { const n = { ...prev }; delete n[targetUserId]; return n; });
    setRemoteStates((prev) => { const n = { ...prev }; delete n[targetUserId]; return n; });
    if (peersRef.current[targetUserId]) {
      peersRef.current[targetUserId].close();
      delete peersRef.current[targetUserId];
    }
  };

  const forceMuteUser = (targetUserId: string) => {
    socketRef.current?.emit("force-mute-user", roomId, targetUserId);
    setRemoteStates((prev) => ({ ...prev, [targetUserId]: { ...prev[targetUserId], isMuted: true } }));
  };

  const forceVideoOffUser = (targetUserId: string) => {
    socketRef.current?.emit("force-video-off-user", roomId, targetUserId);
    setRemoteStates((prev) => ({ ...prev, [targetUserId]: { ...prev[targetUserId], isVideoOff: true } }));
  };

  // ─── Termination screens ───
  if (roomEnded)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#202124] text-white gap-4">
        <div className="text-2xl font-black uppercase tracking-widest">Meeting Ended</div>
        <p className="text-neutral-400 text-sm">The host has ended this meeting for everyone.</p>
        <Button variant="secondary" className="mt-4" onClick={onLeave}>Return to Dashboard</Button>
      </div>
    );
  if (wasKicked)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#202124] text-white gap-4">
        <div className="text-2xl font-black uppercase tracking-widest text-red-400">Removed from Meeting</div>
        <p className="text-neutral-400 text-sm">You have been removed from this meeting by the host.</p>
        <Button variant="secondary" className="mt-4" onClick={onLeave}>Return to Dashboard</Button>
      </div>
    );
  if (isWaitingForHost)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#202124] text-white gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-2xl font-black uppercase tracking-widest mt-4">Waiting for Host</div>
        <p className="text-neutral-400 text-sm">The meeting host hasn't joined yet. You'll be admitted automatically once they arrive.</p>
        <Button variant="secondary" className="mt-4" onClick={cleanupAndLeave}>Return to Dashboard</Button>
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-[#202124] text-white overflow-hidden relative select-none font-sans">
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-500 ease-in-out ${sidebarTab ? "mr-[350px]" : "mr-0"}`}>
          {activePresenter ? (
            <div className="w-full h-full flex flex-col md:flex-row gap-4 max-w-[1600px]">
              <div className="flex-[7] min-h-0 bg-black rounded-3xl overflow-hidden relative shadow-2xl border border-white/5">
                <VideoTile
                  stream={activePresenter.stream}
                  name={activePresenter.name}
                  image={activePresenter.image}
                  overlayProps={{ ...activePresenter }}
                  isLocal={activePresenter.isMe}
                />
              </div>
              <div className="flex-[2] md:w-72 overflow-y-auto flex flex-row md:flex-col gap-4 p-1 content-start">
                {sortedParticipants
                  .filter((p) => p.id !== activePresenter.id)
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={p.id} className="w-full aspect-video shrink-0">
                      <VideoTile stream={p.stream} isVideoOff={p.isVideoOff} name={p.name} image={p.image} overlayProps={{ ...p, number: i + 2 }} isLocal={p.isMe} isMuted={p.isMuted} />
                    </div>
                  ))}
                {sortedParticipants.length > 6 && (
                  <div className="w-full aspect-video shrink-0">
                    <OverflowTile count={sortedParticipants.length - 6} onClick={() => setSidebarTab("participants")} />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`grid gap-3 w-full transition-all duration-500 items-center justify-items-center place-content-center mx-auto auto-rows-fr ${getGridClass(visibleParticipants.length + (overflowCount > 0 ? 1 : 0))}`} style={{ height: "calc(100vh - 8rem)" }}>
              {visibleParticipants.map((p, index) => (
                <div key={p.id} className="aspect-video relative group cursor-pointer w-full" onClick={() => setPinnedUser(pinnedUser === p.id ? null : p.id)}>
                  <VideoTile stream={p.stream} isVideoOff={p.isVideoOff} name={p.name} image={p.image} overlayProps={{ ...p, number: index + 1 }} isLocal={p.isMe} isMuted={p.isMuted} />
                </div>
              ))}
              {overflowCount > 0 && (
                <div className="aspect-video w-full">
                  <OverflowTile count={overflowCount} onClick={() => setSidebarTab("participants")} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={`fixed top-4 right-4 bottom-28 w-[340px] bg-white text-neutral-900 rounded-3xl shadow-2xl flex flex-col z-40 transition-transform duration-500 ease-in-out border border-neutral-200 overflow-hidden ${sidebarTab ? "translate-x-0" : "translate-x-[400px]"}`}>
          <div className="p-5 border-b flex items-center justify-between">
            <h3 className="font-black text-xl capitalize flex items-center gap-2 tracking-tighter">{sidebarTab}</h3>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100" onClick={() => setSidebarTab(null)}>
              <X />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            {sidebarTab === "participants" ? (
              <div className="space-y-3">
                {sortedParticipants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-100 shadow-sm">
                    <div className={`h-11 w-11 shrink-0 rounded-full flex items-center justify-center text-white font-black shadow-sm ${p.isMe ? "bg-blue-600" : "bg-neutral-500"}`}>
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold truncate">
                        {p.isPresentation ? `${p.name}'s Presentation` : p.name} {p.isMe && "(You)"}
                      </span>
                      <div className="flex gap-2 items-center">
                        {p.isAdmin && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">Host</span>}
                      </div>
                    </div>
                    <div className="flex gap-1.5 items-center text-neutral-400">
                      {p.isMuted && <MicOff className="w-4 h-4 text-red-500" />}
                      {p.isVideoOff && <VideoOff className="w-4 h-4 text-neutral-400" />}
                      {p.isHandRaised && <Hand className="w-4 h-4 text-yellow-500 fill-current" />}
                      {/* Host moderation controls — only for non-self, non-presentation participants */}
                      {isAdmin && !p.isMe && !p.isPresentation && (
                        <>
                          {!p.isMuted && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50" onClick={() => forceMuteUser(p.id)} title="Mute">
                              <MicOff className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                            </Button>
                          )}
                          {!p.isVideoOff && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50" onClick={() => forceVideoOffUser(p.id)} title="Turn off camera">
                              <VideoOff className="w-3.5 h-3.5 text-neutral-400 hover:text-red-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50" onClick={() => kickUser(p.id)} title="Remove from meeting">
                            <UserX className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 px-2">
                {messages.map((m, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-neutral-900 uppercase tracking-tighter">{m.userName}</span>
                      <span className="text-[9px] text-neutral-400 font-bold">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-700 bg-neutral-100 p-3 rounded-2xl rounded-tl-none inline-block w-fit max-w-[95%] break-words shadow-sm border border-neutral-200/50 leading-relaxed font-medium">
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          {sidebarTab === "chat" && (
            <div className="p-5 border-t flex gap-3 items-center bg-neutral-50/50">
              <Input
                placeholder="Send a message"
                className="bg-white border-neutral-200 rounded-2xl h-12 px-5 text-sm shadow-sm focus-visible:ring-blue-500 font-medium"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 rounded-2xl h-12 w-12 p-0 shrink-0 shadow-lg shadow-blue-600/20">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="h-24 bg-[#202124] flex items-center justify-between px-8 z-50">
        <div className="hidden md:flex items-center gap-4 w-1/4 opacity-50 font-black tracking-widest text-xs uppercase">
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="icon"
            className={`rounded-full h-12 w-12 border-none transition-all hover:scale-110 active:scale-95 shadow-lg ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] text-white hover:bg-[#4a4e52]"}`}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="icon"
            className={`rounded-full h-12 w-12 border-none transition-all hover:scale-110 active:scale-95 shadow-lg ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-[#3c4043] text-white hover:bg-[#4a4e52]"}`}
            onClick={toggleVideo}
          >
            {isVideoOff ? <VideoOff /> : <VideoIcon />}
          </Button>
          <Button
            variant={isHandRaised ? "default" : "secondary"}
            size="icon"
            className={`rounded-full h-12 w-12 border-none transition-all hover:scale-110 active:scale-95 shadow-lg ${isHandRaised ? "bg-yellow-500 text-black" : "bg-[#3c4043] text-white hover:bg-[#4a4e52]"}`}
            onClick={() => {
              const next = !isHandRaised;
              setIsHandRaised(next);
              socketRef.current?.emit("toggle-hand", roomId, currentUserId, next);
            }}
          >
            <Hand />
          </Button>
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="icon"
            className={`rounded-full h-12 w-12 border-none transition-all hover:scale-110 active:scale-95 shadow-lg ${isScreenSharing ? "bg-blue-600 text-white" : "bg-[#3c4043] text-white hover:bg-[#4a4e52]"}`}
            onClick={toggleScreenShare}
          >
            <Monitor />
          </Button>
          {isAdmin && (
            <Button
              variant="outline"
              className="rounded-full px-6 h-12 font-bold tracking-tight shadow-xl bg-[#3c4043] border-white/20 text-white hover:bg-blue-600 hover:border-transparent transition-all"
              onClick={() => {
                if (confirm("Leave but keep room running? This will start an auto-recording of the session.")) {
                  const currentToken = token || localStorage.getItem("edulinkx_token") || "";
                  socketRef.current?.emit("resume-for-students", roomId, currentToken);
                  cleanupAndLeave();
                }
              }}
            >
              Resume for Students
            </Button>
          )}
          {isAdmin && user?.role === 'admin' && (
            <Button
              variant="destructive"
              className="rounded-full px-6 h-12 font-black tracking-tighter uppercase shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95 bg-orange-600 hover:bg-orange-700"
              onClick={() => {
                socketRef.current?.emit("force-end-room", roomId);
                cleanupAndLeave();
              }}
            >
              End for All
            </Button>
          )}
          <Button variant="destructive" className="rounded-full px-8 h-12 ml-2 font-black tracking-tighter uppercase shadow-xl shadow-red-600/20 hover:scale-105 active:scale-95" onClick={cleanupAndLeave}>
            <PhoneOff className="mr-2 w-5 h-5" /> Leave
          </Button>
        </div>
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-11 w-11 relative transition-all ${sidebarTab === "participants" ? "bg-blue-600/20 text-blue-400" : "text-neutral-400 hover:bg-white/5"}`}
            onClick={() => setSidebarTab(sidebarTab === "participants" ? null : "participants")}
          >
            <Users />
            <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] rounded-full px-1.5 border border-[#202124]">{sortedParticipants.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full h-11 w-11 relative transition-all ${sidebarTab === "chat" ? "bg-blue-600/20 text-blue-400" : "text-neutral-400 hover:bg-white/5"}`}
            onClick={() => setSidebarTab(sidebarTab === "chat" ? null : "chat")}
          >
            <MessageSquare />
          </Button>
        </div>
      </div>
    </div>
  );
}
