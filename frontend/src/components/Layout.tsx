import { Outlet } from "react-router-dom";
import { LiveSessionProvider } from "../live/LiveSessionContext";

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Shared live session — persists across route changes (consultation ↔ emergency). */}
      <LiveSessionProvider>
        <Outlet />
      </LiveSessionProvider>
    </div>
  );
}
