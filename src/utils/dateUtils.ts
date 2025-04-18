
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid } from "date-fns";

/**
 * Safely formats a date string in ISO format
 * @param date The date string or date parts
 * @param time The time string or time parts
 * @returns A properly formatted ISO date string or null if invalid
 */
export function formatDateTimeToISO(date: string, time: string): string | null {
  try {
    // Clean and normalize date
    let dateStr = date?.trim() || '';
    if (!dateStr) return null;

    if (!dateStr.includes('-')) {
      // Format YYYYMMDD to YYYY-MM-DD
      if (dateStr.length === 8) {
        dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      } else {
        console.error("Invalid date format:", date);
        return null;
      }
    }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      console.error("Date doesn't match expected format (YYYY-MM-DD):", dateStr);
      return null;
    }
    
    // Clean and normalize time
    let timeStr = time?.trim() || '';
    if (!timeStr) return null;

    if (!timeStr.includes(':')) {
      // Format HHMM to HH:MM:00
      if (timeStr.length === 4) {
        timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:00`;
      } 
      // Format HHMMSS to HH:MM:SS
      else if (timeStr.length === 6) {
        timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:${timeStr.substring(4, 6)}`;
      } else {
        console.error("Invalid time format:", time);
        return null;
      }
    } else if (timeStr.split(':').length === 2) {
      // Add seconds if missing
      timeStr = `${timeStr}:00`;
    }
    
    // Validate time format
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/;
    if (!timeRegex.test(timeStr)) {
      console.error("Time doesn't match expected format (HH:MM:SS):", timeStr);
      return null;
    }
    
    // Combine date and time
    const isoString = `${dateStr}T${timeStr}`;
    
    // Validate the result is a valid date
    const testDate = new Date(isoString);
    if (!isValid(testDate)) {
      console.error("Invalid date/time combination:", isoString);
      return null;
    }
    
    return isoString;
  } catch (error) {
    console.error("Error formatting date/time:", error);
    return null;
  }
}

/**
 * Safely formats a date for display
 * @param dateString The ISO date string to format
 * @param formatString The date-fns format string to use
 * @returns Formatted date string or a fallback message if invalid
 */
export function formatDateForDisplay(dateString: string | null | undefined, formatString: string = "EEEE, MMMM d, yyyy"): string {
  if (!dateString) return "Date unavailable";
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Invalid date";
    }
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date for display:", error, dateString);
    return "Date formatting error";
  }
}

/**
 * Safely formats a time for display
 * @param timeString The time part of an ISO date string
 * @param formatString The date-fns format string to use
 * @returns Formatted time string or a fallback message if invalid
 */
export function formatTimeForDisplay(dateString: string | null | undefined, formatString: string = "h:mm a"): string {
  if (!dateString) return "Time unavailable";
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) {
      return "Invalid time";
    }
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting time for display:", error, dateString);
    return "Time formatting error";
  }
}

/**
 * Checks if a slot is available by validating there are no existing bookings
 */
export async function checkSlotAvailability(venueId: string, sportId: string, slotDateTime: string) {
  if (!slotDateTime) return false;
  
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('venue_id', venueId)
      .eq('sport_id', sportId)
      .eq('slot_time', slotDateTime);
      
    if (error) throw error;
    
    return !(data && data.length > 0);
  } catch (error) {
    console.error("Error checking slot availability:", error);
    return false;
  }
}
