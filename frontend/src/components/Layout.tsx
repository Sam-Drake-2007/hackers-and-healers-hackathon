import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Add shared nav or shell here */}
      <Outlet />
    </div>
  );
}
