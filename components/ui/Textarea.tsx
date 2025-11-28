import * as React from "react";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <motion.textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(props as any)}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

