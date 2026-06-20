import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Define the exact shape of our patient data
interface LoginFormData {
  fullName: string;
  birthday: string;
}

export const Login: React.FC = () => {
  // 1. Existing Login State
  const [formData, setFormData] = useState<LoginFormData>({
    fullName: "",
    birthday: "",
  });

  // 2. NEW: State to control the Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");

  const navigate = useNavigate();

  // Handle main form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle main form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Patient attempting login:", formData);
    navigate("/Consultation");
  };

  // 3. NEW: Handle the Admin Email Submission
  const handleAdminSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Admin email submitted:", adminEmail);
    alert(`Invite sent to: ${adminEmail}`);
    setIsSettingsOpen(false); // Close the modal after submitting
    setAdminEmail(""); // Clear the input
  };

  return (
    /* Main Background */
    <div
      className="login-container"
      style={{
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--spacing-md)",
        position: "relative",
      }}
    >
      {/* =========================================
          Settings Button (Top Right Corner)
          ========================================= */}
      <button
        onClick={() => setIsSettingsOpen(true)} // Open the modal on click!
        style={{
          position: "absolute",
          top: "var(--spacing-md)",
          right: "var(--spacing-md)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--text-secondary)",
          padding: "var(--spacing-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.2s ease, transform 0.2s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.color = "var(--text-primary)";
          e.currentTarget.style.transform = "rotate(30deg)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.color = "var(--text-secondary)";
          e.currentTarget.style.transform = "rotate(0deg)";
        }}
        aria-label="Settings"
      >
        {/* Simple SVG Gear Icon */}
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>

      {/* =========================================
          The Centered Login Card
          ========================================= */}
      <div
        className="login-card"
        style={{
          backgroundColor: "var(--bg-surface)",
          padding: "var(--spacing-lg)",
          borderRadius: "var(--radius-md)",
          width: "100%",
          maxWidth: "400px",
          boxShadow: "0 4px 6px rgba(42, 37, 38, 0.05)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          <img
            src="src/assets/logo-health.png"
            height="auto"
            width="250px"
            alt="Clinic Logo"
          />
        </div>

        <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
          <h1
            className="font-heading"
            style={{
              color: "var(--text-primary)",
              margin: "var(--spacing-sm)",
              fontSize: "1.2rem",
            }}
          >
            Welcome to our Clinic!
          </h1>
          <p className="font-body text-secondary" style={{ margin: 0 }}>
            Please enter your details to begin check-in.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
          }}
        >
          {/* Full Name */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
            }}
          >
            <label
              htmlFor="fullName"
              className="font-body text-primary"
              style={{ fontWeight: 600 }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Jane Doe"
              required
              className="font-body"
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
                outlineColor: "var(--border-focus)",
              }}
            />
          </div>

          {/* Birthday */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-sm)",
            }}
          >
            <label
              htmlFor="birthday"
              className="font-body text-primary"
              style={{ fontWeight: 600 }}
            >
              Date of Birth
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              required
              className="font-body"
              style={{
                padding: "var(--spacing-sm) var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-primary)",
                outlineColor: "var(--border-focus)",
              }}
            />
          </div>

          <button
            type="submit"
            className="font-body bg-primary"
            style={{
              marginTop: "var(--spacing-sm)",
              padding: "var(--spacing-md)",
              color: "var(--text-on-primary)",
              fontWeight: 700,
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
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
            Check in
          </button>
        </form>
      </div>

      {/* =========================================
          4. NEW: The Settings Modal (Email Input)
          ========================================= */}
      {isSettingsOpen && (
        <div
          style={{
            position: "fixed", // Covers the whole screen
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(42, 37, 38, 0.4)", // Semi-transparent dark overlay
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000, // Guarantees it sits on top of everything
            padding: "var(--spacing-md)",
          }}
          // If they click the dark background, it closes the modal
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsOpen(false);
          }}
        >
          {/* The Modal Box */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              padding: "var(--spacing-lg)",
              borderRadius: "var(--radius-md)",
              width: "100%",
              maxWidth: "350px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              animation: "fadeInUp 0.2s ease-out",
            }}
          >
            <style>
              {`
                @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>

            <h3
              className="font-heading"
              style={{
                color: "var(--text-primary)",
                margin: "0 0 var(--spacing-sm) 0",
              }}
            >
              Email Info Sender
            </h3>
            <p
              className="font-body text-secondary"
              style={{
                fontSize: "0.9rem",
                marginBottom: "var(--spacing-md)",
                marginTop: 0,
              }}
            >
              Enter an email address to be sent to the doctor. *For
              demonstration purposes only*
            </p>

            <form
              onSubmit={handleAdminSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-sm)",
              }}
            >
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="bobthedoc@gmail.com"
                required
                className="font-body"
                style={{
                  padding: "var(--spacing-sm) var(--spacing-md)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  backgroundColor: "var(--bg-main)",
                  color: "var(--text-primary)",
                  outlineColor: "var(--border-focus)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  gap: "var(--spacing-sm)",
                  marginTop: "var(--spacing-sm)",
                }}
              >
                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="font-body"
                  style={{
                    flex: 1,
                    padding: "var(--spacing-sm)",
                    backgroundColor: "var(--color-grey-200)",
                    color: "var(--text-primary)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                {/* Submit Email Button */}
                <button
                  type="submit"
                  className="font-body bg-primary"
                  style={{
                    flex: 1,
                    padding: "var(--spacing-sm)",
                    color: "var(--text-on-primary)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Submit Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
