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
      <div className="mx-auto max-w-sm rounded-full border border-border/60 bg-card/92 backdrop-blur-xl shadow-[0_12px_28px_-10px_rgba(0,0,0,0.35)]">
        <div className="grid grid-cols-5 gap-1 p-2">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                type="button"
                className={cn(
                  "group relative flex w-12 h-12 flex-col items-center justify-center rounded-full transition-all",
                  isActive ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                aria-label={label}
              >
                <Icon className={cn("w-4 h-4", isActive && "stroke-[2.5]")} />
                {/* <span className={cn("mt-0.5 text-[9px] font-medium leading-none", isActive ? "opacity-95" : "opacity-80")}>{label}</span> */}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
