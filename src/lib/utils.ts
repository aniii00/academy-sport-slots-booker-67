import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, parse } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent date formatter with IST timezone
export function formatDateString(dateTimeStr: string, formatPattern: string): string {
  try {
    if (!dateTimeStr) return "Invalid date";
    
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "Invalid date";

    return new Intl.DateTimeFormat("en-IN", {
      weekday: formatPattern.includes("EEE") ? "short" : undefined,
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e, dateTimeStr);
    return "Date format error";
  }
}

// Format time consistently in IST timezone
export function formatTimeWithTimezone(dateTimeStr: string): string {
  try {
    if (!dateTimeStr) return "Invalid time";

    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "Invalid time";

    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(date);
  } catch (e) {
    console.error("Error formatting time:", e, dateTimeStr);
    return "Time format error";
  }
}

// Calculate end time in IST timezone
export function calculateEndTime(dateTimeStr: string, durationMinutes: number = 30): string {
  try {
    if (!dateTimeStr) return "";

    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "";

    const endDate = new Date(date.getTime() + durationMinutes * 60 * 1000);

    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }).format(endDate);
  } catch (e) {
    console.error("Error calculating end time:", e, dateTimeStr);
    return "";
  }
}
