import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Simulated State for the AI Conversation
  const [subtitles, setSubtitles] = useState({
    previous: "",
    current: "Hello! I am your virtual clinic assistant.",
  });

  const [notes, setNotes] = useState<string[]>([
    "Intake initiated.",
    "Patient identity confirmed.",
  ]);
  const [isSpeaking, setIsSpeaking] = useState(true);

  // Auto-scroll notes to the bottom whenever a new note is added
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  // Simulated State for the AI Conversation
  useEffect(() => {
    const timer1 = setTimeout(() => {
      // Shift the current text to "previous" when new text arrives
      setSubtitles((prev) => ({
        previous: prev.current,
        current:
          "Can you tell me a little bit about why you are visiting the clinic today?",
      }));
      setNotes((prev) => [...prev, "Asked for primary reason for visit."]);
    }, 3000);

    const timer2 = setTimeout(() => {
      setIsSpeaking(false);
      setSubtitles((prev) => ({
        previous: prev.current,
        current: "Listening...",
      }));
    }, 6000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

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
          }}
        >
          {notes.map((note, index) => (
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
          <div ref={notesEndRef} /> {/* Invisible anchor to scroll to */}
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

          {/* The AI "Orb" */}
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
            {/* Simple microphone or sound wave icon inside the orb */}
            <img
              src="./public/logo-health.png"
              height="auto"
              width="300px"
              alt="AI Voice Assistant"
            />
          </div>
        </div>

        {/* =========================================
            3. UPDATED: Scrolling Subtitles Area
            ========================================= */}
        <div
          style={{
            padding: "0rem 4rem",
            textAlign: "center",
            minHeight: "250px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start" /* Pushes text to the bottom */,
            alignItems: "center",
            gap: "0.5rem" /* Space between old and new text */,
          }}
        >
          {/* Previous Subtitle (Faded, smaller, slightly higher up) */}
          <p
            className="font-body"
            style={{
              fontSize: "1.5rem",
              color: "var(--text-secondary)",
              opacity: subtitles.previous
                ? 0.6
                : 0 /* Hides it if there is no previous text */,
              margin: 0,
              transition: "all 0.4s ease",
            }}
          >
            {subtitles.previous}
          </p>

          {/* Current Subtitle (Large and dark) */}
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
            }}
          >
            {subtitles.current}
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

        {/* Action Button 1 */}
        <button
          className="font-body text-primary"
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
            (e.currentTarget.style.backgroundColor = "var(--color-pastel-blue)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--bg-main)")
          }
        >
          ⏸️ Pause Consultation
        </button>

        {/* Action Button 2 */}
        <button
          className="font-body text-primary"
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

        {/* Action Button 3 */}
        <button
          className="font-body"
          onClick={() => navigate("/Transfer")}
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
            marginTop: "auto", // Pushes this button to the bottom if needed
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
