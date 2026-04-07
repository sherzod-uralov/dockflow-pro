import { chatSocket } from "./chat-socket";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:stun2.l.google.com:19302" },
  { urls: "stun:stun3.l.google.com:19302" },
  { urls: "stun:stun4.l.google.com:19302" },
];

export type CallStatus = "idle" | "ringing-out" | "ringing-in" | "connecting" | "active" | "ended";

export interface ActiveCall {
  callId: string;
  chatId: string;
  type: "AUDIO" | "VIDEO";
  status: CallStatus;
  isCaller: boolean;
  peerUserId: string;
  peerName?: string;
  peerAvatar?: string;
  startedAt?: number;
}

type Listener = (call: ActiveCall | null) => void;

const log = (...args: unknown[]) => console.log("[Call]", ...args);
const warn = (...args: unknown[]) => console.warn("[Call]", ...args);
const error = (...args: unknown[]) => console.error("[Call]", ...args);

class CallManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private current: ActiveCall | null = null;
  private listeners = new Set<Listener>();
  private pendingCandidates: RTCIceCandidateInit[] = [];
  private pendingOffer: RTCSessionDescriptionInit | null = null;
  private hasRemoteDescription = false;

  // ─── Subscriptions ────────────────────────────────────
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.current);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.current));
  }

  getCurrent() {
    return this.current;
  }

  // ─── Setup PC ─────────────────────────────────────────
  private async setupPeerConnection(targetUserId: string, callId: string) {
    log("setupPeerConnection", { callId, targetUserId });

    // Pre-create remote audio element so we don't lose first track
    this.ensureRemoteAudio();

    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        log("local ICE candidate →", event.candidate.candidate?.substring(0, 50));
        chatSocket.sendCallSignal({
          callId,
          type: "ice",
          targetUserId,
          payload: event.candidate.toJSON(),
        });
      } else {
        log("ICE gathering complete");
      }
    };

    this.pc.onicegatheringstatechange = () => {
      log("iceGatheringState:", this.pc?.iceGatheringState);
    };

    this.pc.oniceconnectionstatechange = () => {
      const state = this.pc?.iceConnectionState;
      log("iceConnectionState:", state);
      // Fallback for browsers where connectionstatechange doesn't fire
      if (state === "connected" || state === "completed") {
        this.markActive();
      } else if (state === "failed" || state === "closed") {
        warn("ICE connection failed/closed");
        this.cleanup();
      }
    };

    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      log("connectionState:", state);
      if (state === "connected") {
        this.markActive();
      } else if (state === "failed" || state === "closed") {
        this.cleanup();
      }
    };

    this.pc.onsignalingstatechange = () => {
      log("signalingState:", this.pc?.signalingState);
    };

    this.pc.ontrack = (event) => {
      log("ontrack — received remote track", event.track.kind);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      // Use the streams[0] approach (better cross-browser)
      const stream = event.streams[0];
      if (stream) {
        stream.getTracks().forEach((track) => {
          if (!this.remoteStream!.getTracks().includes(track)) {
            this.remoteStream!.addTrack(track);
          }
        });
      } else {
        this.remoteStream.addTrack(event.track);
      }
      this.attachRemoteAudio();
    };

    // Get mic
    try {
      log("requesting microphone...");
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      log("microphone OK", this.localStream.getAudioTracks().length, "tracks");
      this.localStream.getTracks().forEach((track) => {
        log("adding local track:", track.kind, track.label);
        this.pc?.addTrack(track, this.localStream!);
      });
    } catch (err) {
      error("getUserMedia failed:", err);
      this.cleanup();
      throw new Error("Mikrofonga ruxsat berilmadi");
    }
  }

  private markActive() {
    if (!this.current || this.current.status === "active") return;
    log("→ ACTIVE");
    this.current = { ...this.current, status: "active", startedAt: this.current.startedAt || Date.now() };
    this.notify();
  }

  private ensureRemoteAudio() {
    if (this.remoteAudio) return;
    this.remoteAudio = document.createElement("audio");
    this.remoteAudio.autoplay = true;
    this.remoteAudio.setAttribute("playsinline", "true");
    this.remoteAudio.style.display = "none";
    document.body.appendChild(this.remoteAudio);
  }

  private attachRemoteAudio() {
    if (!this.remoteStream || !this.remoteAudio) return;
    this.remoteAudio.srcObject = this.remoteStream;
    this.remoteAudio.play().catch((err) => warn("audio.play() failed:", err));
  }

  // ─── Outgoing call ────────────────────────────────────
  async startCall(params: {
    callId: string;
    chatId: string;
    targetUserId: string;
    peerName?: string;
    peerAvatar?: string;
  }) {
    log("startCall (caller)", params);
    this.pendingOffer = null;
    this.pendingCandidates = [];
    this.hasRemoteDescription = false;

    this.current = {
      callId: params.callId,
      chatId: params.chatId,
      type: "AUDIO",
      status: "ringing-out",
      isCaller: true,
      peerUserId: params.targetUserId,
      peerName: params.peerName,
      peerAvatar: params.peerAvatar,
    };
    this.notify();

    await this.setupPeerConnection(params.targetUserId, params.callId);

    const offer = await this.pc!.createOffer({ offerToReceiveAudio: true });
    await this.pc!.setLocalDescription(offer);
    log("offer created, sending →", params.targetUserId);

    chatSocket.sendCallSignal({
      callId: params.callId,
      type: "offer",
      targetUserId: params.targetUserId,
      payload: offer,
    });
  }

  // ─── Incoming call ────────────────────────────────────
  setIncoming(params: {
    callId: string;
    chatId: string;
    fromUserId: string;
    peerName?: string;
    peerAvatar?: string;
    type?: "AUDIO" | "VIDEO";
  }) {
    log("incoming call", params);
    if (this.current) {
      warn("already in a call, ignoring");
      return;
    }
    this.pendingOffer = null;
    this.pendingCandidates = [];
    this.hasRemoteDescription = false;

    this.current = {
      callId: params.callId,
      chatId: params.chatId,
      type: params.type || "AUDIO",
      status: "ringing-in",
      isCaller: false,
      peerUserId: params.fromUserId,
      peerName: params.peerName,
      peerAvatar: params.peerAvatar,
    };
    this.notify();
  }

  // ─── Accept incoming ──────────────────────────────────
  async acceptIncoming() {
    if (!this.current || this.current.isCaller) return;
    log("acceptIncoming");
    this.current = { ...this.current, status: "connecting" };
    this.notify();

    await this.setupPeerConnection(this.current.peerUserId, this.current.callId);

    // If offer already arrived, process it now
    if (this.pendingOffer) {
      log("processing pending offer after accept");
      await this.handleOffer(this.pendingOffer);
      this.pendingOffer = null;
    }
  }

  // ─── Handle remote signal ─────────────────────────────
  async handleSignal(data: {
    callId: string;
    type: "offer" | "answer" | "ice";
    fromUserId: string;
    payload: any;
  }) {
    if (!this.current || this.current.callId !== data.callId) {
      warn("signal for unknown call", data.callId);
      return;
    }
    log("signal received:", data.type);

    if (data.type === "offer") {
      if (!this.pc) {
        log("offer arrived before pc, queuing");
        this.pendingOffer = data.payload;
        return;
      }
      await this.handleOffer(data.payload);
      return;
    }

    if (data.type === "answer") {
      if (!this.pc) {
        warn("answer arrived but no pc!");
        return;
      }
      log("setRemoteDescription(answer)");
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
      this.hasRemoteDescription = true;
      await this.flushPendingCandidates();
      return;
    }

    if (data.type === "ice") {
      if (!this.pc || !this.hasRemoteDescription) {
        log("ICE arrived before remote description, queuing");
        this.pendingCandidates.push(data.payload);
        return;
      }
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(data.payload));
      } catch (err) {
        warn("addIceCandidate failed", err);
      }
    }
  }

  private async handleOffer(payload: RTCSessionDescriptionInit) {
    if (!this.pc || !this.current) return;
    log("setRemoteDescription(offer)");
    await this.pc.setRemoteDescription(new RTCSessionDescription(payload));
    this.hasRemoteDescription = true;

    log("createAnswer");
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);

    log("sending answer →", this.current.peerUserId);
    chatSocket.sendCallSignal({
      callId: this.current.callId,
      type: "answer",
      targetUserId: this.current.peerUserId,
      payload: answer,
    });

    await this.flushPendingCandidates();
  }

  private async flushPendingCandidates() {
    if (!this.pc || this.pendingCandidates.length === 0) return;
    log(`flushing ${this.pendingCandidates.length} pending ICE candidates`);
    for (const candidate of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        warn("addIceCandidate (flush) failed", err);
      }
    }
    this.pendingCandidates = [];
  }

  // Public — for use-chat-call backwards compat
  async processPendingOffer() {
    if (!this.pendingOffer || !this.pc || !this.current) return;
    const pending = this.pendingOffer;
    this.pendingOffer = null;
    await this.handleOffer(pending);
  }

  // ─── Mute / Unmute mic ────────────────────────────────
  toggleMute(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  // ─── End / Cleanup ────────────────────────────────────
  cleanup() {
    log("cleanup");
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.remoteAudio) {
      try {
        this.remoteAudio.pause();
        this.remoteAudio.srcObject = null;
        this.remoteAudio.remove();
      } catch {}
      this.remoteAudio = null;
    }
    this.remoteStream = null;
    this.pendingCandidates = [];
    this.pendingOffer = null;
    this.hasRemoteDescription = false;
    this.current = null;
    this.notify();
  }

  setStatus(status: CallStatus) {
    if (!this.current) return;
    this.current = { ...this.current, status };
    this.notify();
  }
}

export const callManager = new CallManager();
