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

  await insertTable(documentId, docs, headerId);

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

  let docDirection: string = 'LEFT_TO_RIGHT';

  for (const element of content) {
    if (element.paragraph && (element.paragraph.paragraphStyle as any).direction) {
      docDirection = (element.paragraph.paragraphStyle as any).direction;
      break;
    }
  }

  let leftCellIndex = 1;
  let rightCellIndex = 0;

  if (docDirection === 'LEFT_TO_RIGHT') {
    leftCellIndex = 0;
    rightCellIndex = 1;
  }

  const rightCellStartIndex = cellIndices[rightCellIndex];
  const leftCellStartIndex = cellIndices[leftCellIndex];

  let index = docDirection === 'RIGHT_TO_LEFT' ? rightCellStartIndex + 1 : leftCellStartIndex + 1;

  if (docDirection === 'RIGHT_TO_LEFT') {
    let { index: updatedIndex, requests } = insertText(headerId, tableStartIndex, index);
    await updateDocById(docs, documentId, requests);
    await insertLogo(documentId, docs, headerId, updatedIndex, docDirection);
  } else {
    await insertLogo(documentId, docs, headerId, index, docDirection);
    index += 3;
    const { requests } = await insertText(headerId, tableStartIndex, index);
    await updateDocById(docs, documentId, requests);
  }
}

const insertTable = async (documentId: string, docs: docs_v1.Docs, headerId: string) => {
  const insertTable: docs_v1.Schema$Request[] = [
    { insertTable: { rows: 1, columns: 2, endOfSegmentLocation: { segmentId: headerId } } },
  ];

  await updateDocById(docs, documentId, insertTable);
};

const insertLogo = async (
  documentId: string,
  docs: docs_v1.Docs,
  headerId: string,
  index: number,
  direction: string
): Promise<void> => {
  const insertLogo: docs_v1.Schema$Request[] = [
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

  await updateDocById(docs, documentId, insertLogo);

  if (direction === 'RIGHT_TO_LEFT') {
    const updateLogoStyle: docs_v1.Schema$Request[] = [
      {
        updateParagraphStyle: {
          range: { segmentId: headerId, startIndex: index - 1, endIndex: index + 2 },
          paragraphStyle: {
            direction: 'RIGHT_TO_LEFT',
            indentStart: { magnitude: 0, unit: 'PT' },
            indentEnd: { magnitude: 0, unit: 'PT' },
            alignment: 'END',
          },
          fields: 'direction,indentStart,indentEnd,alignment',
        },
      },
    ];

    await updateDocById(docs, documentId, updateLogoStyle);
  }
};

const insertText = (headerId: string, tableStartIndex: number, index: number) => {
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

  index += 2;

  return {
    requests,
    index,
  };
};
