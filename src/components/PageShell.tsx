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
    <div className={`holo-view min-h-screen bg-background px-3 pt-3 ${noBottomNav ? "pb-4" : "pb-24"}`}>
      <div className="app-screen mx-auto flex min-h-[calc(100vh-1.75rem)] w-full max-w-md flex-col overflow-hidden">
      {(title || showBack || rightAction) && (
        <header className="z-40 bg-transparent">
          <div className="mx-auto flex h-14 w-full items-center justify-between px-4">
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
          <div className="px-4 pb-2">
            <div className="app-header-divider" />
          </div>
        </header>
      )}
      <main className={noPadding ? "flex-1" : "flex-1 px-4 py-4"}>{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
