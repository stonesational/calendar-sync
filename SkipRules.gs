/**
 * Skip/filter rules. Determines which events should be synced vs. skipped
 * (transparent, non-default type, or already has the email).
 */

/**
 * Keeps only events that should be synced. Filters out events that are already
 * synced or should be skipped per the skip rules.
 * @param {CalendarEvent[]} eventList - The event list to filter
 * @param {string} email - The add-to-email to check
 * @param {boolean} isSecondaryCalendar - If true, also checks description for email
 * @returns {CalendarEvent[]} Events that should be synced
 */
function filterEventsToSync(eventList, email, isSecondaryCalendar) {
  return eventList.filter(event => !skip(event, email, isSecondaryCalendar));
}

/**
 * @param {CalendarEvent} event - The event to check
 * @param {string} email - The add-to-email to check
 * @param {boolean} isSecondaryCalendar - If true, also checks description for email
 * @returns {boolean} True if the event should be skipped
 */
function skip(event, email, isSecondaryCalendar) {
  // Skip events that are not marked as busy.
  // https://developers.google.com/apps-script/reference/calendar/event-transparency
  if (event.getTransparency() === CalendarApp.EventTransparency.TRANSPARENT) {
    Log.info(
      `SKIPPING - Non-busy event. Transparency: ${event.getTransparency()} | Event Title: ${event.getTitle()}`
    );
    return true;
  }

  // Skip events that are not in my default calendar (i.e. work location events)
  // https://developers.google.com/apps-script/reference/calendar/event-type
  if (event.getEventType() !== CalendarApp.EventType.DEFAULT) {
    Log.info(
      `SKIPPING - Only sync default event types. EventType: ${event.getEventType()} | Event Title: ${event.getTitle()}`
    );
    return true;
  }

  if (isEmailAlreadyPresent(event, email, isSecondaryCalendar)) {
    Log.info(
      `SKIPPING - Email already present in the event. Email: ${email} | Event Title: ${event.getTitle()}`
    );
    return true;
  }
  
  return false;
}


/**
 * Function to check if the email is already present in the event
 * Either in the invite list OR within the event description (secondary calendar scenario only)
 * @param {CalendarEvent} event - The event to check
 * @param {string} email - The add-to-email to check
 * @param {boolean} isSecondaryCalendar - If true, also checks description for email
 * @returns {boolean} True if the email is already present
 */
function isEmailAlreadyPresent(event, email, isSecondaryCalendar) {
  Log.debug(`Checking for email: ${email} in the invite list. Applies to both primary and secondary calendars | Event: ${event.getTitle()} (ID: ${event.getId()})`);
  
  if (event.getGuestByEmail(email) || event.getCreators().includes(email)) {
    Log.info(`SKIP EVENT - Email already present in the invite list`);
    return true;
  }

  if (isSecondaryCalendar) {
    Log.debug(`Secondary calendar found so checking for email within the invite description`);
    if ((event.getDescription() || '').includes(email)) {
      Log.info(`SKIP EVENT - Email: ${email} already present within the event description. Secondary Calendar scenario.`);
      return true;
    }
  }

  return false;
}
