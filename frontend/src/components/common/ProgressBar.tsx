import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  large?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercentage = true,
  large = false,
  className = ''
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`progress ${className}`}>
      {(label || showPercentage) && (
        <div className="progress-header">
          <span>{label || 'Progress'}</span>
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={large ? 'progress-bar-large' : 'progress-bar'}>
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;