import { docs_v1 } from 'googleapis';
import { updateDocById } from './googleDocsService';
import { FOOTER_TEXT, FOOTER_TEXT_REQUESTS } from '../constants/docLayoutRequest';

type DocsAPI = docs_v1.Docs;

/**
 * Function to create a footer in a Google Doc with specified styles
 * @param {string} documentId - The ID of the document to update
 * @param {DocsAPI} docs - Google Docs API instance
 */
export async function createFooter(documentId: string, docs: DocsAPI): Promise<void> {
  const createFooterRequests: docs_v1.Schema$Request[] = [{ createFooter: { type: 'DEFAULT' } }];

  const createFooterResponse = await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests: createFooterRequests },
  });

  const footerId = createFooterResponse.data.replies?.[0]?.createFooter?.footerId;

  if (!footerId) {
    throw new Error('Failed to create footer.');
  }

  const footerTextRequests = getFooterTextRequests(footerId, FOOTER_TEXT);

  await updateDocById(docs, documentId, footerTextRequests);
}

/**
 * Function to get the footer text requests
 * @param {string} footerId - The ID of the footer to update
 * @param {string} footerText - The text to insert into the footer
 * @returns {docs_v1.Schema$Request[]} - Returns an array of requests to update the footer text
 */
export function getFooterTextRequests(
  footerId: string,
  footerText: string
): docs_v1.Schema$Request[] {
  return FOOTER_TEXT_REQUESTS.map((request) => {
    if (request.insertText) {
      request.insertText.location!.segmentId = footerId;
      request.insertText.text = footerText;
    }
    if (request.updateTextStyle) {
      request.updateTextStyle.range!.segmentId = footerId;
      request.updateTextStyle.range!.endIndex = footerText.length;
    }
    if (request.updateParagraphStyle) {
      request.updateParagraphStyle.range!.segmentId = footerId;
      request.updateParagraphStyle.range!.endIndex = footerText.length;
    }
    return request;
  });
}
