import React from "react";

interface LearningStageDesktopProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

const LearningStageDesktop: React.FC<LearningStageDesktopProps> = ({ leftPanel, centerStage, rightPanel }) => {
  return (
    <div className="learning-focus-layout">
      <aside className="learning-focus-transcript">{leftPanel}</aside>
      <section className="learning-focus-main">{centerStage}</section>
      <section className="learning-focus-tools">{rightPanel}</section>
    </div>
  );
};

export default LearningStageDesktop;
