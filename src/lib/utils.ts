import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, addMinutes } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const IST_TIMEZONE = "Asia/Kolkata";

// Format date as string in IST
export function formatDateString(dateTimeStr: string, formatPattern: string): string {
  try {
    if (!dateTimeStr) return "Invalid date";
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "Invalid date";

    const zonedDate = utcToZonedTime(date, IST_TIMEZONE);
    return format(zonedDate, formatPattern);
  } catch (e) {
    console.error("Date format error:", e);
    return "Date format error";
  }
}

// Format time in IST
export function formatTimeWithTimezone(dateTimeStr: string): string {
  try {
    if (!dateTimeStr) return "Invalid time";
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "Invalid time";

    const zonedDate = utcToZonedTime(date, IST_TIMEZONE);
    return format(zonedDate, "hh:mm a");
  } catch (e) {
    console.error("Time format error:", e);
    return "Time format error";
  }
}

// Calculate end time in IST
export function calculateEndTime(dateTimeStr: string, durationMinutes: number = 30): string {
  try {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    if (isNaN(date.getTime())) return "";

    const zonedDate = utcToZonedTime(date, IST_TIMEZONE);
    const endDate = addMinutes(zonedDate, durationMinutes);
    return format(endDate, "hh:mm a");
  } catch (e) {
    console.error("End time error:", e);
    return "";
  }
}
