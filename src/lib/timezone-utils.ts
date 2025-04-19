
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Converts a date string to IST timezone
 * Handles UTC timestamps and converts them to IST
 */
export function convertToIST(dateTimeStr: string) {
  try {
    // Parse the ISO string to a Date object
    const date = parseISO(dateTimeStr);
    
    // Convert to IST timezone
    const istDate = toZonedTime(date, IST_TIMEZONE);
    
    // Log the conversion for debugging
    console.log("Original:", dateTimeStr);
    console.log("Converted to IST:", istDate);
    
    return istDate;
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
    // For time-only strings, we don't need timezone conversion
    return format(date, 'hh:mm a');
  } catch (error) {
    console.error('Error formatting IST time:', error);
    return timeStr;
  }
}

/**
 * Format a datetime string to IST display format
 * This function will correctly display the time as it was stored
 * without applying additional timezone conversions
 */
export function formatDateTimeIST(dateTimeStr: string) {
  try {
    // Parse the ISO string directly without timezone adjustment
    const date = parseISO(dateTimeStr);
    
    // Log original string and parsed date
    console.log("formatDateTimeIST - Original:", dateTimeStr);
    console.log("formatDateTimeIST - Parsed date:", date);
    
    // Display the time as stored in the database
    const formatted = format(date, 'EEE, dd MMM yyyy hh:mm a');
    console.log("formatDateTimeIST - Formatted:", formatted);
    
    return formatted;
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
    console.log("createISTDateTimeForDB - Combined:", dateTimeStr);
    // This is explicitly treated as IST
    return dateTimeStr;
  } catch (error) {
    console.error('Error creating IST datetime for DB:', error);
    return `${dateStr}T${timeStr}`;
  }
}
