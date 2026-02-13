import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  titleClassName?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  noPadding?: boolean;
  noBottomNav?: boolean;
}

const PageShell: React.FC<PageShellProps> = ({
  children,
  title,
  titleClassName,
  showBack,
  onBack,
  rightAction,
  noPadding,
  noBottomNav,
}) => {
  return (
    <div className={`holo-view min-h-screen bg-background ${noBottomNav ? "" : "pb-20"}`}>
      {(title || showBack || rightAction) && (
        <header className="z-40 border-b border-border/70 bg-background">
          <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              {showBack && (
                <button
                  onClick={onBack}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              {title && <h1 className={`text-lg font-medium text-foreground font-ko-bold ${titleClassName ?? ""}`}>{title}</h1>}
            </div>
            {rightAction}
          </div>
        </header>
      )}
      <main className={noPadding ? "" : "px-4 py-4 max-w-md mx-auto"}>{children}</main>
    </div>
  );
};

export default PageShell;
