import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BookOpen, Settings, Layers, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/home", icon: Home, label: "홈" },
  { path: "/library", icon: BookOpen, label: "라이브러리" },
  { path: "/resources", icon: Sparkles, label: "리소스" },
  { path: "/srs", icon: Layers, label: "복습" },
  { path: "/settings", icon: Settings, label: "설정" },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-50 px-3 safe-area-bottom">
      <div className="mx-auto w-fit rounded-full bg-secondary/95 p-2 backdrop-blur-xl shadow-[0_12px_26px_-12px_rgba(15,23,42,0.55)]">
        <div className="flex items-center gap-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                type="button"
                className={cn(
                  "group relative flex h-14 w-14 flex-col items-center justify-center rounded-full transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-10px_rgba(15,23,42,0.8)]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
                aria-label={label}
              >
                <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
