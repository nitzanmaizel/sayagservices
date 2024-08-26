import { docs_v1 } from 'googleapis';
import { DOC_STYLE_REQUESTS, INITIAL_TEXT } from '../constants/docStyleRequests';
import { createHeader } from './googleDocsHeader';
import { createFooter } from './googleDocsFooter';

/**
 * Creates a new Google Doc with the specified title.
 * @param {docs_v1.Docs} docs - The Google Docs API instance.
 * @param {string} title - The title of the new document.
 * @returns {Promise<{ docId?: string, docData?: docs_v1.Schema$Document, error?: any }>}
 *          - A promise that resolves to an object containing either the document ID and data, or an error.
 */
export async function createDoc(
  docs: docs_v1.Docs,
  title: string
): Promise<{ docId?: string; docData?: docs_v1.Schema$Document; error?: any }> {
  try {
    const createResponse = await docs.documents.create({ requestBody: { title } });
    const documentId = createResponse.data.documentId;

    if (documentId) {
      await initializeDocument(documentId, docs);

      const docResponse = await docs.documents.get({ documentId });
      await createHeader(documentId, docs);
      await createFooter(documentId, docs);
      return { docId: documentId, docData: docResponse.data };
    } else {
      throw new Error('Document ID not found in response');
    }
  } catch (error) {
    console.error('Error creating document:', error);
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
  const insertInitialTextRequest = [{ insertText: { location: { index: 1 }, text: INITIAL_TEXT } }];

  await updateDocById(docs, documentId, insertInitialTextRequest);
  await updateDocById(docs, documentId, DOC_STYLE_REQUESTS);
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
    console.error('Error retrieving document:', error);
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
    console.error('Error updating document:', error);
    return { error };
  }
}
