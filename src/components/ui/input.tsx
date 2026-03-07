"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputSize = "md", ...props }, ref) => {
    const baseStyles = "flex w-full transition-all duration-200 ring-offset-[hsl(var(--background))] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
    
    const variants = {
      default: "rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-4 py-2 text-sm hover:border-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] focus:shadow-lg focus:shadow-[hsl(var(--primary))]/10",
      filled: "rounded-lg border-0 bg-[hsl(var(--muted))] px-4 py-2 text-sm hover:bg-[hsl(var(--muted))]/80 focus:bg-[hsl(var(--background))] focus:ring-2 focus:ring-[hsl(var(--ring))]",
      ghost: "rounded-lg border-0 bg-transparent px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]/50 focus:bg-[hsl(var(--background))] focus:ring-2 focus:ring-[hsl(var(--ring))]",
    };
    
    const sizes = {
      sm: "h-8 px-3 py-1 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-5 py-3 text-base",
    };
    
    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variants.default,
          sizes[inputSize],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
