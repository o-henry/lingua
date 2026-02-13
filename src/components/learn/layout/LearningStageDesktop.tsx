import React from "react";

interface LearningStageDesktopProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

const LearningStageDesktop: React.FC<LearningStageDesktopProps> = ({ leftPanel, centerStage, rightPanel }) => {
  return (
    <div className="learning-desktop-grid">
      <aside className="learning-panel-scroll">{leftPanel}</aside>
      <section className="learning-center-column">
        <div className="learning-center-inner">{centerStage}</div>
      </section>
      <aside className="learning-panel-scroll">{rightPanel}</aside>
    </div>
  );
};

export default LearningStageDesktop;
