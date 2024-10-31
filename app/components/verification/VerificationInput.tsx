"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface VerificationInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function VerificationInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  className,
}: VerificationInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Update individual inputs when value changes externally
    const chars = value.split("");
    setValues(Array(length).fill("").map((_, i) => chars[i] || ""));
  }, [value, length]);

  const focusNext = (index: number) => {
    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const focusPrev = (index: number) => {
    if (index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newChar = e.target.value.slice(-1);
    if (!/^\d*$/.test(newChar)) return; // Only allow digits

    const newValues = [...values];
    newValues[index] = newChar;
    setValues(newValues);
    onChange(newValues.join(""));

    if (newChar) {
      focusNext(index);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!values[index]) {
        focusPrev(index);
      }
    } else if (e.key === "ArrowLeft") {
      focusPrev(index);
    } else if (e.key === "ArrowRight") {
      focusNext(index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    if (!/^\d*$/.test(pastedData)) return; // Only allow digits

    const newValues = Array(length).fill("");
    pastedData.split("").forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
    onChange(newValues.join(""));
    inputs.current[Math.min(pastedData.length, length - 1)]?.focus();
  };

  return (
    <div 
      className={cn(
        "flex gap-2 items-center justify-center",
        className
      )}
    >
      {Array(length).fill(0).map((_, index) => (
        <Input
          key={index}
          ref={el => inputs.current[index] = el}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={values[index]}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            "w-12 h-12 text-center text-2xl font-mono",
            "focus:ring-2 focus:ring-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
      ))}
    </div>
  );
}