
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, parse, addMinutes } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Consistent date formatter with timezone consideration
export function formatDateString(dateTimeStr: string, formatPattern: string): string {
  try {
    if (!dateTimeStr) return "Invalid date";
    
    // Create date object from the original string without manipulation
    const date = new Date(dateTimeStr);
    if (!isNaN(date.getTime())) {
      return format(date, formatPattern);
    }
    
    // Try to parse as ISO date string if above approach failed
    if (dateTimeStr.includes('T')) {
      const isoDate = parseISO(dateTimeStr);
      if (!isNaN(isoDate.getTime())) {
        return format(isoDate, formatPattern);
      }
    }
    
    // Handle postgres timestamp format (YYYY-MM-DD HH:MM:SS)
    if (dateTimeStr.includes(' ') && dateTimeStr.includes(':')) {
      try {
        const [datePart, timePart] = dateTimeStr.split(' ');
        const fullDateStr = `${datePart}T${timePart}`;
        const parsedDate = new Date(fullDateStr);
        if (!isNaN(parsedDate.getTime())) {
          return format(parsedDate, formatPattern);
        }
      } catch (error) {
        console.error("Error parsing datetime:", error);
      }
    }
    
    return "Invalid date";
  } catch (e) {
    console.error("Error formatting date:", e, dateTimeStr);
    return "Date format error";
  }
}

// Format time consistently with timezone information preserved
export function formatTimeWithTimezone(dateTimeStr: string): string {
  try {
    if (!dateTimeStr) return "Invalid time";
    
    // Use the original datetime string without manipulation to preserve timezone
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

// Calculate end time from a start time consistently
export function calculateEndTime(dateTimeStr: string, durationMinutes: number = 30): string {
  try {
    if (!dateTimeStr) return "";
    
    // Handle timezone correctly by using the original string
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
