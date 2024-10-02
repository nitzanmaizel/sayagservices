import { docs_v1 } from 'googleapis';
import { updateDocById } from './googleDocsService';
import { HeaderTextLine, imageUrl, tableCellStyle } from '../constants/docLayoutRequest';

/**
 * Main function to create a header in a Google Doc with specified styles
 * @param {string} documentId - The ID of the document to update
 * @param {docs_v1.Docs} docs - Google Docs API instance
 */
export async function createHeader(documentId: string, docs: docs_v1.Docs): Promise<void> {
  try {
    const headerId = await createHeaderSection(documentId, docs);

    await insertTable(documentId, docs, headerId);

    const { tableElement, tableStartIndex } = await getTableInfo(documentId, docs, headerId);
    const { leftCellStartIndex, rightCellStartIndex } = getCellIndices(tableElement);
    const docDirection = getDocumentDirection(tableElement);

    let logoIndex: number;
    let textIndex: number;
    const batchRequests: docs_v1.Schema$Request[] = [];

    if (docDirection === 'RIGHT_TO_LEFT') {
      textIndex = leftCellStartIndex + 1;
      const textInsert = prepareTextInsert(headerId, tableStartIndex, textIndex, docDirection);
      batchRequests.push(...textInsert.requests);
      const logoInsert = prepareLogoInsert(headerId, textInsert.index + 2, docDirection);
      batchRequests.push(...logoInsert);
    } else {
      logoIndex = leftCellStartIndex + 1;
      textIndex = rightCellStartIndex + 1;
      const textInsert = prepareTextInsert(headerId, tableStartIndex, textIndex, docDirection);
      batchRequests.push(...textInsert.requests);
      const logoInsert = prepareLogoInsert(headerId, logoIndex, docDirection);
      batchRequests.push(...logoInsert);
    }

    await updateDocById(docs, documentId, batchRequests);
  } catch (error) {
    throw new Error(`Failed to create header: ${error}`);
  }
}

/**
 * Creates a header section and returns the headerId
 * @param {string} documentId - The ID of the document
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @returns {Promise<string>} - The ID of the created header
 */
const createHeaderSection = async (documentId: string, docs: docs_v1.Docs): Promise<string> => {
  const response = await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests: [{ createHeader: { type: 'DEFAULT' } }] },
  });

  const headerId = response.data.replies?.[0].createHeader?.headerId;
  if (!headerId) {
    throw new Error('Header ID not found');
  }
  return headerId;
};

/**
 * Inserts a table into the header
 * @param {string} documentId - The ID of the document
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @param {string} headerId - The ID of the header
 */
const insertTable = async (
  documentId: string,
  docs: docs_v1.Docs,
  headerId: string
): Promise<void> => {
  const requests: docs_v1.Schema$Request[] = [
    {
      insertTable: {
        rows: 1,
        columns: 2,
        endOfSegmentLocation: { segmentId: headerId },
      },
    },
  ];

  await updateDocById(docs, documentId, requests);
};

/**
 * Retrieves the table element and its start index from the header
 * @param {string} documentId - The ID of the document
 * @param {docs_v1.Docs} docs - Google Docs API instance
 * @param {string} headerId - The ID of the header
 * @returns {Promise<{ tableElement: docs_v1.Schema$Table; tableStartIndex: number }>}
 */
const getTableInfo = async (
  documentId: string,
  docs: docs_v1.Docs,
  headerId: string
): Promise<{ tableElement: docs_v1.Schema$Table; tableStartIndex: number }> => {
  const docResponse = await docs.documents.get({ documentId });
  const content = docResponse.data.headers?.[headerId]?.content;

  if (!content) {
    throw new Error('Content not found in header');
  }

  for (const element of content) {
    if (element.table) {
      const table = element.table;
      const startIndex = element.startIndex;
      if (typeof startIndex === 'number') {
        return { tableElement: table, tableStartIndex: startIndex };
      } else {
        throw new Error('Table start index is undefined or not a number');
      }
    }
  }

  throw new Error('Table not found in header');
};

/**
 * Determines the document direction (LEFT_TO_RIGHT or RIGHT_TO_LEFT)
 * @param {docs_v1.Schema$Table} tableElement - The table element
 * @returns {string} - The direction of the document
 */
const getDocumentDirection = (tableElement: docs_v1.Schema$Table): string => {
  const firstCell = tableElement.tableRows?.[0]?.tableCells?.[0];
  const paragraph = firstCell?.content?.[0]?.paragraph;
  const direction = (paragraph?.paragraphStyle as any)?.direction;
  return direction === 'RIGHT_TO_LEFT' ? 'RIGHT_TO_LEFT' : 'LEFT_TO_RIGHT';
};

