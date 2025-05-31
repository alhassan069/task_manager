/**
 * Utility functions for handling date parsing and timezone conversion
 */

/**
 * Convert a date string to IST (Indian Standard Time)
 * @param {string} dateString - Date string in any format
 * @returns {string|null} - ISO date string in IST or null if invalid
 */
const convertToIST = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Parse the date
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Convert to IST (UTC+5:30)
    const options = {
      timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    // Format in ISO
    const istDateString = date.toLocaleString('en-US', options);
    const [datePart, timePart] = istDateString.split(', ');
    const [month, day, year] = datePart.split('/');
    
    return `${year}-${month}-${day}T${timePart}+05:30`;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Format a date for display in IST
 * @param {string} isoDateString - ISO date string
 * @returns {string} - Formatted date string
 */
const formatDateForDisplay = (isoDateString) => {
  if (!isoDateString) return 'No due date';
  
  try {
    const date = new Date(isoDateString);
    
    // Format options for display
    const options = {
      timeZone: process.env.TIMEZONE || 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    return 'Invalid date';
  }
};

module.exports = {
  convertToIST,
  formatDateForDisplay
}; 