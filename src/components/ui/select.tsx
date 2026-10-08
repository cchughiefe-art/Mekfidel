"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, placeholder, ...props }, ref) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : props["aria-describedby"]
          }
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-gray-900",
            "focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500",
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="text-sm text-red-500 mt-1"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
