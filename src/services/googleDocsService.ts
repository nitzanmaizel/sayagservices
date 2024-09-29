import { docs_v1 } from 'googleapis';
import { createHeader } from './googleDocsHeader';
import { createFooter } from './googleDocsFooter';
import { createTable } from './googleDocsTable';
import { TableData, TextOptions } from '../constants/docLayoutRequest';
import { DOC_STYLE_REQUESTS, INITIAL_TEXT } from '../constants/docStyleRequests';

/**
 * Creates a new Google Doc with the specified title.
 * @param {docs_v1.Docs} docs - The Google Docs API instance.
 * @param {string} title - The title of the new document.
 * @returns {Promise<{ docId?: string, docData?: docs_v1.Schema$Document, error?: any }>}
 *          - A promise that resolves to an object containing either the document ID and data, or an error.
 */

export async function createDocServices(
  docs: docs_v1.Docs,
  tableData: TableData
): Promise<{ docId?: string; docData?: docs_v1.Schema$Document; error?: any }> {
  try {
    const createResponse = await docs.documents.create({ requestBody: { title: tableData.title } });
    const documentId = createResponse.data.documentId;

    if (!documentId) {
      throw new Error('Document ID not found in response');
    }

    await initializeDocument(documentId, docs);

    const docResponse = await docs.documents.get({ documentId });
    await createHeader(documentId, docs);
    await createTable(documentId, docs, tableData);
    await createFooter(documentId, docs);
    return { docId: documentId, docData: docResponse.data };
  } catch (error) {
    return { error };
  }
}

/**
 * Initializes a Google Doc with initial text and styles.
 * @param {string} documentId - The ID of the document to initialize.
 * @param {docs_v1.Docs} docs - The Google Docs API instance.
 * @returns {Promise<void>} - A promise that resolves when the document is initialized.
 */
export async function initializeDocument(documentId: string, docs: docs_v1.Docs): Promise<void> {
  try {
    const insertInitialTextRequest = [
      { insertText: { location: { index: 1 }, text: INITIAL_TEXT } },
    ];

    await updateDocById(docs, documentId, insertInitialTextRequest);
    await updateDocById(docs, documentId, DOC_STYLE_REQUESTS);
  } catch (error) {
    throw new Error('Error initializing document: ' + error);
  }
}

/**
 * Retrieves a Google Doc by its ID.
 * @param {docs_v1.Docs} docs - The Google Docs API instance.
 * @param {string} documentId - The ID of the document to retrieve.
 * @returns {Promise<{ docData?: docs_v1.Schema$Document, error?: any }>}
 *          - A promise that resolves to an object containing either the document data, or an error.
 */
export async function getDocById(
  docs: docs_v1.Docs,
  documentId: string
): Promise<{ docData?: docs_v1.Schema$Document; error?: any }> {
  try {
    const docResponse = await docs.documents.get({ documentId });
    return { docData: docResponse.data };
  } catch (error) {
    return { error };
  }
}

/**
 * Updates a Google Doc by its ID with specified requests.
 * @param {docs_v1.Docs} docs - The Google Docs API instance.
 * @param {string} documentId - The ID of the document to update.
 * @param {docs_v1.Schema$Request[]} requests - Array of update requests to apply to the document.
 * @returns {Promise<{ docData?: docs_v1.Schema$Document, error?: any }>}
 *          - A promise that resolves to an object containing either the updated document data, or an error.
 */
export async function updateDocById(
  docs: docs_v1.Docs,
  documentId: string,
  requests: docs_v1.Schema$Request[]
): Promise<{ docData?: docs_v1.Schema$Document; error?: any }> {
  try {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    const docResponse = await docs.documents.get({ documentId });
    return { docData: docResponse.data };
  } catch (error) {
    return { error };
  }
}

/**
 * Function to generate Google Docs API requests for inserting text and applying styles
 * @param {string} segmentId - The segment ID for the text insertion
 * @param {number} startIndex - The starting index for the text insertion
 * @param {number} endIndex - The ending index for the text styling
 * @param {string} text - The text to insert
 * @param {TextOptions} textOptions - Options for styling the inserted text
 * @returns {docs_v1.Schema$Request[]} - Array of requests to be sent to the Google Docs API
 */
export function getTextRequest(
  segmentId: string,
  startIndex: number,
  endIndex: number,
  text: string,
  textOptions: TextOptions
): docs_v1.Schema$Request[] {
  const { fontSize, bold, borderTop, indentFirstLine, direction } = textOptions;

  return [
    {
      insertText: {
        location: { segmentId, index: startIndex },
        text,
      },
    },
    {
      updateTextStyle: {
        range: { segmentId, startIndex, endIndex },
        textStyle: {
          fontSize: { magnitude: fontSize, unit: 'PT' },
          weightedFontFamily: { fontFamily: 'Arial' },
          bold,
        },
        fields: 'fontSize,weightedFontFamily,bold',
      },
    },
    {
      updateParagraphStyle: {
        range: { segmentId, startIndex, endIndex },
        paragraphStyle: {
          direction: direction || 'RIGHT_TO_LEFT',
          indentFirstLine: indentFirstLine || { magnitude: 8, unit: 'PT' },
          indentStart: { magnitude: 0, unit: 'PT' },
          indentEnd: { magnitude: 0, unit: 'PT' },
          borderTop: borderTop,
        },
        fields: 'direction,indentFirstLine,indentStart,indentEnd' + (borderTop ? ',borderTop' : ''),
      },
    },
  ];
}
