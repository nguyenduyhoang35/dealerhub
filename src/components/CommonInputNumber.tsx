import { KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { InputNumber as AntInputNumber, InputNumberProps } from "antd";

interface CommonInputNumberProps extends Omit<
  InputNumberProps,
  "formatter" | "parser"
> {
  /** Number of decimal places (default: 0 for integers) */
  decimalPlaces?: number;
  /** Locale for formatting (default: en-US) */
  locale?: string;
}

/**
 * CommonInputNumber - Input number with formatting
 * - Only accepts numeric input
 * - Displays with thousand separators (e.g., 1,234,567)
 * - Supports decimal places configuration
 */
const CommonInputNumber = ({
  decimalPlaces = 0,
  locale = "en-US",
  className = "",
  onKeyDown,
  ...props
}: CommonInputNumberProps) => {
  // Format number string with thousand separators without using parseFloat
  // to avoid JavaScript number precision issues with large numbers
  const formatNumberString = (numStr: string): string => {
    if (!numStr) return "";

    // Handle negative numbers
    const isNegative = numStr.startsWith("-");
    const absNumStr = isNegative ? numStr.slice(1) : numStr;

    // Split into integer and decimal parts
    const [integerPart, decimalPart] = absNumStr.split(".");

    // Add thousand separators to integer part
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Rebuild the number
    let result = formattedInteger;
    if (decimalPart !== undefined) {
      const truncatedDecimal = decimalPart.slice(0, decimalPlaces);
      result += "." + truncatedDecimal;
    }

    return isNegative ? "-" + result : result;
  };

  const formatter = (value: number | string | undefined) => {
    if (value === undefined || value === null || value === "") return "";

    // Convert to string and handle the formatting manually
    const strValue = String(value);

    // Remove any existing formatting
    const cleanValue = strValue.replace(/,/g, "");

    // Check if it's a valid number pattern
    if (!/^-?\d*\.?\d*$/.test(cleanValue)) return "";

    return formatNumberString(cleanValue);
  };

  const parser = (displayValue: string | undefined): string => {
    if (!displayValue) return "";

    // Remove all non-numeric characters except decimal point and minus
    const cleanValue = displayValue.replace(/[^\d.-]/g, "");

    return cleanValue;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Allow: backspace, delete, tab, escape, enter, arrow keys
    const allowedKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Allow Ctrl/Cmd + A, C, V, X
    if (
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase())
    ) {
      onKeyDown?.(e);
      return;
    }

    // Allow allowed keys
    if (allowedKeys.includes(e.key)) {
      onKeyDown?.(e);
      return;
    }

    // Allow numbers
    if (/^[0-9]$/.test(e.key)) {
      onKeyDown?.(e);
      return;
    }

    // Allow decimal point if decimalPlaces > 0
    if (decimalPlaces > 0 && (e.key === "." || e.key === ",")) {
      onKeyDown?.(e);
      return;
    }

    // Allow minus sign at the beginning
    if (e.key === "-") {
      onKeyDown?.(e);
      return;
    }

    // Block all other keys
    e.preventDefault();
  };

  return (
    <AntInputNumber
      className={cn("w-full!", className)}
      formatter={formatter}
      parser={parser}
      controls={false}
      onKeyDown={handleKeyDown}
      stringMode
      {...props}
    />
  );
};

export default CommonInputNumber;
