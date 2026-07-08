import { Menu, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import type { User } from "../../types/domain";
import { Button } from "../ui/Button";

export function Topbar({ user, onMenu }: { user?: User | null; onMenu: () => void }) {
  return (
    <header className="topbar">
      <Button className="topbar__menu" variant="ghost" size="sm" onClick={onMenu} aria-label="打开菜单">
        <Menu aria-hidden="true" />
      </Button>
      <div>
        <span className="topbar__eyebrow">工作区</span>
        <strong>{user?.username ?? "日程待办"}</strong>
      </div>
      <Link className="button button--primary button--sm topbar__new" to="/schedules/new">
        <Plus aria-hidden="true" />
        新建日程
      </Link>
    </header>
  );
}
