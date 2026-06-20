import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveSession } from "../live/useLiveSession"; // Adjust this import path as needed

export const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Initialize the live session
  const { state, start, endSession, togglePause, triggerEmergency, dismissEmergency } =
    useLiveSession({
      onComplete: (record) => {
        // Automatically transition to the next page when the backend fires "session_complete"
        // You can pass the record through route state if needed
        navigate("/Transfer", { state: { record } });
      },
    });

  const {
    status,
    currentModelSubtitle,
    currentUserSubtitle,
    notes,
    isSpeaking,
    paused,
    emergencyAlert,
    error,
  } = state;

  // Format the raw multiline notes string from the backend into an array for the UI
  const displayNotes = notes
    ? notes.split("\n").filter((n) => n.trim() !== "")
    : ["Intake initiated. Waiting for live transcript..."];

  // Auto-scroll notes to the bottom whenever a new note is appended
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayNotes]);

  // AudioContext requires a user gesture to start. If we aren't connected yet,
  // we must show an explicit start button.
  if (status === "idle" || status === "connecting") {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          backgroundColor: "var(--bg-main)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <button
          onClick={start}
          disabled={status === "connecting"}
          className="font-heading"
          style={{
            padding: "var(--spacing-lg) 3rem",
            backgroundColor: "var(--color-pastel-mint)",
            color: "var(--text-on-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: status === "connecting" ? "wait" : "pointer",
            fontWeight: 700,
            fontSize: "1.5rem",
            transition: "background-color 0.2s ease",
            opacity: status === "connecting" ? 0.7 : 1,
          }}
        >
          {status === "connecting"
            ? "Connecting to Clinic..."
            : "Start Consultation"}
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "var(--bg-main)",
        overflow: "hidden",
      }}
    >
      {/* =========================================
          LEFT COLUMN: Live Clinical Notes
          ========================================= */}
      <div
        style={{
          width: "320px",
          backgroundColor: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          padding: "var(--spacing-md)",
        }}
      >
        <h2
          className="font-heading"
          style={{ fontSize: "1.2rem", color: "var(--color-secondary)" }}
        >
          Consultation Notes
        </h2>

        {/* Scrollable Notes Area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            marginTop: "1rem",
          }}
        >
          {displayNotes.map((note, index) => (
            <div
              key={index}
              style={{
                padding: "var(--spacing-sm)",
                backgroundColor: "var(--bg-main)",
                borderRadius: "var(--radius-md)",
                borderLeft: "3px solid var(--color-pastel-teal)",
                fontSize: "1rem",
              }}
              className="font-body text-primary"
            >
              {note}
            </div>
          ))}
          <div ref={notesEndRef} />
        </div>
      </div>

      {/* =========================================
          CENTER COLUMN: AI Visualization & Subtitles
          ========================================= */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Privacy / Security Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "var(--spacing-lg)",
            position: "absolute",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div
            className="font-body"
            style={{
              backgroundColor: "var(--color-grey-200)",
              color: "var(--text-secondary)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              borderRadius: "var(--radius-full)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>
              <strong>Privacy Notice:</strong> The AI will never ask for any
              identification, and your credentials are redacted from medical
              info shared with the AI.
            </span>
          </div>
        </div>

        {/* Error Banner Overlay (e.g. email delivery failures) */}
        {error && (
          <div
            className="font-body"
            style={{
              position: "absolute",
              top: "var(--spacing-md)",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--color-red)",
              color: "white",
              padding: "var(--spacing-sm) var(--spacing-md)",
              borderRadius: "var(--radius-md)",
              zIndex: 30,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              maxWidth: "90%",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {/* Emergency Alert Banner Overlay */}
        {emergencyAlert && (
          <div
            style={{
              position: "absolute",
              top: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--color-red)",
              color: "white",
              padding: "1rem 2rem",
              borderRadius: "var(--radius-md)",
              zIndex: 20,
              boxShadow: "0 4px 12px rgba(255, 0, 0, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>🚨</span>
            <div>
              <div style={{ fontWeight: "bold", textTransform: "uppercase" }}>
                Emergency Alert - {emergencyAlert.severity}
              </div>
              <div>{emergencyAlert.reason}</div>
            </div>
            <button
              onClick={dismissEmergency}
              aria-label="Dismiss emergency alert"
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: "1.5rem",
                cursor: "pointer",
                lineHeight: 1,
                padding: "0 0.25rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* AI Voice Visualizer (Centered) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <style>
            {`
              @keyframes aiSpeak {
                0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 237, 246, 0.6); }
                50% { transform: scale(1.05); box-shadow: 0 0 0 40px rgba(212, 237, 246, 0); }
                100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 237, 246, 0); }
              }
            `}
          </style>

          <div
            style={{
              width: "250px",
              height: "250px",
              backgroundColor: isSpeaking
                ? "var(--color-pastel-blue)"
                : "var(--color-grey-200)",
              borderRadius: "var(--radius-full)",
              animation: isSpeaking
                ? "aiSpeak 2s infinite ease-in-out"
                : "none",
              transition: "background-color 0.5s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "4px solid var(--bg-surface)",
              boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            <img
              src="/logo-health.png"
              height="auto"
              width="300px"
              alt="AI Voice Assistant"
            />
          </div>
        </div>

        {/* =========================================
            Scrolling Subtitles Area
            ========================================= */}
        <div
          style={{
            padding: "0rem 4rem 2rem 4rem",
            textAlign: "center",
            minHeight: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end", // Push text to the bottom
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {/* User Subtitle (Faded, smaller, slightly higher up) */}
          <p
            className="font-body"
            style={{
              fontSize: "1.2rem",
              color: "var(--text-secondary)",
              opacity: currentUserSubtitle ? 0.8 : 0,
              margin: 0,
              transition: "all 0.4s ease",
            }}
          >
            {currentUserSubtitle || "..."}
          </p>

          {/* Model Subtitle (Large and dark) */}
          <p
            className="font-body"
            style={{
              fontSize: "1.5rem",
              color: isSpeaking
                ? "var(--text-primary)"
                : "var(--text-secondary)",
              fontWeight: 600,
              margin: 0,
              transition: "color 0.8s ease",
              minHeight: "2.5rem",
            }}
          >
            {currentModelSubtitle || (isSpeaking ? "" : "Listening...")}
          </p>
        </div>
      </div>

      {/* =========================================
          RIGHT COLUMN: Quick Actions
          ========================================= */}
      <div
        style={{
          width: "280px",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-subtle)",
          padding: "var(--spacing-md)",
          display: "flex",
          fontSize: "1.2rem",
          flexDirection: "column",
          justifyContent: "center",
          gap: "var(--spacing-md)",
        }}
      >
        <h3
          className="font-heading"
          style={{
            color: "var(--color-secondary)",
            textAlign: "center",
            marginBottom: "var(--spacing-md)",
          }}
        >
          Quick Actions
        </h3>

        {/* Action Button 1 — Pause / Resume the live session */}
        <button
          className="font-body text-primary"
          onClick={togglePause}
          style={{
            padding: "var(--spacing-md)",
            backgroundColor: paused
              ? "var(--color-pastel-blue)"
              : "var(--bg-main)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-pastel-blue)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = paused
              ? "var(--color-pastel-blue)"
              : "var(--bg-main)")
          }
        >
          {paused ? "▶️ Resume Consultation" : "⏸️ Pause Consultation"}
        </button>

        {/* Action Button 2 — Manually raise the emergency banner */}
        <button
          className="font-body text-primary"
          onClick={() =>
            triggerEmergency(
              "Emergency flagged manually during consultation — clinician attention required.",
            )
          }
          style={{
            padding: "var(--spacing-md)",
            backgroundColor: "var(--bg-main)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-red)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-main)")
          }
        >
          🆘 Emergency Alert
        </button>

        {/* Action Button 3 - Now tied to the actual session ending */}
        <button
          className="font-body"
          onClick={() => {
            endSession(); // Fire the websocket termination
            navigate("/Transfer"); // Manually navigate if they click early
          }}
          style={{
            padding: "var(--spacing-md)",
            backgroundColor: "var(--color-pastel-mint)",
            color: "var(--text-on-primary)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "1.3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "auto",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--color-primary-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-primary)")
          }
        >
          Finish Consultation
        </button>
      </div>
    </div>
  );
};
