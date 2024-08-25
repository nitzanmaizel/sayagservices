import { docs_v1 } from 'googleapis';
import { DOC_STYLE_REQUESTS, INITIAL_TEXT } from '../constants/docStyleRequests';

/**
 * Function to create a new Google Doc
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @param {string} title - Title of the document to create
 * @returns {Promise<{ docId?: string, docData?: docs_v1.Schema$Document, error?: any }>}
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
 * Function to initialize a Google Doc with initial text and styles
 * @param {string} documentId - The ID of the document to initialize
 * @param {docs_v1.Docs} docs - Google Docs API instance
 */
export async function initializeDocument(documentId: string, docs: docs_v1.Docs): Promise<void> {
  const insertInitialTextRequest = [{ insertText: { location: { index: 1 }, text: INITIAL_TEXT } }];

  await updateDocById(docs, documentId, insertInitialTextRequest);
  await updateDocById(docs, documentId, DOC_STYLE_REQUESTS);
}

/**
 * Function to get a Google Doc by its ID
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @param {string} documentId - The ID of the document to retrieve
 * @returns {Promise<{ docData?: docs_v1.Schema$Document, error?: any }>}
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
 * Function to update a Google Doc by its ID with specified requests
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @param {string} documentId - The ID of the document to update
 * @param {docs_v1.Schema$Request[]} requests - Array of update requests to apply to the document
 * @returns {Promise<docs_v1.Schema$Document>}
 */
export async function updateDocById(
  docs: docs_v1.Docs,
  documentId: string,
  requests: docs_v1.Schema$Request[]
): Promise<docs_v1.Schema$Document> {
  try {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests },
    });

    const docResponse = await docs.documents.get({ documentId });
    return docResponse.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Error updating document');
  }
}
