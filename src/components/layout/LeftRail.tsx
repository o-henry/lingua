import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Library, House, Clock3, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", path: "/home", icon: House, label: "홈" },
  { key: "learn", path: "/library", icon: Library, label: "학습" },
  { key: "review", path: "/srs", icon: Clock3, label: "복습" },
  { key: "settings", path: "/settings", icon: SlidersHorizontal, label: "설정" },
] as const;

const isActivePath = (pathname: string, key: string) => {
  if (key === "learn") {
    return pathname.startsWith("/library") || pathname.startsWith("/learn");
  }

  if (key === "settings") {
    return pathname.startsWith("/settings");
  }

  return pathname.startsWith(`/${key === "review" ? "srs" : key}`);
};

const LeftRail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="learning-left-rail" aria-label="데스크탑 네비게이션">
      <div className="learning-left-rail-inner">
        {NAV_ITEMS.map(({ key, path, icon: Icon, label }) => {
          const active = isActivePath(location.pathname, key);
          return (
            <button
              key={path}
              type="button"
              aria-label={label}
              onClick={() => navigate(path)}
              className={cn(
                "learning-left-rail-button",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_8px_16px_-10px_rgba(0,0,0,0.64)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="learning-left-rail-label">{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default LeftRail;
