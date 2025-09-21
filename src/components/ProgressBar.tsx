import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  currentStep: number;
  totalSteps: number;
  completedSteps?: number[];
  onStepClick?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  currentStep, 
  totalSteps, 
  completedSteps = [],
  onStepClick 
}) => {
  // Create array of steps (0-indexed)
  const steps = Array.from({ length: totalSteps }, (_, i) => i);
  
  return (
    <div className="flex items-center" style={{ height: '6px', gap: '3px' }}>
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(step);
        const isCurrent = step === currentStep;
        // const notStarted = !isCompleted && !isCurrent && step > currentStep;
        const isClickable = isCompleted || isCurrent;
        
        // MathAcademy-style colors
        let backgroundColor = '#e8e8e8'; // Light gray for not started
        if (isCompleted) {
          backgroundColor = '#4A90E2'; // Light blue for completed
        } else if (isCurrent) {
          backgroundColor = '#2E7CD6'; // Darker blue for current
        }
        
        return (
          <div
            key={step}
            onClick={() => isClickable && onStepClick && onStepClick(step)}
            className={`transition-all duration-200 ${
              index === 0 ? 'rounded-l' : ''
            } ${
              index === steps.length - 1 ? 'rounded-r' : ''
            } ${
              isClickable ? 'cursor-pointer hover:opacity-75' : ''
            }`}
            style={{
              width: `${100 / totalSteps}%`,
              height: '6px',
              backgroundColor,
              borderRadius: index === 0 ? '3px 0 0 3px' : index === steps.length - 1 ? '0 3px 3px 0' : '0'
            }}
          />
        );
      })}
    </div>
  );
};