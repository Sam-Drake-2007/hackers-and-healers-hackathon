import { createContext, useContext, useEffect } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveSession } from "./useLiveSession";

type LiveSession = ReturnType<typeof useLiveSession>;

const LiveSessionContext = createContext<LiveSession | null>(null);

/**
 * Owns the live session above the route tree so it survives navigation between
 * the consultation and emergency pages — without this, routing to /emergency
 * would unmount the consultation and tear down the WebSocket, making it
 * impossible to pause and come back.
 */
export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const session = useLiveSession({
    onComplete: (record) => navigate("/transfer", { state: { record } }),
  });

  // Route to the emergency page whenever an alert is raised (model or manual).
  const { emergencyAlert } = session.state;
  useEffect(() => {
    if (emergencyAlert) navigate("/emergency");
  }, [emergencyAlert, navigate]);

  return (
    <LiveSessionContext.Provider value={session}>
      {children}
    </LiveSessionContext.Provider>
  );
}

export function useLiveSessionContext(): LiveSession {
  const ctx = useContext(LiveSessionContext);
  if (!ctx) {
    throw new Error(
      "useLiveSessionContext must be used within a LiveSessionProvider",
    );
  }
  return ctx;
}
