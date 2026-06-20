import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const Emergency: React.FC = () => {
  const navigate = useNavigate();

  // Simulate notifying the staff dashboard when this page loads
  useEffect(() => {
    console.log("🚨 EMERGENCY ALERT TRIGGERED! 🚨");
    console.log("Notifying staff immediately");
  }, []);

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
      {/* Keyframes for the Emergency Pulse 
        This uses a standard alert red/coral to stand out from your pastels
      */}
      <style>
        {`
          @keyframes emergencyPulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 0 40px rgba(255, 107, 107, 0); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); transform: scale(1); }
          }
          
          @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "4rem 2rem",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "550px",
          textAlign: "center",
          border: "4px solid #ff6b6b", // Urgent Red Border
          animation: "slideUpFade 0.4s ease-out",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Pulsing Alert Icon */}
        <div
          style={{
            width: "100px",
            height: "100px",
            backgroundColor: "#ff6b6b", // Alert Red
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--spacing-lg)",
            animation: "emergencyPulse 1.5s infinite",
          }}
        >
          {/* Medical Cross / Alert SVG */}
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              display="none"
            />{" "}
            {/* Placeholder override */}
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          </svg>
        </div>

        {/* Primary Messaging */}
        <h1
          className="font-heading"
          style={{
            color: "#ff6b6b",
            fontSize: "2.2rem",
            margin: "0 0 var(--spacing-sm) 0",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Staff Notified
        </h1>

        <h2
          className="font-body"
          style={{
            color: "var(--text-primary)",
            fontSize: "1.3rem",
            margin: "0 0 var(--spacing-md) 0",
            fontWeight: 500,
          }}
        >
          Please remain where you are. Help is on the way.
        </h2>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
            width: "100%",
          }}
        >
          {/* Cancel Button (In case of accidental click) */}
          <button
            onClick={() => navigate("/Consultation")}
            className="font-body"
            style={{
              padding: "var(--spacing-md)",
              backgroundColor: "transparent",
              color: "var(--text-secondary)",
              border: "2px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1.1rem",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-grey-200)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Cancel False Alarm
          </button>
        </div>
      </div>
    </div>
  );
};
