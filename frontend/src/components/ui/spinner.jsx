import React from "react";
import { cn } from "../../lib/utils";

const spinnerSizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const Spinner = ({ size = "md", className, ...props }) => {
  return (
    <div className="flex items-center justify-center" aria-label="Loading" role="status">
      <svg
        className={cn("animate-spin text-muted-foreground/30", spinnerSizes[size], className)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

const GlassSpinner = ({ size = "md", className, ...props }) => {
  return (
    <div 
      className="flex items-center justify-center p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10" 
      aria-label="Loading" 
      role="status"
    >
      <svg
        className={cn("animate-spin text-white", spinnerSizes[size], className)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export { Spinner, GlassSpinner }; 