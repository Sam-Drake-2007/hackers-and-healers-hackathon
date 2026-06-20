import { useCallback, useEffect, useRef, useState } from "react";
import captureProcessorUrl from "./worklets/capture-processor.ts?url";
import type {
  PatientRecord,
  RawEvent,
  ServerMessage,
  TranscriptEntry,
} from "./protocol";

// ── State exposed to consumers ─────────────────────────────────────────────────

export type SessionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "done"
  | "error";

export interface LiveSessionState {
  status: SessionStatus;
  /** Accumulated full transcript (all turns). */
  transcript: TranscriptEntry[];
  /** What the model is saying right now (persists until next model turn starts). */
  currentModelSubtitle: string;
  /** What the user is saying right now (persists until next user turn starts). */
  currentUserSubtitle: string;
  /** Accumulated freeform notes (latest full value from backend). */
  notes: string;
  /** Structured patient record — available after session_complete. */
  record: PatientRecord | null;
  /** True while 24 kHz audio chunks from the model are playing. */
  isSpeaking: boolean;
  /** The most recent tool call fired by the model, or null when idle. */
  activeToolCall: { name: string; args: Record<string, unknown> } | null;
  /** Set when the model triggers an emergency alert — null otherwise. */
  emergencyAlert: { severity: "urgent" | "critical"; reason: string } | null;
  error: string | null;
  /** Every raw JSON event received — for the dev harness. */
  rawEvents: RawEvent[];
  /** Internal: replace model subtitle on next transcript chunk instead of appending. */
  _clearModelSubtitle: boolean;
  /** Internal: replace user subtitle on next transcript chunk instead of appending. */
  _clearUserSubtitle: boolean;
}

const INITIAL_STATE: LiveSessionState = {
  status: "idle",
  transcript: [],
  currentModelSubtitle: "",
  currentUserSubtitle: "",
  notes: "",
  record: null,
  isSpeaking: false,
  activeToolCall: null,
  emergencyAlert: null,
  error: null,
  rawEvents: [],
  _clearModelSubtitle: false,
  _clearUserSubtitle: false,
};

