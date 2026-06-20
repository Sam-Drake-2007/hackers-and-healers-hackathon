// ── Outbound (browser → backend) ──────────────────────────────────────────────

export interface EndSessionMessage {
  type: "end_session";
}

export type ClientMessage = EndSessionMessage;

// ── Inbound (backend → browser) ───────────────────────────────────────────────

export interface InterruptMessage {
  type: "interrupt";
}

export interface TranscriptMessage {
  type: "transcript";
  role: "user" | "model";
  text: string;
}

export interface NotesMessage {
  type: "notes";
  text: string;
}

export interface ToolCallMessage {
  type: "tool_call";
  name: string;
  args: Record<string, unknown>;
}

export interface TurnCompleteMessage {
  type: "turn_complete";
}

export interface SessionCompleteMessage {
  type: "session_complete";
  record: PatientRecord;
}

export interface ErrorMessage {
  type: "error";
  message: string;
}

export type ServerMessage =
  | InterruptMessage
  | TranscriptMessage
  | NotesMessage
  | ToolCallMessage
  | TurnCompleteMessage
  | SessionCompleteMessage
  | ErrorMessage;

// ── Domain types ──────────────────────────────────────────────────────────────

export interface PatientRecord {
  chief_complaint: string;
  history_of_present_illness: string;
  past_medical_history: string;
  medications: string[];
  allergies: string[];
  social_history: string;
  review_of_systems: string;
  additional_notes: string;
}

export interface TranscriptEntry {
  role: "user" | "model";
  text: string;
}

export interface RawEvent {
  ts: number;
  data: ServerMessage;
}
