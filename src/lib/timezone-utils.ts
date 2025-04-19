
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Format a datetime string to IST display format
 * This function assumes the input is already in IST
 */
export function formatDateTimeIST(dateTimeStr: string) {
  try {
    // Parse the datetime string that's already in IST
    const date = parseISO(dateTimeStr);
    console.log("formatDateTimeIST - Original:", dateTimeStr);
    
    // Format the date - no timezone conversion needed since input is IST
    const formatted = format(date, 'EEE, dd MMM yyyy hh:mm a');
    console.log("formatDateTimeIST - Formatted:", formatted);
    
    return formatted;
  } catch (error) {
    console.error('Error formatting IST datetime:', error);
    return dateTimeStr;
  }
}

/**
 * Format a time string (HH:MM:SS) to IST display format (hh:mm a)
 * No timezone conversion - assumes input is already in IST
 */
export function formatTimeIST(timeStr: string) {
  try {
    // Create a full datetime string for today with the given time
    const today = new Date().toISOString().split('T')[0];
    const dateTimeStr = `${today}T${timeStr}`;
    const date = parseISO(dateTimeStr);
    // For time-only strings, we don't need timezone conversion
    return format(date, 'hh:mm a');
  } catch (error) {
    console.error('Error formatting IST time:', error);
    return timeStr;
  }
}

/**
 * Creates a date string in ISO format that's explicitly in IST timezone
 * for storing in the database
 */
export function createISTDateTimeForDB(dateStr: string, timeStr: string): string {
  // Simply combine date and time as they are already in IST
  return `${dateStr} ${timeStr}`;
}
