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
    console.error("[Google Drive] Error parsing GOOGLE_CREDENTIALS:", err.message);
    return null;
  }
}

/**
 * Finds or creates a folder.
 */
async function getOrCreateFolder(drive, folderName, parentId = null) {
  try {
    // If no parentId is provided, and we have one in env, use it as the ultimate root
    const envRootId = process.env.GOOGLE_DRIVE_PARENT_ID;
    const actualParentId = parentId || envRootId;

    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (actualParentId) {
      query += ` and '${actualParentId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

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
      parents: actualParentId ? [actualParentId] : [],
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
 * Uploads a file.
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

    await drive.permissions.create({
      fileId: file.data.id,
      resource: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      id: file.data.id,
      url: `https://lh3.googleusercontent.com/u/0/d/${file.data.id}`,
      viewLink: file.data.webViewLink,
    };
  } catch (err) {
    console.error("[Google Drive] Upload failed:", err.message);
    return null;
  }
}

module.exports = { getDriveService, getOrCreateFolder, uploadFile };
