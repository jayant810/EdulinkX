const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// SCOPES for Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveService() {
  const credentialsRaw = process.env.GOOGLE_CREDENTIALS;
  
  if (!credentialsRaw) {
    console.error("[Google Drive] GOOGLE_CREDENTIALS environment variable not found.");
    return null;
  }

  try {
    // Robust parsing: trim and handle potential extra wrapping quotes from environment/shell
    let cleaned = credentialsRaw.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    }
    
    const credentials = JSON.parse(cleaned);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    return google.drive({ version: 'v3', auth });
  } catch (err) {
    console.error("[Google Drive] Error parsing GOOGLE_CREDENTIALS.");
    console.error(`[Google Drive] Technical Detail: ${err.message}`);
    console.log("[Google Drive] Tip: Ensure you pasted the entire JSON content starting with { and ending with } into the Render Environment Variable.");
    return null;
  }
}

/**
 * Finds or creates a folder in Google Drive.
 */
async function getOrCreateFolder(drive, folderName, parentId = null) {
  try {
    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (parentId) query += ` and '${parentId}' in parents`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const fileMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : [],
    };

    const folder = await drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });

    return folder.data.id;
  } catch (err) {
    console.error(`[Google Drive] Error managing folder "${folderName}":`, err.message);
    return null;
  }
}

/**
 * Uploads a file to Google Drive and returns a direct streamable link.
 */
async function uploadFile(filePath, fileName, folderId) {
  const drive = await getDriveService();
  if (!drive) return null;

  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };

    const media = {
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink, webContentLink',
    });

    // Make file publicly readable so the student player can stream it
    await drive.permissions.create({
      fileId: file.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      id: file.data.id,
      // Direct stream link format for Google Drive
      url: `https://lh3.googleusercontent.com/u/0/d/${file.data.id}`,
      viewLink: file.data.webViewLink,
    };
  } catch (err) {
    console.error("[Google Drive] Upload failed:", err.message);
    return null;
  }
}

module.exports = { getDriveService, getOrCreateFolder, uploadFile };
