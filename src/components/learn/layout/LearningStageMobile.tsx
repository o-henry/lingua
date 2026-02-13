import React from "react";

interface LearningStageMobileProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

const TABLET_QUERY = "(min-width: 768px) and (max-width: 1199px)";

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

const LearningStageMobile: React.FC<LearningStageMobileProps> = ({ leftPanel, centerStage, rightPanel }) => {
  const isTablet = useMediaQuery(TABLET_QUERY);

  if (isTablet) {
    return (
      <div className="learning-tablet-focus-grid px-4 py-4">
        <section className="learning-tablet-center">{centerStage}</section>
        <aside className="learning-tablet-left">{leftPanel}</aside>
        <section className="learning-tablet-tools">{rightPanel}</section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 pb-8">
      {centerStage}
      {leftPanel}
      {rightPanel}
    </div>
  );
};

export default LearningStageMobile;