const MAX_RAW_EVENTS = 300;

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useLiveSession(options?: {
  onComplete?: (record: PatientRecord) => void;
}) {
  const [state, setState] = useState<LiveSessionState>(INITIAL_STATE);

  // Mutable refs — not reactive, just plumbing.
  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  // ── Audio playback helpers ──────────────────────────────────────────────────

  const scheduleAudio = useCallback((raw: ArrayBuffer) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const int16 = new Int16Array(raw);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const now = ctx.currentTime;
    if (nextPlayTimeRef.current < now) nextPlayTimeRef.current = now;
    source.start(nextPlayTimeRef.current);
    nextPlayTimeRef.current += buffer.duration;

    playbackQueueRef.current.push(source);
    setState((s) => ({ ...s, isSpeaking: true }));

    source.onended = () => {
      playbackQueueRef.current = playbackQueueRef.current.filter(
        (n) => n !== source,
      );
      if (playbackQueueRef.current.length === 0) {
        setState((s) => ({ ...s, isSpeaking: false }));
      }
    };
  }, []);

  const flushPlayback = useCallback(() => {
    for (const source of playbackQueueRef.current) {
      try {
        source.stop();
      } catch {
        // Already stopped or never started — nothing to clean up.
      }
    }
    playbackQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    setState((s) => ({ ...s, isSpeaking: false }));
  }, []);

  // ── WS message dispatch ─────────────────────────────────────────────────────

  const handleServerMessage = useCallback(
    (msg: ServerMessage) => {
      const ts = Date.now();

      setState((s) => {
        const rawEvents: RawEvent[] =
          s.rawEvents.length >= MAX_RAW_EVENTS
            ? [...s.rawEvents.slice(1), { ts, data: msg }]
            : [...s.rawEvents, { ts, data: msg }];

        switch (msg.type) {
          case "transcript": {
            const entry: TranscriptEntry = { role: msg.role, text: msg.text };

            if (msg.role === "model") {
              return {
                ...s,
                rawEvents,
                transcript: [...s.transcript, entry],
                currentModelSubtitle: s._clearModelSubtitle
                  ? msg.text
                  : s.currentModelSubtitle + msg.text,
                _clearModelSubtitle: false,
              };
            } else {
              return {
                ...s,
                rawEvents,
                transcript: [...s.transcript, entry],
                currentUserSubtitle: s._clearUserSubtitle
                  ? msg.text
                  : s.currentUserSubtitle + msg.text,
                _clearUserSubtitle: false,
              };
            }
          }

          case "notes":
            return { ...s, rawEvents, notes: msg.text };

          case "tool_call":
            return {
              ...s,
              rawEvents,
              activeToolCall: { name: msg.name, args: msg.args },
            };

          case "interrupt":
            flushPlayback();
            // Model was cut off — clear subtitle immediately and cancel any
            // pending clear so the next chunk starts fresh either way.
            return {
              ...s,
              rawEvents,
              currentModelSubtitle: "",
              _clearModelSubtitle: false,
              isSpeaking: false,
            };

          case "turn_complete":
            // Don't clear subtitles yet — let them persist until the next
            // transcript chunk for each role arrives.
            return {
              ...s,
              rawEvents,
              activeToolCall: null,
              _clearModelSubtitle: true,
              _clearUserSubtitle: true,
            };

          case "emergency_alert":
            return {
              ...s,
              rawEvents,
              emergencyAlert: { severity: msg.severity, reason: msg.reason },
              activeToolCall: null,
            };

          case "session_complete":
            options?.onComplete?.(msg.record);
            return {
              ...s,
              rawEvents,
              status: "done",
              record: msg.record,
              activeToolCall: null,
            };

          case "error":
            return { ...s, rawEvents, status: "error", error: msg.message };

          default:
            return { ...s, rawEvents };
        }
      });
    },
    [flushPlayback, options],
  );

  // ── Start / stop ────────────────────────────────────────────────────────────

  const stop = useCallback(() => {
    flushPlayback();

    wsRef.current?.close();
    wsRef.current = null;

    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    audioCtxRef.current?.close();
    audioCtxRef.current = null;

    setState((s) => ({ ...s, status: "idle" }));
  }, [flushPlayback]);

  const start = useCallback(async () => {
    if (wsRef.current) return;

    setState({ ...INITIAL_STATE, status: "connecting" });

    try {
      // Mic access + AudioContext (must be inside a user gesture).
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      micStreamRef.current = stream;

      const ctx = new AudioContext();
      await ctx.resume();
      audioCtxRef.current = ctx;

      await ctx.audioWorklet.addModule(captureProcessorUrl);
      const workletNode = new AudioWorkletNode(ctx, "capture-processor");
      workletNodeRef.current = workletNode;

      const micSource = ctx.createMediaStreamSource(stream);
      micSource.connect(workletNode);
      // Don't connect workletNode to destination — we don't want mic feedback.

      // WebSocket. In production, VITE_WS_URL points directly at the backend
      // (e.g. wss://<app>.up.railway.app/ws). In dev it's unset, so we fall
      // back to the same-host /api path that Vite proxies to localhost:8000.
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl =
        import.meta.env.VITE_WS_URL ?? `${proto}//${location.host}/api/ws`;
      const ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";
      wsRef.current = ws;

      ws.onopen = () => {
        setState((s) => ({ ...s, status: "connected" }));
        // Wire worklet → WS after socket is open.
        workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(e.data);
          }
        };
      };

      ws.onmessage = (e: MessageEvent) => {
        if (e.data instanceof ArrayBuffer) {
          scheduleAudio(e.data);
        } else {
          try {
            handleServerMessage(JSON.parse(e.data as string) as ServerMessage);
          } catch {
            console.warn("Could not parse WS message:", e.data);
          }
        }
      };

      ws.onerror = () => {
        setState((s) => ({ ...s, status: "error", error: "WebSocket error" }));
      };

      ws.onclose = () => {
        setState((s) =>
          s.status === "connected" ? { ...s, status: "idle" } : s,
        );
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState((s) => ({ ...s, status: "error", error: message }));
      stop();
    }
  }, [handleServerMessage, scheduleAudio, stop]);

  const endSession = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: "end_session" }));
  }, []);

  // Clean up on unmount.
  useEffect(() => () => stop(), [stop]);

  return { state, start, endSession, stop };
}
