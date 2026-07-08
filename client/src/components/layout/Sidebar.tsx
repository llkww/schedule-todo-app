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
  { to: "/", label: "仪表盘", icon: Home },
  { to: "/schedules", label: "日程", icon: CheckSquare },
  { to: "/calendar", label: "日历", icon: CalendarDays },
  { to: "/matrix", label: "四象限", icon: Grid2X2 },
  { to: "/tags", label: "标签", icon: Tags },
  { to: "/settings", label: "设置", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <aside className={cn("sidebar", open && "sidebar--open")}>
      <div className="sidebar__header">
        <div className="brand-mark" aria-hidden="true">
          日
        </div>
        <div>
          <strong>日程</strong>
          <span>待办</span>
        </div>
        <Button className="sidebar__close" variant="ghost" size="sm" onClick={onClose} aria-label="关闭菜单">
          <X aria-hidden="true" />
        </Button>
      </div>
      <nav className="sidebar__nav" aria-label="主导航">
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
