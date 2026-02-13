import React from "react";
import BottomNav from "@/components/BottomNav";
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
  void showDesktopRail;

  const header = (title || showBack || rightAction) && (
    <header className="z-40 border-b border-border/70 bg-background">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-4">
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

  return (
    <div className={cn("holo-view min-h-screen bg-background", showBottomNav ? "pb-28" : "", className)}>
      {header}
      <main className="mx-auto w-full max-w-md">{children}</main>
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default AppShell;
