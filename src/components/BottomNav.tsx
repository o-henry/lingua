import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import homeIcon from "@/assets/nav-icons/home.svg";
import libraryIcon from "@/assets/nav-icons/library.svg";
import resourcesIcon from "@/assets/nav-icons/resources.svg";
import srsIcon from "@/assets/nav-icons/srs.svg";
import settingsIcon from "@/assets/nav-icons/settings.svg";

const NAV_ITEMS = [
  { path: "/home", iconSrc: homeIcon, label: "홈" },
  { path: "/library", iconSrc: libraryIcon, label: "라이브러리" },
  { path: "/resources", iconSrc: resourcesIcon, label: "리소스" },
  { path: "/srs", iconSrc: srsIcon, label: "복습" },
  { path: "/settings", iconSrc: settingsIcon, label: "설정" },
];

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed inset-x-0 z-50"
      style={{ top: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
    >
      <div className="mx-auto w-full max-w-md px-3">
        <div className="grid grid-cols-5 items-center gap-1 rounded-[8px] border border-border/80 bg-card/96 p-1.5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.45)] backdrop-blur">
          {NAV_ITEMS.map(({ path, iconSrc, label }) => {
            const isActive = location.pathname.startsWith(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                type="button"
                className={cn(
                  "group relative flex h-11 w-full items-center justify-center rounded-[6px] transition-all",
                  isActive
                    ? "bg-secondary shadow-[0_8px_18px_-12px_rgba(0,0,0,0.42)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                aria-label={label}
              >
                <img
                  src={iconSrc}
                  alt=""
                  aria-hidden="true"
                  className={cn("h-[18px] w-[18px] brightness-0 transition-opacity", isActive ? "opacity-100" : "opacity-65 group-hover:opacity-85")}
                />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
