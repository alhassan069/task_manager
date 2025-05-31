import React from 'react';
import { cn } from '../../lib/utils';
import { Spinner, GlassSpinner } from './spinner';

const LoadingAnimation = ({ 
  fullPage = false, 
  message = 'Loading...', 
  glassmorphism = true, 
  size = 'md',
  className
}) => {
  const SpinnerComponent = glassmorphism ? GlassSpinner : Spinner;
  
  if (fullPage) {
    return (
      <div className={cn(
        "fixed inset-0 flex flex-col items-center justify-center z-50",
        glassmorphism && "bg-black/30 backdrop-blur-sm",
        className
      )}>
        <div className="flex flex-col items-center">
          <SpinnerComponent size={size} />
          {message && (
            <p className={cn(
              "mt-4 text-sm font-medium",
              glassmorphism ? "text-white" : "text-muted-foreground"
            )}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8",
      className
    )}>
      <SpinnerComponent size={size} />
      {message && (
        <p className={cn(
          "mt-2 text-sm font-medium",
          glassmorphism ? "text-white" : "text-muted-foreground"
        )}>
          {message}
        </p>
      )}
    </div>
  );
};

export { LoadingAnimation }; 