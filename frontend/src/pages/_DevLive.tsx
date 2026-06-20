import { useLiveSession } from "../live/useLiveSession";
import type { RawEvent, TranscriptEntry } from "../live/protocol";

// ── Small primitives ──────────────────────────────────────────────────────────

function Badge({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
        active ? "bg-primary text-on-primary" : "bg-highlight text-secondary"
      }`}
    >
      {label}
    </span>
  );
}

function Panel({
  title,
  children,
  grow,
}: {
  title: string;
  children: React.ReactNode;
  grow?: boolean;
}) {
  return (
    <div
      className={`flex flex-col border border-subtle rounded-md bg-surface ${grow ? "flex-1 min-h-0" : ""}`}
    >
      <div className="px-3 py-2 border-b border-subtle bg-highlight rounded-t-md">
        <span className="text-xs font-mono font-semibold text-secondary uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 min-h-0">{children}</div>
    </div>
  );
}

// ── Sub-sections ──────────────────────────────────────────────────────────────

function TranscriptLog({ entries }: { entries: TranscriptEntry[] }) {
  if (entries.length === 0)
    return <p className="text-secondary text-sm italic">No transcript yet.</p>;

  return (
    <div className="space-y-1">
      {[...entries].reverse().map((e, i) => (
        <div key={i} className="flex gap-2 text-sm font-mono">
          <span
            className={`shrink-0 font-bold ${
              e.role === "model" ? "text-pastel-blue" : "text-pastel-green"
            }`}
          >
            {e.role === "model" ? "AI" : "PT"}
          </span>
          <span className="text-primary">{e.text}</span>
        </div>
      ))}
    </div>
  );
}

function ToolCallLog({ events }: { events: RawEvent[] }) {
  const calls = events.filter(
    (e): e is RawEvent & { data: { type: "tool_call"; name: string; args: Record<string, unknown> } } =>
      e.data.type === "tool_call",
  );

  if (calls.length === 0)
    return (
      <p className="text-secondary text-sm italic">No tool calls yet.</p>
    );

  return (
    <div className="space-y-1">
      {[...calls].reverse().map((e, i) => {
        const time = new Date(e.ts).toISOString().slice(11, 23);
        const hasArgs = e.data.args && Object.keys(e.data.args).length > 0;
        return (
          <div key={i} className="text-xs font-mono break-all">
            <span className="text-secondary opacity-60">{time} </span>
            <span className="text-pastel-teal font-bold">{e.data.name}</span>
            {hasArgs && (
              <span className="text-primary"> {JSON.stringify(e.data.args)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RawEventLog({ events }: { events: RawEvent[] }) {
  if (events.length === 0)
    return <p className="text-secondary text-sm italic">No events yet.</p>;

  return (
    <div className="space-y-0.5">
      {[...events].reverse().map((e, i) => {
        const time = new Date(e.ts).toISOString().slice(11, 23);
        const isToolCall = e.data.type === "tool_call";
        const isComplete = e.data.type === "session_complete";
        return (
          <div
            key={i}
            className={`text-xs font-mono break-all ${
              isToolCall
                ? "text-pastel-teal font-bold"
                : isComplete
                  ? "text-pastel-green font-bold"
                  : "text-secondary"
            }`}
          >
            <span className="opacity-60">{time} </span>
            {JSON.stringify(e.data)}
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DevLive() {
  const { state, start, endSession, stop } = useLiveSession();
  const {
    status,
    transcript,
    currentModelSubtitle,
    currentUserSubtitle,
    notes,
    record,
    isSpeaking,
    activeToolCall,
    emergencyAlert,
    error,
    rawEvents,
  } = state;

  const isIdle = status === "idle";
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";
  const isDone = status === "done";

  return (
    <main className="flex flex-col gap-3 p-4 min-h-screen bg-main font-body">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between bg-surface border border-subtle rounded-md px-4 py-2">
        <span className="font-heading text-sm font-bold text-secondary">
          DEV — Live Session Harness
        </span>
        <div className="flex items-center gap-2">
          <Badge label={status} active={isConnected} />
          {isSpeaking && <Badge label="speaking" active />}
          {isConnected && (
            <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex gap-2 flex-wrap items-center">
        {isIdle && (
          <button
            onClick={start}
            className="px-4 py-2 rounded-md bg-primary text-on-primary text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Start Session
          </button>
        )}
        {isConnecting && (
          <span className="px-4 py-2 text-sm text-secondary italic">
            Connecting…
          </span>
        )}
        {isConnected && (
          <>
            <button
              onClick={endSession}
              className="px-4 py-2 rounded-md bg-secondary text-inverse text-sm font-semibold hover:opacity-80 transition-opacity"
            >
              End Interview
            </button>
            <button
              onClick={stop}
              className="px-4 py-2 rounded-md border border-subtle text-secondary text-sm hover:bg-highlight transition-colors"
            >
              Force Disconnect
            </button>
          </>
        )}
        {(isDone || status === "error") && (
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md border border-subtle text-secondary text-sm hover:bg-highlight transition-colors"
          >
            Reset
          </button>
        )}
        {error && (
          <span className="px-4 py-2 text-sm text-error font-mono">
            Error: {error}
          </span>
        )}
      </div>

      {/* ── Emergency alert ── */}
      {emergencyAlert && (
        <div className="flex items-start gap-3 rounded-md bg-error px-4 py-3 text-inverse">
          <span className="text-lg leading-none">🚨</span>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold uppercase tracking-wide font-mono">
              Emergency alert — {emergencyAlert.severity}
            </span>
            <span className="text-sm font-body">{emergencyAlert.reason}</span>
          </div>
        </div>
      )}

      {/* ── Active tool call ── */}
      {activeToolCall && (
        <div className="flex items-center gap-2 rounded-md bg-highlight border border-subtle px-4 py-2 text-sm font-mono text-secondary">
          <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
          <span className="font-bold">{activeToolCall.name}</span>
          {Object.keys(activeToolCall.args).length > 0 && (
            <span className="text-secondary opacity-70 truncate">
              {JSON.stringify(activeToolCall.args)}
            </span>
          )}
        </div>
      )}

      {/* ── Live subtitles ── */}
      <div className="grid grid-cols-2 gap-3">
        <Panel title="Model subtitle (live)">
          <p className="text-primary text-sm min-h-12">
            {currentModelSubtitle || (
              <span className="text-secondary italic">Waiting…</span>
            )}
          </p>
        </Panel>
        <Panel title="User subtitle (live)">
          <p className="text-primary text-sm min-h-12">
            {currentUserSubtitle || (
              <span className="text-secondary italic">Listening…</span>
            )}
          </p>
        </Panel>
      </div>

      {/* ── Notes ── */}
      <Panel title="Live notes (record_notes tool)">
        <pre className="text-sm text-primary whitespace-pre-wrap font-mono min-h-16">
          {notes || <span className="text-secondary italic">No notes yet.</span>}
        </pre>
      </Panel>

      {/* ── Tool calls ── */}
      <Panel title="Tool calls (newest first)">
        <ToolCallLog events={rawEvents} />
      </Panel>

      {/* ── Transcript + raw events ── */}
      <div className="grid grid-cols-2 gap-3 h-80">
        <Panel title="Full transcript (newest first)" grow>
          <TranscriptLog entries={transcript} />
        </Panel>
        <Panel title="Raw WS events (newest first)" grow>
          <RawEventLog events={rawEvents} />
        </Panel>
      </div>

      {/* ── Final record ── */}
      {record && (
        <Panel title="Patient record (session_complete)">
          <pre className="text-xs font-mono text-primary whitespace-pre-wrap">
            {JSON.stringify(record, null, 2)}
          </pre>
        </Panel>
      )}
    </main>
  );
}
