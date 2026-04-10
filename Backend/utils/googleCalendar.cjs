const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../db.cjs');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:4000/api/auth/google-callback";

const { decrypt } = require('./crypto.cjs');

/**
 * Gets a refreshed OAuth2 client for a user
 */
async function getAuthenticatedClient(userId) {
  const [rows] = await pool.execute(
    "SELECT google_refresh_token, google_access_token, google_token_expiry FROM users WHERE id = ?",
    [userId]
  );

  const user = rows[0];
  if (!user || !user.google_refresh_token) {
    throw new Error("Teacher has not connected their Google account.");
  }

  const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

  const decryptedRefreshToken = decrypt(user.google_refresh_token);

  oauth2Client.setCredentials({
    refresh_token: decryptedRefreshToken,
    access_token: user.google_access_token,
    expiry_date: Number(user.google_token_expiry)
  });

  // Check if token needs refresh
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await pool.execute(
        "UPDATE users SET google_access_token = ?, google_token_expiry = ? WHERE id = ?",
        [tokens.access_token, tokens.expiry_date, userId]
      );
    }
  });

  return oauth2Client;
}

/**
 * Creates a Google Calendar event with a Google Meet link
 */
async function createMeetEvent(userId, details) {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: details.title,
    description: details.description || 'Online class scheduled via EdulinkX',
    start: {
      dateTime: details.start || new Date().toISOString(),
      timeZone: 'UTC',
    },
    end: {
      dateTime: details.end || new Date(Date.now() + 3600000).toISOString(),
      timeZone: 'UTC',
    },
    conferenceData: {
      createRequest: {
        requestId: `edulinkx-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
    conferenceDataVersion: 1,
  });

  return {
    eventId: response.data.id,
    meetLink: response.data.hangoutLink,
    status: response.data.status
  };
}

/**
 * Deletes a Google Calendar event
 */
async function deleteMeetEvent(userId, eventId) {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    });
    return true;
  } catch (err) {
    console.error(`[Google Calendar] Failed to delete event ${eventId}:`, err.message);
    return false;
  }
}

module.exports = {
  createMeetEvent,
  deleteMeetEvent,
  getAuthenticatedClient
};
