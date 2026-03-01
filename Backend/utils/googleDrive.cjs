const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getDriveService() {
  const credentialsRaw = process.env.GOOGLE_CREDENTIALS;
  if (!credentialsRaw) {
    console.warn("[Google Drive] GOOGLE_CREDENTIALS missing.");
    return null;
  }
  try {
    let cleaned = credentialsRaw.trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.substring(1, cleaned.length - 1);
    const credentials = JSON.parse(cleaned);
    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
    return google.drive({ version: 'v3', auth });
  } catch (err) {
    console.error("[Google Drive] Auth Error:", err.message);
    return null;
  }
}

async function getOrCreateFolder(drive, folderName, parentId = null) {
  try {
    const envRootId = process.env.GOOGLE_DRIVE_PARENT_ID;
    // We MUST have a parentId (either passed or from env) to avoid the "Quota" error
    const targetParentId = parentId || envRootId;

    if (!targetParentId) {
      console.error("[Google Drive] ERROR: No Parent Folder ID provided. Service accounts require a shared folder to use your storage quota.");
      return null;
    }

    let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false and '${targetParentId}' in parents`;

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
        parents: [targetParentId],
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

  if (!folderId) {
    console.error("[Google Drive] Upload blocked: folderId is missing. Check if GOOGLE_DRIVE_PARENT_ID is set in Render.");
    return null;
  }

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
      fields: 'id, webViewLink',
      supportsAllDrives: true
    });

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
    if (err.message.includes("quota")) {
      console.error("[Google Drive] QUOTA ERROR: The Service Account is trying to use its own 0GB storage. Ensure the folder ID in GOOGLE_DRIVE_PARENT_ID is shared with the service account as an 'Editor'.");
    } else {
      console.error(`[Google Drive] UPLOAD ERROR:`, err.message);
    }
    return null;
  }
}

module.exports = { getDriveService, getOrCreateFolder, uploadFile };
