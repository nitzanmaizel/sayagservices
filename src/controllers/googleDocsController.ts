import { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
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
    oAuth2Client.setCredentials(req.session.tokens);
    const docs = google.docs({ version: 'v1', auth: oAuth2Client });
    // const { title } = req.body;
    const title = 'New Document';

    const result = await createDoc(docs, title);
    if (result.error) {
      throw new Error(result.error);
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
 * @returns {Promise<Response>} - A promise that resolves to an Express response object.
 */
export async function getDocRoute(req: Request, res: Response): Promise<Response> {
  const docs = google.docs({ version: 'v1', auth: oAuth2Client });
  const { documentId } = req.params;

  const result = await getDocById(docs, documentId);
  if (result.error) {
    return res.status(500).json({ error: result.error });
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
