const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveService() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    // --- METHOD 1: OAuth2 (For Personal 2TB Accounts) ---
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, 'https://developers.google.com/oauthplayground');
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    console.log("[Google Drive] Initialized using OAuth2 (Personal Account).");
    return google.drive({ version: 'v3', auth: oauth2Client });
  } 
  
  const credentialsRaw = process.env.GOOGLE_CREDENTIALS;
  if (credentialsRaw) {
    // --- METHOD 2: Service Account (Fallback) ---
    try {
      let cleaned = credentialsRaw.trim();
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.substring(1, cleaned.length - 1);
      const credentials = JSON.parse(cleaned);
      const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
      console.log("[Google Drive] Initialized using Service Account.");
      return google.drive({ version: 'v3', auth });
    } catch (err) {
      console.error("[Google Drive] Service Account Auth Error:", err.message);
    }
  }

  console.warn("[Google Drive] Auth failed: Missing OAuth2 tokens or Service Account credentials.");
  return null;
}

async function getOrCreateFolder(drive, folderName, parentId = null) {
  try {
    const envRootId = process.env.GOOGLE_DRIVE_PARENT_ID;
    const targetParentId = parentId || envRootId;

    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    if (targetParentId) {
      query += ` and '${targetParentId}' in parents`;
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    const folder = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: targetParentId ? [targetParentId] : [],
      },
      fields: 'id',
      supportsAllDrives: true
    });

    console.log(`[Google Drive] Created folder: ${folderName}`);
    return folder.data.id;
  } catch (err) {
    console.error(`[Google Drive] Folder Error (${folderName}):`, err.message);
    return null;
  }
}

async function uploadFile(filePath, fileName, folderId) {
  const drive = await getDriveService();
  if (!drive) return null;

  try {
    const fileMetadata = {
      name: fileName,
      parents: folderId ? [folderId] : [],
    };

    const media = {
      body: fs.createReadStream(filePath),
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true
    });

    // Make file publicly readable for streaming
    await drive.permissions.create({
      fileId: file.data.id,
      resource: { role: 'reader', type: 'anyone' },
      supportsAllDrives: true
    });

    console.log(`[Google Drive] SUCCESS: Uploaded ${fileName}`);
    return {
      id: file.data.id,
      url: `https://lh3.googleusercontent.com/u/0/d/${file.data.id}`,
      viewLink: file.data.webViewLink,
    };
  } catch (err) {
    console.error(`[Google Drive] UPLOAD ERROR:`, err.message);
    return null;
  }
}

module.exports = { getDriveService, getOrCreateFolder, uploadFile };
