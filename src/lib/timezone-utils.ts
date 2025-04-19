
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Converts a date string to IST timezone
 * No automatic timezone conversion - assumes input is already in IST
 */
export function convertToIST(dateTimeStr: string) {
  try {
    const date = parseISO(dateTimeStr);
    // We don't need to convert to IST since we're already in IST
    // Just parse the date as-is without timezone conversion
    return date;
  } catch (error) {
    console.error('Error converting to IST:', error);
    return new Date(dateTimeStr); // Fallback to regular Date parsing
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
    // Format the time without timezone conversion
    return format(date, 'hh:mm a');
  } catch (error) {
    console.error('Error formatting IST time:', error);
    return timeStr;
  }
}

/**
 * Format a datetime string to IST display format
 * No automatic timezone conversion - assumes input is already in IST
 */
export function formatDateTimeIST(dateTimeStr: string) {
  try {
    const date = parseISO(dateTimeStr);
    // Format directly without timezone conversion
    return format(date, 'EEE, dd MMM yyyy hh:mm a');
  } catch (error) {
    console.error('Error formatting IST datetime:', error);
    return dateTimeStr;
  }
}

/**
 * Creates a date string in ISO format that's explicitly in IST timezone
 * for storing in the database
 */
export function createISTDateTimeForDB(dateStr: string, timeStr: string): string {
  try {
    // Combine date and time
    const dateTimeStr = `${dateStr}T${timeStr}`;
    // This is explicitly treated as IST
    return dateTimeStr;
  } catch (error) {
    console.error('Error creating IST datetime for DB:', error);
    return `${dateStr}T${timeStr}`;
  }
}
