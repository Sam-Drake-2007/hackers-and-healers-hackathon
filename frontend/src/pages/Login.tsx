import React, { useState } from "react";

// Define the exact shape of our patient data
interface LoginFormData {
  fullName: string;
  birthday: string;
}

export const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    fullName: "",
    birthday: "",
  });

  // Type the input change event
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Type the form submission event
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here is where you will send the data to your Python backend
    console.log("Patient attempting login:", formData);
    alert(`Welcome, ${formData.fullName}! Initializing intake...`);
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
      }}
    >
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
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "var(--spacing-sm)",
          }}
        >
          <img src="src/assets/logo-health.png" height="auto" width="250px" />
        </div>
        {/* Clinic Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--spacing-lg)" }}>
          <h1
            className="font-heading"
            style={{
              color: "var(--text-primary)",
              margin: "var(--spacing-sm)",
            }}
          >
            Welcome to our Clinic!
          </h1>
          <p className="font-body text-secondary" style={{ margin: 0 }}>
            Please enter your details to begin check-in.
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-md)",
          }}
        >
          {/* Full Name Input */}
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

          {/* Birthday Input */}
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

          {/* Submit Button */}
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
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor =
                "var(--color-primary-hover)")
            }
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) =>
              (e.currentTarget.style.backgroundColor = "var(--color-primary)")
            }
          >
            Check in
          </button>
        </form>
      </div>
    </div>
  );
};
