import * as React from "react";
import { cn } from "../../lib/utils";

const FormField = React.forwardRef(({ name, render, ...props }, ref) => {
  return <div ref={ref} {...props}>{render?.()}</div>;
});
FormField.displayName = "FormField";

const FormItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props} />
));
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("mt-2", className)} {...props} />
));
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm font-medium text-destructive", className)}
    {...props}
  >
    {children}
  </p>
));
FormMessage.displayName = "FormMessage";

const Form = ({ className, children, onSubmit, ...props }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (onSubmit) onSubmit(e);
    }}
    className={cn("space-y-6", className)}
    {...props}
  >
    {children}
  </form>
);
Form.displayName = "Form";

const GlassForm = ({ className, children, onSubmit, ...props }) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      if (onSubmit) onSubmit(e);
    }}
    className={cn("space-y-6 bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10", className)}
    {...props}
  >
    {children}
  </form>
);
GlassForm.displayName = "GlassForm";

export {
  Form,
  FormField,
  GlassForm,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
}; 