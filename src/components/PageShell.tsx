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
  showBack,
  onBack,
  rightAction,
  noPadding,
  noBottomNav,
}) => {
  const contentPaddingX = noPadding ? "" : "px-4";

  return (
    <div className={`holo-view min-h-screen bg-background px-3 ${noBottomNav ? "pt-3 pb-4" : "pt-20 pb-6"}`}>
      <div className="app-screen mx-auto flex min-h-[calc(100vh-1.75rem)] w-full max-w-md flex-col overflow-hidden">
        {(showBack || rightAction) && (
          <div className={`z-40 ${contentPaddingX} pt-3`}>
            <div className="flex h-10 w-full items-center justify-between">
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
              </div>
              {rightAction}
            </div>
          </div>
        )}
        <main className={noPadding ? "flex-1" : `flex-1 ${contentPaddingX} py-4`}>{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
