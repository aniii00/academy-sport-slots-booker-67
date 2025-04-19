
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

// Standardized date formatter specifically for handling timestamps with timezone information
export function formatTimeWithTimezone(dateTimeStr: string): string {
  try {
    if (!dateTimeStr) return "Invalid time";
    
    // Parse the date considering timezone information
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      return format(date, 'hh:mm a'); // 12-hour format with AM/PM
    }
    
    return "Invalid time";
  } catch (e) {
    console.error("Error formatting time:", e, dateTimeStr);
    return "Time format error";
  }
}

// Calculate end time from a start time (default 30 minutes later)
export function calculateEndTime(dateTimeStr: string, durationMinutes: number = 30): string {
  try {
    if (!dateTimeStr) return "";
    
    // Parse the date considering timezone information
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      const endDate = new Date(date.getTime() + durationMinutes * 60 * 1000);
      return format(endDate, 'hh:mm a');
    }
    
    return "";
  } catch (e) {
    console.error("Error calculating end time:", e, dateTimeStr);
    return "";
  }
}
