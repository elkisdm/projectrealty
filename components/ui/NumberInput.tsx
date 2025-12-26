"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  "aria-label"?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  placeholder = "",
  min,
  max,
  step = 100000,
  className = "",
  "aria-label": ariaLabel,
  disabled = false,
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isHoveringUp, setIsHoveringUp] = useState(false);
  const [isHoveringDown, setIsHoveringDown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleIncrement = () => {
    if (disabled) return;
    const currentValue = value ?? 0;
    const newValue = currentValue + step;
    const finalValue = max !== undefined ? Math.min(newValue, max) : newValue;
    onChange(finalValue);
    
    // Pequeña animación de feedback
    if (inputRef.current && !prefersReducedMotion) {
      inputRef.current.focus();
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    const currentValue = value ?? 0;
    const newValue = currentValue - step;
    const finalValue = min !== undefined ? Math.max(newValue, min) : newValue;
    onChange(finalValue >= 0 ? finalValue : null);
    
    // Pequeña animación de feedback
    if (inputRef.current && !prefersReducedMotion) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === "") {
      onChange(null);
      return;
    }
    const numValue = Number(inputValue);
    if (!isNaN(numValue)) {
      let finalValue = numValue;
      if (min !== undefined) finalValue = Math.max(finalValue, min);
      if (max !== undefined) finalValue = Math.min(finalValue, max);
      onChange(finalValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const canIncrement = max === undefined || (value ?? 0) < max;
  const canDecrement = min === undefined || (value ?? 0) > min;

  return (
    <div className={`relative ${className}`}>
      <motion.input
        ref={inputRef}
        type="number"
        value={value ?? ""}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={ariaLabel}
        className="ui-input pr-9 text-right"
        whileFocus={prefersReducedMotion ? {} : { scale: 1.02 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
      
      {/* Spinner Controls */}
      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col h-[calc(100%-8px)] w-7">
        {/* Increment Button */}
        <motion.button
          type="button"
          onClick={handleIncrement}
          disabled={disabled || !canIncrement}
          onMouseEnter={() => setIsHoveringUp(true)}
          onMouseLeave={() => setIsHoveringUp(false)}
          className={`
            flex-1 flex items-center justify-center
            rounded-t-md
            bg-surface dark:bg-gray-700/80
            border border-border dark:border-gray-600/60
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            ${isHoveringUp && !disabled && canIncrement 
              ? "bg-gray-200 dark:bg-gray-600/80 border-gray-400 dark:border-gray-500" 
              : ""
            }
          `}
          whileHover={prefersReducedMotion || disabled || !canIncrement ? {} : { 
            scale: 1.05,
          }}
          whileTap={prefersReducedMotion || disabled || !canIncrement ? {} : { scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          aria-label="Incrementar"
        >
          <ChevronUp 
            className={`
              w-3.5 h-3.5
              text-subtext dark:text-gray-300
              transition-colors duration-200
              ${disabled || !canIncrement 
                ? "opacity-30" 
                : isHoveringUp 
                  ? "text-[#8B6CFF] dark:text-[#8B6CFF]" 
                  : ""
              }
            `}
            aria-hidden="true"
          />
        </motion.button>

        {/* Decrement Button */}
        <motion.button
          type="button"
          onClick={handleDecrement}
          disabled={disabled || !canDecrement}
          onMouseEnter={() => setIsHoveringDown(true)}
          onMouseLeave={() => setIsHoveringDown(false)}
          className={`
            flex-1 flex items-center justify-center
            rounded-b-md
            bg-surface dark:bg-gray-700/80
            border-t-0 border border-border dark:border-gray-600/60
            transition-all duration-200
            disabled:opacity-30 disabled:cursor-not-allowed
            ${isHoveringDown && !disabled && canDecrement 
              ? "bg-gray-200 dark:bg-gray-600/80 border-gray-400 dark:border-gray-500" 
              : ""
            }
          `}
          whileHover={prefersReducedMotion || disabled || !canDecrement ? {} : { 
            scale: 1.05,
          }}
          whileTap={prefersReducedMotion || disabled || !canDecrement ? {} : { scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          aria-label="Decrementar"
        >
          <ChevronDown 
            className={`
              w-3.5 h-3.5
              text-subtext dark:text-gray-300
              transition-colors duration-200
              ${disabled || !canDecrement 
                ? "opacity-30" 
                : isHoveringDown 
                  ? "text-[#8B6CFF] dark:text-[#8B6CFF]" 
                  : ""
              }
            `}
            aria-hidden="true"
          />
        </motion.button>
      </div>

      {/* Focus indicator animation */}
      <AnimatePresence>
        {isFocused && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              boxShadow: "0 0 0 2px rgba(139, 108, 255, 0.2)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

