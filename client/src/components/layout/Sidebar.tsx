import {
  CalendarDays,
  CheckSquare,
  Grid2X2,
  Home,
  Settings,
  Tags,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/schedules", label: "Schedules", icon: CheckSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/matrix", label: "Matrix", icon: Grid2X2 },
  { to: "/tags", label: "Tags", icon: Tags },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={cn("sidebar", open && "sidebar--open")}>
      <div className="sidebar__header">
        <div className="brand-mark" aria-hidden="true">
          S
        </div>
        <div>
          <strong>Schedule</strong>
          <span>Todo App</span>
        </div>
        <Button className="sidebar__close" variant="ghost" size="sm" onClick={onClose} aria-label="Close menu">
          <X aria-hidden="true" />
        </Button>
      </div>
      <nav className="sidebar__nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => cn("sidebar__link", isActive && "sidebar__link--active")}
            onClick={onClose}
          >
            <item.icon aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
