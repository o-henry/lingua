import React from "react";

interface LearningStageMobileProps {
  leftPanel: React.ReactNode;
  centerStage: React.ReactNode;
  rightPanel: React.ReactNode;
}

const LearningStageMobile: React.FC<LearningStageMobileProps> = ({ leftPanel, centerStage, rightPanel }) => {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-4 pb-8">
      {centerStage}
      {leftPanel}
      {rightPanel}
    </div>
  );
};

export default LearningStageMobile;
