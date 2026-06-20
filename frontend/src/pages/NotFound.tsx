import React from "react";
import { useNavigate } from "react-router-dom";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

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
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "3rem var(--spacing-lg)",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
          boxShadow: "0 4px 6px rgba(42, 37, 38, 0.05)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Soft Pastel Icon Background */}
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "var(--color-pastel-blue)",
            borderRadius: "var(--radius-full)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--spacing-md)",
          }}
        >
          {/* Gentle Search/Question Icon */}
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <path d="M11 8v.01"></path>
            <path d="M11 12a1 1 0 0 1-1-1"></path>
          </svg>
        </div>

        {/* 404 Text */}
        <h1
          className="font-heading"
          style={{
            color: "var(--text-primary)",
            fontSize: "2rem",
            margin: "0 0 var(--spacing-sm) 0",
          }}
        >
          404
        </h1>
        <h2
          className="font-heading"
          style={{
            color: "var(--text-primary)",
            fontSize: "1.2rem",
            margin: "0 0 var(--spacing-sm) 0",
          }}
        >
          Page Not Found
        </h2>
        <p
          className="font-body text-secondary"
          style={{ margin: "0 0 var(--spacing-lg) 0", lineHeight: "1.5" }}
        >
          It looks like the page you are looking for has been moved or doesn't
          exist.
        </p>

        {/* Return Home Button */}
        <button
          onClick={() => navigate("/")} // Assumes your login page is at the root '/'
          className="font-body bg-primary"
          style={{
            padding: "var(--spacing-md) var(--spacing-lg)",
            color: "var(--text-on-primary)",
            fontWeight: 700,
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
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
          {/* Home Arrow SVG */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Login
        </button>
      </div>
    </div>
  );
};
