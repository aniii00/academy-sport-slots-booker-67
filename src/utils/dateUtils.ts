
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isValid, parse } from "date-fns";

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

    // Process different date formats
    if (!dateStr.includes('-')) {
      // Format YYYYMMDD to YYYY-MM-DD
      if (dateStr.length === 8) {
        dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
      } else {
        console.error("Invalid date format:", date);
        return null;
      }
    }
    
    // Split the date parts and validate each part
    const dateParts = dateStr.split('-');
    if (dateParts.length !== 3) {
      console.error("Date doesn't have three parts separated by dashes:", dateStr);
      return null;
    }
    
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const day = parseInt(dateParts[2], 10);
    
    // Basic validation
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        year < 2000 || year > 2100 || 
        month < 1 || month > 12 || 
        day < 1 || day > 31) {
      console.error("Date parts are invalid:", year, month, day);
      return null;
    }
    
    // Reconstruct the validated date
    dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
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
    
    // Split the time parts and validate each part
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 3) {
      console.error("Time doesn't have three parts separated by colons:", timeStr);
      return null;
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = parseInt(timeParts[2], 10);
    
    // Basic validation
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || 
        hours < 0 || hours > 23 || 
        minutes < 0 || minutes > 59 || 
        seconds < 0 || seconds > 59) {
      console.error("Time parts are invalid:", hours, minutes, seconds);
      return null;
    }
    
    // Reconstruct the validated time
    timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Combine date and time
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
  try {
    // Ensure date is in YYYY-MM-DD format
    let formattedDate = slotDate;
    if (!slotDate.includes('-') && slotDate.length === 8) {
      formattedDate = `${slotDate.substring(0, 4)}-${slotDate.substring(4, 6)}-${slotDate.substring(6, 8)}`;
    }
    
    // Ensure time is in HH:MM:SS format
    let formattedTime = slotTime;
    if (!slotTime.includes(':')) {
      if (slotTime.length === 4) {
        formattedTime = `${slotTime.substring(0, 2)}:${slotTime.substring(2, 4)}:00`;
      } else if (slotTime.length === 6) {
        formattedTime = `${slotTime.substring(0, 2)}:${slotTime.substring(2, 4)}:${slotTime.substring(4, 6)}`;
      }
    } else if (slotTime.split(':').length === 2) {
      formattedTime = `${slotTime}:00`;
    }
    
    // Create the ISO string
    const isoString = `${formattedDate}T${formattedTime}`;
    
    // Validate it
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    return isoString;
  } catch (error) {
    console.error("Error formatting slot date time:", error);
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
