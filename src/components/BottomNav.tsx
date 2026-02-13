import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { House, Library, SlidersHorizontal, Clock3, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/home", icon: House, label: "홈" },
  { path: "/library", icon: Library, label: "라이브러리" },
  { path: "/resources", icon: Compass, label: "리소스" },
  { path: "/srs", icon: Clock3, label: "복습" },
  { path: "/settings", icon: SlidersHorizontal, label: "설정" },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 px-4 safe-area-bottom">
      <div className="mx-auto w-fit">
        <div className="flex items-center gap-2 rounded-full border border-border/80 bg-card/96 p-2 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.45)] backdrop-blur">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                type="button"
                className={cn(
                  "group relative flex h-14 w-14 items-center justify-center rounded-full transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_8px_18px_-12px_rgba(0,0,0,0.68)]"
                    : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-label={label}
              >
                <Icon className={cn("h-5 w-5", isActive && "stroke-[2.2]")} />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
