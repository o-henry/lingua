import React from "react";
import { LearningStep, STEP_INFO } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StepperProps {
  steps: LearningStep[];
  currentStep: LearningStep;
  completedSteps: LearningStep[];
  onStepClick?: (step: LearningStep) => void;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep, completedSteps, onStepClick }) => {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((step, i) => {
        const info = STEP_INFO[step];
        const isActive = step === currentStep;
        const isCompleted = completedSteps.includes(step);

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => onStepClick?.(step)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-1 justify-center",
                isActive && "gradient-primary text-primary-foreground shadow-md",
                isCompleted && !isActive && "bg-primary/10 text-primary",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              <span>{info.icon}</span>
              <span className="hidden sm:inline">{info.label}</span>
              <span className="sm:hidden">{step}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 w-4 rounded", isCompleted ? "bg-primary" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default Stepper;
