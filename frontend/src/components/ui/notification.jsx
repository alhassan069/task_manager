import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const variantMap = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    textColor: 'text-red-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    textColor: 'text-blue-400',
  },
};

const Notification = ({
  title,
  message,
  variant = 'success',
  duration = 5000,
  onClose,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { icon: Icon, bgColor, borderColor, textColor } = variantMap[variant] || variantMap.info;

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          if (onClose) onClose();
        }, 300); // Allow animation to complete before removing
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md transition-all duration-300 transform',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
        'backdrop-blur-lg border rounded-lg shadow-lg p-4',
        bgColor,
        borderColor,
        className
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', textColor)} />
        </div>
        <div className="ml-3 flex-1">
          {title && <h3 className={cn('text-sm font-medium', textColor)}>{title}</h3>}
          {message && <p className="mt-1 text-sm text-white/70">{message}</p>}
        </div>
        <button
          type="button"
          className="ml-4 inline-flex text-white/50 hover:text-white focus:outline-none"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export { Notification }; 