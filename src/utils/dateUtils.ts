
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid, parse } from "date-fns";

/**
 * Safely formats a date string in ISO format
 * @param date The date string or date parts (YYYY-MM-DD or YYYYMMDD)
 * @param time The time string or time parts (HH:MM:SS, HH:MM, or HHMM)
 * @returns A properly formatted ISO date string or null if invalid
 */
export function formatDateTimeToISO(date: string, time: string): string | null {
  try {
    // Clean and normalize date
    let dateStr = date?.trim() || '';
    if (!dateStr) return null;

    // Format YYYYMMDD to YYYY-MM-DD if needed
    if (!dateStr.includes('-')) {
      if (dateStr.length === 8) {
        dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      } else {
        console.error("Invalid date format:", date);
        return null;
      }
    }
    
    // Validate date parts
    const [year, month, day] = dateStr.split('-').map(part => parseInt(part, 10));
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        year < 2000 || year > 2100 || 
        month < 1 || month > 12 || 
        day < 1 || day > 31) {
      console.error("Invalid date parts:", year, month, day);
      return null;
    }
    
    // Clean and normalize time
    let timeStr = time?.trim() || '';
    if (!timeStr) return null;

    // Format HHMM to HH:MM:00 if needed
    if (!timeStr.includes(':')) {
      if (timeStr.length === 4) {
        timeStr = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}:00`;
      } 
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
    
    // Validate time parts
    const [hours, minutes, seconds] = timeStr.split(':').map(part => parseInt(part, 10));
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || 
        hours < 0 || hours > 23 || 
        minutes < 0 || minutes > 59 || 
        seconds < 0 || seconds > 59) {
      console.error("Invalid time parts:", hours, minutes, seconds);
      return null;
    }
    
    // Combine date and time in ISO format
    const isoString = `${dateStr}T${timeStr}`;
    
    // Final validation using Date object
    const testDate = new Date(isoString);
    if (isNaN(testDate.getTime())) {
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
 * Validates and formats a slot date and time for display or storage
 * @param slotDate The date string (YYYY-MM-DD or YYYYMMDD)
 * @param slotTime The time string (HH:MM:SS, HH:MM, or HHMM)
 * @returns A properly formatted ISO date-time string or null if invalid
 */
export function formatSlotDateTime(slotDate: string, slotTime: string): string | null {
  return formatDateTimeToISO(slotDate, slotTime);
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
 * @param dateString The ISO date string to extract and format the time from
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
