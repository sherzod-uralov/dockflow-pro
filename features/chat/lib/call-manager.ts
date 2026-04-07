import { chatSocket } from "./chat-socket";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
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

class CallManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private current: ActiveCall | null = null;
  private listeners = new Set<Listener>();
  private pendingCandidates: RTCIceCandidateInit[] = [];

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
    this.pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        chatSocket.sendCallSignal({
          callId,
          type: "ice",
          targetUserId,
          payload: event.candidate.toJSON(),
        });
      }
    };

    this.pc.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream?.addTrack(track);
      });
      this.attachRemoteAudio();
    };

    this.pc.onconnectionstatechange = () => {
      const state = this.pc?.connectionState;
      if (state === "connected" && this.current) {
        this.current = { ...this.current, status: "active", startedAt: Date.now() };
        this.notify();
      } else if (state === "failed" || state === "closed") {
        this.cleanup();
      }
    };

    // Get mic
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.localStream.getTracks().forEach((track) => {
        this.pc?.addTrack(track, this.localStream!);
      });
    } catch (err) {
      this.cleanup();
      throw new Error("Mikrofonga ruxsat berilmadi");
    }
  }

  private attachRemoteAudio() {
    if (!this.remoteStream) return;
    if (!this.remoteAudio) {
      this.remoteAudio = document.createElement("audio");
      this.remoteAudio.autoplay = true;
      this.remoteAudio.style.display = "none";
      document.body.appendChild(this.remoteAudio);
    }
    this.remoteAudio.srcObject = this.remoteStream;
    this.remoteAudio.play().catch((err) => console.error("[Call] audio play", err));
  }

  // ─── Outgoing call ────────────────────────────────────
  async startCall(params: {
    callId: string;
    chatId: string;
    targetUserId: string;
    peerName?: string;
    peerAvatar?: string;
  }) {
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

    const offer = await this.pc!.createOffer();
    await this.pc!.setLocalDescription(offer);

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
    if (this.current) return; // already in a call
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
    this.current = { ...this.current, status: "connecting" };
    this.notify();

    await this.setupPeerConnection(this.current.peerUserId, this.current.callId);

    // Apply pending candidates if offer already received
    for (const candidate of this.pendingCandidates) {
      try {
        await this.pc?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("[Call] addIceCandidate error", err);
      }
    }
    this.pendingCandidates = [];
  }

  // ─── Handle remote signal ─────────────────────────────
  async handleSignal(data: {
    callId: string;
    type: "offer" | "answer" | "ice";
    fromUserId: string;
    payload: any;
  }) {
    if (!this.current || this.current.callId !== data.callId) return;

    if (data.type === "offer") {
      // We are callee — wait until accept, then process
      if (!this.pc) {
        // Store pending offer for after accept
        (this as any).pendingOffer = data.payload;
        return;
      }
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      chatSocket.sendCallSignal({
        callId: data.callId,
        type: "answer",
        targetUserId: data.fromUserId,
        payload: answer,
      });
      return;
    }

    if (data.type === "answer") {
      if (!this.pc) return;
      await this.pc.setRemoteDescription(new RTCSessionDescription(data.payload));
      return;
    }

    if (data.type === "ice") {
      if (!this.pc || !this.pc.remoteDescription) {
        this.pendingCandidates.push(data.payload);
        return;
      }
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(data.payload));
      } catch (err) {
        console.error("[Call] addIceCandidate", err);
      }
    }
  }

  // After accepting, if there's a pending offer, process it now
  async processPendingOffer() {
    const pending = (this as any).pendingOffer;
    if (!pending || !this.pc || !this.current) return;
    (this as any).pendingOffer = null;

    await this.pc.setRemoteDescription(new RTCSessionDescription(pending));
    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    chatSocket.sendCallSignal({
      callId: this.current.callId,
      type: "answer",
      targetUserId: this.current.peerUserId,
      payload: answer,
    });

    for (const candidate of this.pendingCandidates) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    }
    this.pendingCandidates = [];
  }

  // ─── Mute / Unmute mic ────────────────────────────────
  toggleMute(muted: boolean) {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });
  }

  // ─── End / Cleanup ────────────────────────────────────
  cleanup() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
    if (this.remoteAudio) {
      this.remoteAudio.pause();
      this.remoteAudio.srcObject = null;
      this.remoteAudio.remove();
      this.remoteAudio = null;
    }
    this.remoteStream = null;
    this.pendingCandidates = [];
    (this as any).pendingOffer = null;
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
