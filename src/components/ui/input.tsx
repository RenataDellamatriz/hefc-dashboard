import * as React from "react";
import { InputMask, Replacement } from "@react-input/mask";
import { cn } from "@/lib/utils";


export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: string;
  replacement?: Replacement;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, mask, replacement, ...props }, ref) => {
    if (mask) {
      return (
        <InputMask
          mask={mask}
          replacement={replacement}
          className={cn(
            "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      );
    } else {
      return (
        <input
          type={type}
          className={cn(
            "flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray disabled:cursor-not-allowed disabled:opacity-80",
            className
          )}
          ref={ref}
          {...props}
        />
      );
    }
  }
);
Input.displayName = "Input";

export { Input };
