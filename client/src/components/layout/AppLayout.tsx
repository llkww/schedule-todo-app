import { useState } from "react";
import { Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen ? <button className="layout-scrim" onClick={() => setMenuOpen(false)} aria-label="Close menu" /> : null}
      <div className="app-layout__main">
        <Topbar user={user} onMenu={() => setMenuOpen(true)} />
        <main className="content-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
