import { google } from 'googleapis';
import { Request, Response, NextFunction } from 'express';
import { createDoc, getDocById, updateDocById } from '../services/googleDocsService';
import { oAuth2Client } from '../config/oauth2Client';

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
    if (!req.user || !req.user.accessToken) {
      throw new Error('Access token not found');
    }
    oAuth2Client.setCredentials({ access_token: req.user.accessToken });
    const docs = google.docs({ version: 'v1', auth: oAuth2Client });

    const tableData = req.body;

    const result = await createDoc(docs, tableData);
    if (result.error) {
      return next(result.error);
    }

    const response = {
      documentId: result.docId,
      title: result.docData?.title,
    };

    res.status(201).json(response);
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
  if (!req.user || !req.user.accessToken) {
    throw new Error('Access token not found');
  }
  oAuth2Client.setCredentials({ access_token: req.user.accessToken });
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
  if (!req.user || !req.user.accessToken) {
    throw new Error('Access token not found');
  }
  oAuth2Client.setCredentials({ access_token: req.user.accessToken });
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

/**
 * Fetches a specified number of recent documents from the user's Google Drive.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const getRecentDocs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const numDocs = parseInt(req.query.numDocs as string) || 12;

  if (!req.user || !req.user.accessToken) {
    throw new Error('Access token not found');
  }
  try {
    // Set OAuth2 credentials
    oAuth2Client.setCredentials({ access_token: req.user.accessToken });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const response = await drive.files.list({
      pageSize: numDocs,
      fields: 'files(id, name, createdTime, thumbnailLink, webViewLink, mimeType)',
      orderBy: 'createdTime desc',
      q: "mimeType='application/vnd.google-apps.document'",
    });

    console.log({ response });

    const docs = response.data.files || [];
    res.status(200).json(docs);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to download a Google Doc as PDF.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 */
export const downloadDocAsPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { documentId } = req.params;

  try {
    if (!req.user || !req.user.accessToken) {
      throw new Error('Access token not found');
    }

    oAuth2Client.setCredentials({ access_token: req.user.accessToken });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const response = await drive.files.export(
      {
        fileId: documentId,
        mimeType: 'application/pdf',
      },
      { responseType: 'stream' }
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentId}.pdf"`);

    // Pipe the PDF stream to the client response
    response.data.pipe(res);
  } catch (error) {
    console.error('Error downloading the document as PDF:', error);
    next(error);
  }
};

/**
 * Controller to search for Google Docs by name or creation time.
 * Retrieves a list of Google Docs that match the specified search criteria,
 * such as name, creation date range, or other filters.
 * The search results are further refined on the server side for more accurate matching.
 *
 * @param {Request} req - The Express request object, containing search parameters:
 *   - {string} [req.query.name] - The name or partial name of the document to search for.
 *   - {string} [req.query.createdAfter] - The start date (inclusive) to filter documents created after.
 *   - {string} [req.query.createdBefore] - The end date (inclusive) to filter documents created before.
 *   - {string} [req.query.limit] - The maximum number of results to return (defaults to 10).
 * @param {Response} res - The Express response object used to send back the search results.
 * @param {NextFunction} next - The Express next middleware function to handle errors.
 * @returns {Promise<void>} - A promise that resolves when the response is sent.
 */

export const searchDocs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.user.accessToken) {
      throw new Error('Access token not found');
    }

    oAuth2Client.setCredentials({ access_token: req.user.accessToken });
    const drive = google.drive({ version: 'v3', auth: oAuth2Client });

    const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
    const createdAfter = typeof req.query.createdAfter === 'string' ? req.query.createdAfter : '';
    const createdBefore =
      typeof req.query.createdBefore === 'string' ? req.query.createdBefore : '';
    const limit = parseInt(req.query.limit as string) || 12;

    let query = "mimeType='application/vnd.google-apps.document'";

    if (name) query += ` and name contains '${name}'`;
    if (createdAfter) query += ` and createdTime >= '${createdAfter}'`;
    if (createdBefore) query += ` and createdTime <= '${createdBefore}'`;

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, createdTime, thumbnailLink, webViewLink, mimeType)',
      orderBy: 'createdTime desc',
      pageSize: limit,
    });

    let docs = response.data.files || [];

    if (name) {
      const nameRegex = new RegExp(name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'); // Escape special characters
      docs = docs.filter((doc) => {
        const docName = doc.name?.trim();
        return docName && nameRegex.test(docName);
      });
    }

    res.status(200).json(docs);
  } catch (error) {
    console.error('Error searching for documents:', error);
    next(error);
  }
};
