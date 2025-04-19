
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Standardized date formatter that handles different date string formats
export function formatDateString(dateTimeStr: string, formatPattern: string): string {
  try {
    if (!dateTimeStr) return "Invalid date";
    
    // Try to parse as ISO date string
    if (dateTimeStr.includes('T')) {
      const date = parseISO(dateTimeStr);
      if (!isNaN(date.getTime())) {
        return format(date, formatPattern);
      }
    }
    
    // Handle postgres timestamp format (YYYY-MM-DD HH:MM:SS)
    if (dateTimeStr.includes(' ') && dateTimeStr.includes(':')) {
      const [datePart, timePart] = dateTimeStr.split(' ');
      const fullDateStr = `${datePart}T${timePart}`;
      const date = new Date(fullDateStr);
      if (!isNaN(date.getTime())) {
        return format(date, formatPattern);
      }
    }
    
    // Last resort - try to parse as is
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      return format(date, formatPattern);
    }
    
    return "Invalid date";
  } catch (e) {
    console.error("Error formatting date:", e, dateTimeStr);
    return "Date format error";
  }
}
