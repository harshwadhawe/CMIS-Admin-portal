import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats event date and time for display
 * @param eventDate - ISO date string (e.g., "2026-04-16T05:00:00.000Z")
 * @param startTime - Time string in HH:mm:ss format (e.g., "14:00:00")
 * @param endTime - Time string in HH:mm:ss format (e.g., "16:00:00")
 * @returns Object with formatted date and time strings
 */
export function formatEventDateTime(
  eventDate?: string | Date | null,
  startTime?: string | null,
  endTime?: string | null
): { formattedDate: string; formattedTime: string } {
  const cstTimeZone = 'America/Chicago'; // CST timezone
  
  if (!eventDate) {
    return { formattedDate: 'N/A', formattedTime: 'N/A' };
  }

  try {
    // Parse the event date
    const date = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
    
    // Format date as "Month Day, Year" in CST using Intl.DateTimeFormat
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: cstTimeZone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedDate = dateFormatter.format(date);
    
    // Format time range
    let formattedTime = 'N/A';
    if (startTime && endTime) {
      // Remove seconds from time strings (convert HH:mm:ss to HH:mm)
      const startTimeFormatted = startTime.substring(0, 5); // Extract HH:mm
      const endTimeFormatted = endTime.substring(0, 5); // Extract HH:mm
      formattedTime = `${startTimeFormatted} - ${endTimeFormatted} CST`;
    } else if (startTime) {
      // Remove seconds from time string (convert HH:mm:ss to HH:mm)
      const startTimeFormatted = startTime.substring(0, 5); // Extract HH:mm
      formattedTime = `${startTimeFormatted} CST`;
    }
    
    return { formattedDate, formattedTime };
  } catch (error) {
    console.error('Error formatting event date/time:', error);
    return { formattedDate: 'N/A', formattedTime: 'N/A' };
  }
}