/**
 * Retrieves the start indices for the left and right cells
 * @param {docs_v1.Schema$Table} tableElement - The table element
 * @returns {{ leftCellStartIndex: number; rightCellStartIndex: number }}
 */
const getCellIndices = (
  tableElement: docs_v1.Schema$Table
): { leftCellStartIndex: number; rightCellStartIndex: number } => {
  const firstRow = tableElement.tableRows?.[0];
  if (!firstRow) {
    throw new Error('Table does not have any rows');
  }

  const tableCells = firstRow.tableCells;
  if (!tableCells || tableCells.length < 2) {
    throw new Error('Table does not have the required number of cells');
  }

  const leftCell = tableCells[0];
  const rightCell = tableCells[1];

  if (typeof leftCell.startIndex !== 'number' || typeof rightCell.startIndex !== 'number') {
    throw new Error('Cell start indices are undefined or not numbers');
  }

  return {
    leftCellStartIndex: leftCell.startIndex,
    rightCellStartIndex: rightCell.startIndex,
  };
};

/**
 * Prepares text insertion requests
 * @param {string} headerId - The ID of the header
 * @param {number} tableStartIndex - The start index of the table
 * @param {number} index - The insertion index
 * @param {string} docDirection - The direction of the document
 * @returns {{ requests: docs_v1.Schema$Request[]; index: number }}
 */
const prepareTextInsert = (
  headerId: string,
  tableStartIndex: number,
  index: number,
  docDirection: string
) => {
  const requests: docs_v1.Schema$Request[] = HeaderTextLine.flatMap(({ text, fontSize, bold }) => {
    const startIndex = index;
    const endIndex = startIndex + text.length;
    index = endIndex;

    return [
      {
        insertText: {
          location: { segmentId: headerId, index: startIndex },
          text: text,
        },
      },
      {
        updateTextStyle: {
          range: { segmentId: headerId, startIndex, endIndex },
          textStyle: {
            fontSize: { magnitude: fontSize, unit: 'PT' },
            weightedFontFamily: { fontFamily: 'Arial' },
            bold: bold,
          },
          fields: 'fontSize,weightedFontFamily,bold',
        },
      },
      {
        updateParagraphStyle: {
          range: { segmentId: headerId, startIndex, endIndex },
          paragraphStyle: {
            direction: docDirection,
            alignment: docDirection === 'RIGHT_TO_LEFT' ? 'START' : 'END',
            indentStart: { magnitude: 0, unit: 'PT' },
            indentEnd: { magnitude: 0, unit: 'PT' },
          },
          fields: 'direction,alignment,indentStart,indentEnd',
        },
      },
    ];
  });

  ['LEFT', 'RIGHT'].forEach((_, columnIndex) => {
    requests.push({
      updateTableCellStyle: {
        tableRange: {
          tableCellLocation: {
            tableStartLocation: { index: tableStartIndex, segmentId: headerId },
            rowIndex: 0,
            columnIndex: columnIndex,
          },
          rowSpan: 1,
          columnSpan: 1,
        },
        tableCellStyle: tableCellStyle,
        fields: 'borderBottom,borderTop,borderLeft,borderRight',
      },
    });
  });

  return { requests, index };
};

/**
 * Prepares logo insertion requests
 * @param {string} headerId - The ID of the header
 * @param {number} index - The insertion index
 * @param {string} direction - The direction of the document
 * @returns {docs_v1.Schema$Request[]}
 */
const prepareLogoInsert = (
  headerId: string,
  index: number,
  direction: string
): docs_v1.Schema$Request[] => {
  const requests: docs_v1.Schema$Request[] = [
    {
      insertInlineImage: {
        location: { segmentId: headerId, index },
        uri: imageUrl,
        objectSize: {
          height: { magnitude: 100, unit: 'PT' },
          width: { magnitude: 100, unit: 'PT' },
        },
      },
    },
  ];

  if (direction === 'RIGHT_TO_LEFT') {
    requests.push({
      updateParagraphStyle: {
        range: { segmentId: headerId, startIndex: index - 1, endIndex: index + 2 },
        paragraphStyle: {
          direction: 'RIGHT_TO_LEFT',
          alignment: 'END',
          indentStart: { magnitude: 0, unit: 'PT' },
          indentEnd: { magnitude: 0, unit: 'PT' },
        },
        fields: 'direction,alignment,indentStart,indentEnd',
      },
    });
  }

  return requests;
};
