/**
 * Shared utilities: Log, ErrorItem, EmailNotify, and getEventStartDate.
 */

/**
 * Logger class to handle logging messages.
 * Contains a log level enum (DEBUG, INFO, WARN, ERROR)
 * DEBUG will only be logged if DEBUG_MODE is true.
 * INFO will be logged always.
 * WARN will be logged always.
 * ERROR will be logged always.
 * Each log level has its own method.
 */
class Log {
  
  static debug(message) {
    if (DEBUG_MODE) Logger.log(`DEBUG: ${message}`);
  }

  static info(message) {
    Logger.log(`INFO: ${message}`);
  }

  static warn(message) {
    Logger.log(`WARN: ${message}`);
  }

  static error(message) {
    Logger.log(`ERROR: ${message}`);
  }
}

/**
 * Extracts a Date from an event. Works with both CalendarApp events (getStartTime())
 * and Calendar API v3 event objects (start.dateTime or start.date).
 * @param {CalendarEvent|Object} event - CalendarApp event or Calendar API event object
 * @returns {Date}
 */
function getEventStartDate(event) {
  if (typeof event.getStartTime === 'function') {
    return event.getStartTime();
  }
  const start = event.start;
  if (!start) return new Date();
  if (start.dateTime) return new Date(start.dateTime);
  if (start.date) return new Date(start.date);
  return new Date();
}

/**
 * ErrorItem class to store errors found during sync.
 * The class should have 3 properties: eventId, message, and startTime.
 */
class ErrorItem {
  constructor(eventId, message, startTime) {
    this.eventId = eventId;
    this.message = message;
    this.startTime = startTime;
  }
}

/**
 * EmailNotify class to send error notifications.
 * The class should have a method to send an email with the error details.
 * @param {ErrorItem[]} errorList - The list of error items to send.
 */
class EmailNotify {
  static sendErrors(errorList) {
    const message = errorList
      .map(e => `Event ID: ${e.eventId}\nStart: ${e.startTime}\nMessage: ${e.message}\n\n`)
      .join('');

    MailApp.sendEmail(
      ERROR_NOTIFY_EMAIL,
      'Error report - Calendar Sync Script',
      `Message: ${message}`
    );
  }

  /**
   * Send a message to the error notify email.
   * @param {string} message - The message to send.
   */
  static sendMessage(message) {
    MailApp.sendEmail(
      ERROR_NOTIFY_EMAIL,
      'Error report - Calendar Sync Script',
      `Message: ${message}`
    );
  }
}