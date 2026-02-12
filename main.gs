/**
 * ============================================================================
 * AUTO-ADD TO CALENDAR INVITES
 * ============================================================================
 *
 * METHOD TO SCHEDULE: AddEmailToInvites (below)
 *
 * CONFIGURATION REQUIRED:
 *
 * 1. Enable Advanced Calendar API
 *    → Go to: https://developers.google.com/apps-script/guides/services/advanced
 *    → Enable the Calendar API service
 *
 * 2. Set Required Constants 
 *    → EMAIL_ADDRESS_TO_ADD (required)
 *      Set to the email address you want to have added to calendar invtes. I.e. Where do you want the events to be synced?
 *
 *    → DAYS_IN_ADVANCE (optional, default: 14)
 *      Set to the number of days in advance to search your source calendar
 *      HINT: Use 1 or 2 to test then increase to 14 for reasonable future horizon
 *
 *    → SECONDARY_CALENDAR_ID (optional)
 *      Set to the ID of the secondary google calendar you want to use as source.
 *      Leave blank to use your running user's default calendar
 *      WARNING: While coded to support secondary calendars, it has not been used in a few versions so a fix may be needed. PRs welcome!
 *  
 *    → ERROR_NOTIFY_EMAIL 
 *      The email to be used to send any error reports.
 * 
 *    → DEBUG_MODE (optional, default: false)
 *      Set to true to enable debug mode. This will log more detailed information to the console.
 *      HINT: See Utilities.gs for more details.
 *  
 * ============================================================================
 */

/**
 *  Configuration Constants
 */ 
const EMAIL_ADDRESS_TO_ADD = '';
const SECONDARY_CALENDAR_ID = '';
const DAYS_IN_ADVANCE = 1;
const DEBUG_MODE = false;
const ERROR_NOTIFY_EMAIL = '';

/**
 * MAIN: Execute this function from the batch schedule run.
 */
function AddEmailToInvites() {
  let eventList = fetchEvents(SECONDARY_CALENDAR_ID, DAYS_IN_ADVANCE);
  eventList = filterEventsToSync(eventList, EMAIL_ADDRESS_TO_ADD, Boolean(SECONDARY_CALENDAR_ID));
  Log.info(`Found ${eventList.length} events to process`);

  const errorList = sendInvites(SECONDARY_CALENDAR_ID, eventList, EMAIL_ADDRESS_TO_ADD);

  if (errorList.length > 0) {
    Log.error(`Error sending invites: ${errorList.length} errors found`);
    EmailNotify.sendErrors(errorList);
  } else {
    Log.info(`No errors found sending invites`);
  }
}