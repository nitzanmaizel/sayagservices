import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Request, Response, NextFunction } from 'express';
import { createDoc, getDocById, updateDocById } from '../services/googleDocsService';
import { oAuth2Client } from '../config/oauth2Client';
import { TableData } from '../constants/docLayoutRequest';
import { normalizeLineBreaks } from '../utils/docsUtils';

/**
 * Controller to handle the creation of a Google Doc.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void>} - A promise that resolves to void.
 */
export async function createDocRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    oAuth2Client.setCredentials(req.session.tokens);
    const docs = google.docs({ version: 'v1', auth: oAuth2Client });

    const { title, tableTitle, rows } = req.body;

    const tableData: TableData = {
      title: tableTitle + '\n\n',
      rows: rows.map((row: string[]) => {
        return {
          cells: [
            { text: normalizeLineBreaks(row[0]), bold: true, underline: true },
            { text: normalizeLineBreaks(row[1]), bold: false, underline: false },
            { text: normalizeLineBreaks(row[2]), bold: false, underline: false },
          ],
        };
      }),
    };

    const result = await createDoc(docs, title, tableData);
    if (result.error) {
      return next(result.error);
    }

    // const response = {
    //   docId: result.docId,
    //   docData: result.docData,
    // };

    res
      .status(201)
      .send(
        '<div>Document created successfully</div><div><a href="/">Go back to home page</a></div>'
      );
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to retrieve a Google Doc by its ID.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<Response | void>} - A promise that resolves to an Express response object or void.
 */
export async function getDocRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  const docs = google.docs({ version: 'v1', auth: oAuth2Client });
  const { documentId } = req.params;

  const result = await getDocById(docs, documentId);
  if (result.error) {
    return next(result.error);
  }
  return res.status(200).json({ docData: result.docData });
}

/**
 * Controller to update a Google Doc by its ID.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Promise<void | Response>} - A promise that resolves to void or an Express response object.
 */
export async function updateDocRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> {
  const docs = google.docs({ version: 'v1', auth: oAuth2Client });
  const { documentId } = req.params;
  const { requests } = req.body;

  try {
    const updatedDoc = await updateDocById(docs, documentId, requests);
    return res.status(200).json({ docData: updatedDoc });
  } catch (error) {
    next(error);
  }
}

/**
 * Fetches a specified number of recent documents from the user's Google Drive.
 *
 * @param {OAuth2Client} authClient - The authenticated OAuth2 client.
 * @param {number} numDocs - The number of documents to retrieve.
 * @returns {Promise<drive_v3.Schema$File[]>} - A promise that resolves to an array of documents.
 * @throws {Error} - Throws an error if the request fails.
 */
export const getRecentDocs = async (
  authClient: OAuth2Client,
  numDocs: number = 12
): Promise<drive_v3.Schema$File[]> => {
  try {
    const drive = google.drive({ version: 'v3', auth: authClient });

    const response = await drive.files.list({
      pageSize: numDocs,
      fields: 'files(id, name, createdTime, thumbnailLink, webViewLink, mimeType)',
      orderBy: 'createdTime desc',
      q: "mimeType='application/vnd.google-apps.document'",
    });

    const files = response.data.files;

    return files || [];
  } catch (error) {
    console.error('Error fetching recent documents:', error);
    throw new Error('Failed to fetch recent documents.');
  }
};
