/**
 * Calendar event fetching. Retrieves events from the specified calendar
 * within the given date range.
 */

/**
 * Returns the end date for a range starting now and extending N days.
 * @param {number} daysFromNow - Number of days from now
 * @returns {Date}
 */
function getDateRangeEnd(daysFromNow) {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
}

/**
 * Fetches events from a calendar for the next N days.
 * @param {string} calendarId - Calendar ID (falsy = default calendar)
 * @param {number} days - Number of days ahead to fetch
 * @returns {CalendarEvent[]}
 */
function fetchEvents(calendarId, days) {
  Log.info(`Fetching events for calendarId: ${calendarId}`);

  let calendar;
  try {
    if (!calendarId) {
      Log.info('No Calendar ID so using default calendar for running user');
      calendar = CalendarApp.getDefaultCalendar();
    } else {
      Log.info(`Using Calendar ID: ${calendarId}`);
      calendar = CalendarApp.getCalendarById(calendarId);
    }

    const startRange = new Date();
    const endRange = getDateRangeEnd(days);
    const eventList = calendar.getEvents(startRange, endRange);

    Log.info(`Found ${eventList.length} events in the next ${days} days.`);
    return eventList;
    
  } catch (e) {
    const errorMessage = `Error fetching events: ${e.message}\nCalendar ID: ${calendarId}\nDays: ${days}`;
    Log.error(errorMessage);
    EmailNotify.sendMessage(errorMessage);
    throw new Error(errorMessage);
  }
}