
import { format, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const IST_TIMEZONE = 'Asia/Kolkata';

export function convertToIST(dateTimeStr: string) {
  try {
    const date = parseISO(dateTimeStr);
    const istDate = toZonedTime(date, IST_TIMEZONE);
    return istDate;
  } catch (error) {
    console.error('Error converting to IST:', error);
    return new Date(dateTimeStr); // Fallback to regular Date parsing
  }
}

export function formatTimeIST(timeStr: string) {
  try {
    // Create a full datetime string for today with the given time
    const today = new Date().toISOString().split('T')[0];
    const dateTimeStr = `${today}T${timeStr}`;
    const date = parseISO(dateTimeStr);
    const istDate = toZonedTime(date, IST_TIMEZONE);
    return format(istDate, 'hh:mm a');
  } catch (error) {
    console.error('Error formatting IST time:', error);
    return timeStr;
  }
}

export function formatDateTimeIST(dateTimeStr: string) {
  try {
    const istDate = convertToIST(dateTimeStr);
    return format(istDate, 'EEE, dd MMM yyyy hh:mm a');
  } catch (error) {
    console.error('Error formatting IST datetime:', error);
    return dateTimeStr;
  }
}
