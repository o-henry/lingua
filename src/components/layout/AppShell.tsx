import React from "react";
import BottomNav from "@/components/BottomNav";
import LeftRail from "@/components/layout/LeftRail";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  titleClassName?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showBottomNav?: boolean;
  showDesktopRail?: boolean;
  className?: string;
}

const DESKTOP_QUERY = "(min-width: 1200px)";
const MOBILE_QUERY = "(max-width: 767px)";

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
};

const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  titleClassName,
  showBack,
  onBack,
  rightAction,
  showBottomNav = false,
  showDesktopRail = true,
  className,
}) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const isMobile = useMediaQuery(MOBILE_QUERY);

  const header = (title || showBack || rightAction) && (
    <header className="z-40 border-b border-border/70 bg-background">
      <div className={cn("learning-header", isDesktop ? "px-6" : "px-4")}>
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack}
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="뒤로 가기"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.5 15 7.5 10l5-5" />
              </svg>
            </button>
          )}
          {title && <h1 className={cn("text-[20px] leading-[28px] font-medium text-foreground font-ko-bold", titleClassName)}>{title}</h1>}
        </div>
        {rightAction}
      </div>
    </header>
  );

  if (isDesktop) {
    return (
      <div className={cn("holo-view min-h-screen bg-background", className)}>
        <div className={cn(showDesktopRail ? "learning-shell-desktop" : "min-h-screen")}>
          {showDesktopRail && <LeftRail />}
          <div className="min-w-0">
            {header}
            <main className="px-6 py-4">{children}</main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("holo-view min-h-screen bg-background", showBottomNav && isMobile ? "pb-28" : "", className)}>
      {header}
      <main>{children}</main>
      {showBottomNav && isMobile && <BottomNav />}
    </div>
  );
};

export default AppShell;
