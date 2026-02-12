import React from "react";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  noPadding?: boolean;
  noBottomNav?: boolean;
}

const PageShell: React.FC<PageShellProps> = ({
  children,
  title,
  showBack,
  onBack,
  rightAction,
  noPadding,
  noBottomNav,
}) => {
  return (
    <div className={`min-h-screen bg-background ${noBottomNav ? "" : "pb-28"}`}>
      {(title || showBack || rightAction) && (
        <header className="sticky top-0 z-40 glass border-b">
          <div className="flex items-center justify-between h-14 px-4 max-w-md mx-auto">
            <div className="flex items-center gap-2">
              {showBack && (
                <button onClick={onBack} className="p-1 -ml-1 text-muted-foreground hover:text-foreground">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              )}
              {title && <h1 className="text-lg font-bold">{title}</h1>}
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
