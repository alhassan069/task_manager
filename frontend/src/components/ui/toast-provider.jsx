import React, { createContext, useState, useContext, useCallback } from "react";
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";

const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastContextProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(
    ({ title, description, variant = "default", action, id = Date.now().toString() }) => {
      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          description,
          variant,
          action,
        },
      ]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 5000);
    },
    []
  );

  const success = useCallback(
    (title, description) => {
      addToast({
        title,
        description,
        variant: "success",
      });
    },
    [addToast]
  );

  const error = useCallback(
    (title, description) => {
      addToast({
        title,
        description,
        variant: "destructive",
      });
    },
    [addToast]
  );

  const info = useCallback(
    (title, description) => {
      addToast({
        title,
        description,
        variant: "glass",
      });
    },
    [addToast]
  );

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success,
        error,
        info,
      }}
    >
      {children}
      <ToastProvider>
        {toasts.map(({ id, title, description, variant, action }) => (
          <Toast key={id} variant={variant}>
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
            {action && <ToastAction altText="Action">{action.text}</ToastAction>}
            <ToastClose onClick={() => dismissToast(id)} />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}; 