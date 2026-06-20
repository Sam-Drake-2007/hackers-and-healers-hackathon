import React from "react";
import { useLocation } from "react-router-dom";

export const Transfer: React.FC = () => {
  // Catch the state passed from the navigate() function on the previous page
  const location = useLocation();
  const patientName = location.state?.patientName || "there";

  return (
    <div
      style={{
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-md)",
      }}
    >
      {/* Inline style for a gentle pulsing animation */}
      <style>
        {`
          @keyframes calmPulse {
            0% { box-shadow: 0 0 0 0 rgba(196, 240, 237, 0.7); } /* Pastel Teal */
            70% { box-shadow: 0 0 0 30px rgba(196, 240, 237, 0); }
            100% { box-shadow: 0 0 0 0 rgba(196, 240, 237, 0); }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "4rem var(--spacing-lg)",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(42, 37, 38, 0.05)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Animated Calming Circle */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "var(--color-primary)", // Pastel Green
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--spacing-lg)",
            animation: "calmPulse 3s infinite",
          }}
        >
          {/* Simple SVG Checkmark */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-on-primary)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        {/* Text Content */}
        <h1
          className="font-heading"
          style={{
            color: "var(--text-primary)",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          Thank you, {patientName.split(" ")[0]}!
        </h1>

        <p
          className="font-body text-secondary"
          style={{ fontSize: "1.1rem", marginBottom: "var(--spacing-md)" }}
        >
          Our conversation has been documented and sent privately to your
          doctor. Your in-person appointment will begin shortly.
        </p>
      </div>
    </div>
  );
};
