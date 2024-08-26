import { google } from 'googleapis';
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

    res.status(201).json({ docId: result.docId, docData: result.docData });
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
    return next(result.error); // Pass the error to the global error handler
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
