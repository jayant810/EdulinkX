import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || "https://web-meet.duckdns.org";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function BotRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!roomId || !canvasRef.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const adminToken = urlParams.get('token') || "";

    console.log("[BotRoom] Initializing Recorder Bot for room:", roomId);
    let socket = io(SIGNALING_SERVER, { path: "/socket.io/", transports: ["websocket"] });
    
    const peers: Record<string, RTCPeerConnection> = {};
    const streams: Record<string, MediaStream> = {};
    const videoElements: Record<string, HTMLVideoElement> = {};
    
    // Web Audio mixing setup
    const audioCtx = new AudioContext();
    const dest = audioCtx.createMediaStreamDestination();
    
    const botId = `recorder-bot-${Date.now()}`;
    // Join as preAuthorized admin so we can record instantly
    socket.emit("join-room", roomId, botId, "System Recorder", true, true, null);

    socket.on("join-approved", () => {
      socket.emit("ready-to-connect", roomId, botId, "System Recorder", null);
      startRecording();
    });

    const createPeer = (userId: string) => {
      const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      peers[userId] = pc;
      
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) socket.emit("ice-candidate", { target: userId, candidate });
      };
      
      pc.ontrack = (event) => {
        const stream = event.streams[0];
        if (!stream) return;
        streams[userId] = stream;
        
        // Handle Video Tracking
        if (stream.getVideoTracks().length > 0) {
          const v = document.createElement("video");
          v.srcObject = stream;
          v.autoplay = true;
          v.playsInline = true;
          v.muted = true; // Crucial: avoid echo loop
          v.play().catch(() => {});
          videoElements[userId] = v;
        }

        // Handle Audio Mixing
        if (stream.getAudioTracks().length > 0) {
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(dest);
        }
      };
      
      pc.onnegotiationneeded = async () => {
        try {
          await pc.setLocalDescription();
          socket.emit("offer", { target: userId, sdp: pc.localDescription });
        } catch (e) {
          console.error(e);
        }
      };

      return pc;
    };

    socket.on("user-connected", (userId) => createPeer(userId));
    socket.on("room-participants", (users) => users.forEach((u: any) => createPeer(u.userId)));
    
    socket.on("offer", async ({ sdp, caller }: any) => {
      const pc = peers[caller] || createPeer(caller);
      await pc.setRemoteDescription(sdp);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { target: caller, sdp: pc.localDescription });
    });
    
    socket.on("answer", async ({ sdp, caller }: any) => {
      if (peers[caller]) await peers[caller].setRemoteDescription(sdp);
    });

    socket.on("ice-candidate", ({ candidate, caller }: any) => {
      if (peers[caller]) peers[caller].addIceCandidate(candidate).catch(()=>{});
    });

    socket.on("user-disconnected", (userId: string) => {
      if (peers[userId]) peers[userId].close();
      delete peers[userId];
      delete streams[userId];
      if (videoElements[userId]) {
        videoElements[userId].srcObject = null;
        delete videoElements[userId];
      }
    });

    let mediaRecorder: MediaRecorder | null = null;
    let chunks: Blob[] = [];
    let isUploading = false;

    const startRecording = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      
      // Infinite recursive draw loop
      const draw = () => {
        ctx.fillStyle = "#202124";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const activeVids = Object.values(videoElements).filter(v => v.readyState >= 2);
        
        if (activeVids.length > 0) {
          // Dynamic CSS Grid math mapped to canvas
          let cols = Math.ceil(Math.sqrt(activeVids.length));
          let rows = Math.ceil(activeVids.length / cols);
          let w = canvas.width / cols;
          let h = canvas.height / rows;
          
          activeVids.forEach((v, i) => {
            let x = (i % cols) * w;
            let y = Math.floor(i / cols) * h;
            // Center crop logic wrapper
            const vRatio = v.videoWidth / v.videoHeight;
            const cRatio = w / h;
            let drawW = w, drawH = w / vRatio;
            if (cRatio > vRatio) {
               drawW = h * vRatio;
               drawH = h;
            }
            let drawX = x + (w - drawW)/2;
            let drawY = y + (h - drawH)/2;
            
            ctx.drawImage(v, drawX, drawY, drawW, drawH);
          });
        }
        requestAnimationFrame(draw);
      };
      
      draw(); // Ignite loop

      const videoStream = canvas.captureStream(30);
      const tracks = [...videoStream.getVideoTracks(), ...dest.stream.getAudioTracks()];
      const combinedStream = new MediaStream(tracks);

      mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm; codecs=vp8,opus' });
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start(2000); // 2 second chunks
      console.log("[BotRoom] MediaRecorder started!");
    };

    const flushAndUpload = async () => {
      console.log("[BotRoom] flushAndUpload Triggered! isUploading:", isUploading);
      if (isUploading) return;
      isUploading = true;
      try {
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          console.log("[BotRoom] mediaRecorder successfully stopped.");
        }
      } catch (err) {
        console.error("[BotRoom] Error stopping mediaRecorder:", err);
      }
      
      console.log("[BotRoom] Finalizing recording file. Waiting for blob chunks...");
      setTimeout(async () => {
        if (chunks.length === 0) {
           console.log("BOT_FINISHED_RECORDING");
           return;
        }
        
        const blob = new Blob(chunks, { type: "video/webm" });
        const fd = new FormData();
        fd.append("file", blob, "recording.webm");
        fd.append("roomId", roomId);
        
        try {
          console.log("[BotRoom] Uploading securely to Backend API...");
          await fetch(`${API_BASE}/api/online-classes/recordings`, { 
            method: "POST", 
            headers: { "Authorization": `Bearer ${adminToken}` },
            body: fd 
          });
          console.log("BOT_FINISHED_RECORDING"); // Magic string read by Puppeteer STDOUT
        } catch(e) {
          console.error("Upload failed", e);
          console.log("BOT_FINISHED_RECORDING"); 
        }
      }, 1500); // Wait for final chunks
    };

    socket.on("room-ended", flushAndUpload);
    // Safety generic listener if completely orphaned
    socket.on("disconnect", () => { flushAndUpload(); });

    return () => {
      flushAndUpload();
      socket.disconnect();
      if (audioCtx.state !== 'closed') audioCtx.close();
    };

  }, [roomId]);

  return (
    <div style={{ background: '#000', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <h1 style={{ color: 'white', position: 'absolute', zIndex: 10, fontFamily: 'monospace', opacity: 0.5 }}>● SYSTEM RECORDING NODE ACTIVE</h1>
      <canvas ref={canvasRef} width={1920} height={1080} style={{ maxWidth: '100%', maxHeight: '100%' }} />
    </div>
  );
}
