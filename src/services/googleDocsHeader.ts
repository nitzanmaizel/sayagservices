import { docs_v1 } from 'googleapis';
import { updateDocById } from './googleDocsService';
import { HeaderTextLine, imageUrl, tableCellStyle } from '../constants/docLayoutRequest';

/**
 * Function to create a header in a Google Doc with specified styles
 * @param {string} documentId - The ID of the document to update
 * @param {docs_v1.Docs} docs - Google Docs API instance
 */
export async function createHeader(documentId: string, docs: docs_v1.Docs): Promise<void> {
  const createHeaderResponse = await docs.documents.batchUpdate({
    documentId,
    requestBody: { requests: [{ createHeader: { type: 'DEFAULT' } }] },
  });

  const headerId = createHeaderResponse.data.replies?.[0].createHeader?.headerId;

  if (!headerId) {
    throw new Error('Header ID not found');
  }

  const insertTable: docs_v1.Schema$Request[] = [
    { insertTable: { rows: 1, columns: 2, endOfSegmentLocation: { segmentId: headerId } } },
  ];

  await updateDocById(docs, documentId, insertTable);

  const docResponse = await docs.documents.get({ documentId });
  const content = docResponse.data.headers?.[headerId]?.content;

  if (!content) {
    throw new Error('Content not found in document');
  }

  let tableElement: docs_v1.Schema$Table | null = null;
  let tableStartIndex: number | null = null;

  for (let element of content) {
    if (element.table) {
      tableElement = element.table;
      tableStartIndex = element.startIndex || null;
      break;
    }
  }

  if (tableElement === null || tableStartIndex === null) {
    throw new Error('Table not found in document');
  }

  const cellIndices = tableElement.tableRows!.flatMap((row) =>
    row.tableCells!.map((cell) => cell.startIndex!)
  );

  const insertLogo: docs_v1.Schema$Request[] = [
    {
      insertInlineImage: {
        location: { segmentId: headerId, index: cellIndices[0] + 1 },
        uri: imageUrl,
        objectSize: {
          height: { magnitude: 100, unit: 'PT' },
          width: { magnitude: 100, unit: 'PT' },
        },
      },
    },
  ];

  await updateDocById(docs, documentId, insertLogo);

  let index = 7;

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
            direction: 'RIGHT_TO_LEFT',
            indentStart: { magnitude: 0, unit: 'PT' },
            indentEnd: { magnitude: 0, unit: 'PT' },
          },
          fields: 'direction,indentStart,indentEnd',
        },
      },
    ];
  });

  requests.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: tableStartIndex, segmentId: headerId },
          rowIndex: 0,
          columnIndex: 0,
        },
        rowSpan: 1,
        columnSpan: 1,
      },
      tableCellStyle: tableCellStyle,
      fields: 'borderBottom,borderTop,borderLeft,borderRight',
    },
  });

  requests.push({
    updateTableCellStyle: {
      tableRange: {
        tableCellLocation: {
          tableStartLocation: { index: tableStartIndex, segmentId: headerId },
          rowIndex: 0,
          columnIndex: 1,
        },
        rowSpan: 1,
        columnSpan: 1,
      },
      tableCellStyle: tableCellStyle,
      fields: 'borderBottom,borderTop,borderLeft,borderRight',
    },
  });

  await updateDocById(docs, documentId, requests);
}
