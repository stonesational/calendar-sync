/**
 * Sending invites. Adds an email address to calendar events via the
 * Calendar API and sends update notifications.
 */

/**
 * Adds the given email to each event's attendees and sends notifications.
 * @param {string} calendarId - Calendar ID
 * @param {CalendarEvent[]} eventList - Events to add the email to
 * @param {string} email - Email address to add
 * @returns {ErrorItem[]} List of errors encountered (empty if none)
 */
function sendInvites(calendarId, eventList, email) {
  const errorList = [];

  for (const event of eventList) {
    Log.debug(`Processing event: ${event.getTitle()} | ID: ${event.getId()} | Start: ${event.getStartTime()} | End: ${event.getEndTime()}`);

    const freshEvent = getEventFromList(calendarId, event, errorList);
    if (freshEvent) {
      Log.debug(`Sending invite to ${freshEvent.summary}`);
      sendInvite(calendarId, freshEvent, email, errorList);
    }
  }
  return errorList;
}

/**
 * Records an "event not found" error to the error list.
 * @param {CalendarEvent} event - The CalendarApp event that was not found
 * @param {ErrorItem[]} errorList - Accumulator for errors
 */
function recordEventNotFoundError(event, errorList) {
  const message = `EVENT STILL NOT FOUND. Ignoring and moving on. Event Title: ${event.getTitle()}`;
  Log.error(message);
  errorList.push(new ErrorItem(event.getId(), message, getEventStartDate(event)));
}

/**
 * Records an error that occurred during event lookup.
 * @param {CalendarEvent} event - The CalendarApp event being looked up
 * @param {Error} error - The thrown error
 * @param {ErrorItem[]} errorList - Accumulator for errors
 */
function recordEventLookupError(event, error, errorList) {
  const errorMessage = `Error getting event list. Event Title: ${event.getTitle()}\n${error.message}`;
  Log.error(errorMessage);
  errorList.push(new ErrorItem(`Event ID: ${event.getId()}`, errorMessage, getEventStartDate(event)));
}

/**
 * Looks up a CalendarApp event in the Calendar API (v3) by iCalUID, with fallback
 * to time range + title search. Pushes to errorList and returns undefined if not found.
 * @param {string} calendarId - Calendar ID
 * @param {CalendarEvent} event - CalendarApp event
 * @param {ErrorItem[]} errorList - Accumulator for errors
 * @returns {Object|undefined} Calendar API event object, or undefined
 */
function getEventFromList(calendarId, event, errorList) {
  try {
    let eventList = Calendar.Events.list(calendarId, {
      iCalUID: event.getId(),
      maxResults: 1
    });

    if (eventList.items.length === 0) {
      Log.warn('EVENT NOT FOUND. Retrying search without iCalUID');
      eventList = Calendar.Events.list(calendarId, {
        timeMin: event.getStartTime().toISOString(),
        timeMax: event.getEndTime().toISOString(),
        maxResults: 1,
        q: event.getTitle()
      });
    }

    if (eventList.items.length === 0) {
      recordEventNotFoundError(event, errorList);
      return undefined;
    }

    return eventList.items[0];

  } catch (error) {
    recordEventLookupError(event, error, errorList);
    return undefined;
  }
}

/**
 * Adds an email to a single event's attendees and sends notifications.
 * Pushes to errorList on failure.
 * @param {string} calendarId - Calendar ID
 * @param {Object} calendarApiEvent - Calendar API v3 event object
 * @param {string} email - Email to add
 * @param {ErrorItem[]} errorList - Accumulator for errors
 */
function sendInvite(calendarId, calendarApiEvent, email, errorList) {
  try {
    const event = Calendar.Events.get(calendarId, calendarApiEvent.id);

    if (event.attendees) {
      event.attendees.push({ email: email });
      Log.debug(`Added additional attendee: ${email}`);
    } else {
      Log.debug(`Added first attendee: ${email}`);
      event.attendees = [{ email: email }];
    }

    Calendar.Events.patch(event, calendarId, event.id, {
      sendUpdates: 'all',
      sendNotifications: true
    });
    Log.info(`Successfully sent invite to ${email} for event: ${event.summary}`);
    
  } catch (error) {
    const errorMessage = `Error sending invite: ${error.message} for event: ${calendarApiEvent.summary} to email: ${email}`;
    Log.error(errorMessage);
    errorList.push(new ErrorItem(
      calendarApiEvent.id,
      errorMessage,
      getEventStartDate(calendarApiEvent)
    ));
  }
}