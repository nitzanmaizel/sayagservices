import { docs_v1 } from 'googleapis';
import { getTextRequest, updateDocById } from './googleDocsService';

interface TableCell {
  text: string;
  bold?: boolean;
  underline?: boolean;
}

interface TableRow {
  cells: TableCell[];
}

interface TableData {
  title: string;
  rows: TableRow[];
}

const date: string = getCurrentFormattedDate();

const PAGE_TITLE = `לכבוד:\n`;
const DATE_TITLE = `תאריך ההצעה: ${date}\n`;

/**
 * Function to create a table in a Google Doc
 * @param {string} documentId - The ID of the document
 * @param {docs_v1.Docs} docs - The Google Docs API instance
 * @param {TableData} tableData - The data to populate the table with
 * @param {number} index - The index to start inserting the table
 */
export async function createTable(
  documentId: string,
  docs: docs_v1.Docs,
  tableData: TableData = tableDataDefault,
  index: number = 1
): Promise<void> {
  let lastDocIndex = index;
  const pageTitle = PAGE_TITLE;

  const tableRows = tableData.rows.length;
  const tableColumns = tableData.rows[0].cells.length;

  try {
    const tableTitleText = [
      { text: DATE_TITLE, fontSize: 11, bold: false, direction: 'LEFT_TO_RIGHT' },
      { text: pageTitle, fontSize: 11, bold: false },
      { text: tableData.title, fontSize: 11, bold: false },
    ];

    const createTableTitleText = tableTitleText.flatMap(({ text, fontSize, bold, direction }) => {
      const startIndex = lastDocIndex;
      const endIndex = startIndex + text.length;
      lastDocIndex = endIndex;

      const textOptions = { fontSize, bold, direction };

      return getTextRequest('', startIndex, endIndex, text, textOptions);
    });

    const createTableRequest: docs_v1.Schema$Request[] = [
      {
        insertTable: { rows: tableRows, columns: tableColumns, location: { index: lastDocIndex } },
      },
    ];

    await updateDocById(docs, documentId, createTableTitleText);
    await updateDocById(docs, documentId, createTableRequest);

    const docResponse = await docs.documents.get({ documentId });
    const content = docResponse.data.body?.content;

    let tableElement: docs_v1.Schema$Table | null = null;
    let tableStartIndex: number | null = null;

    if (content) {
      for (let element of content) {
        if (element.table) {
          tableElement = element.table;
          tableStartIndex = element.startIndex!;
          break;
        }
      }
    }

    if (tableElement === null || tableStartIndex === null) {
      throw new Error('Table not found in document');
    }

    const cellIndices = tableElement.tableRows!.flatMap((row) =>
      row.tableCells!.map((cell) => cell.startIndex!)
    );

    const requests: docs_v1.Schema$Request[] = [];
    let adjustedIndices = [...cellIndices];

    tableData.rows.forEach((row, rowIndex) => {
      row.cells.forEach((cell, cellIndex) => {
        const cellStartIndex = adjustedIndices[rowIndex * tableColumns + cellIndex];
        const textInsertRequest: docs_v1.Schema$Request = {
          insertText: {
            location: {
              index: cellStartIndex + 1,
            },
            text: cell.text,
          },
        };
        requests.push(textInsertRequest);

        const defaultTextStyleRequest: docs_v1.Schema$Request = {
          updateTextStyle: {
            range: {
              startIndex: cellStartIndex + 1,
              endIndex: cellStartIndex + 1 + cell.text.length,
            },
            textStyle: {
              bold: false,
              underline: false,
            },
            fields: 'bold,underline',
          },
        };
        requests.push(defaultTextStyleRequest);

        if (cell.bold || cell.underline) {
          const textStyleRequest: docs_v1.Schema$Request = {
            updateTextStyle: {
              range: {
                startIndex: cellStartIndex + 1,
                endIndex: cellStartIndex + 1 + cell.text.length,
              },
              textStyle: {
                bold: cell.bold,
                underline: cell.underline,
              },
              fields: 'bold,underline',
            },
          };
          requests.push(textStyleRequest);
        }

        // Adjust the indices for subsequent insertions
        for (let j = rowIndex * tableColumns + cellIndex + 1; j < adjustedIndices.length; j++) {
          adjustedIndices[j] += cell.text.length;
        }
      });
    });

    await docs.documents.batchUpdate({
      documentId: documentId,
      requestBody: {
        requests: requests,
      },
    });

    console.log('Added styled table and text to the document.');
  } catch (error) {
    console.error('Error creating table:', (error as Error).message);
  }
}

export async function createTableCells(
  docs: docs_v1.Docs,
  documentId: string,
  tableCells: TableCell[],
  lastIndex: number
): Promise<number> {
  let internalLastIndex = lastIndex;
  const tableTextRequests: docs_v1.Schema$Request[] = tableCells.flatMap(
    ({ text, bold, underline }) => {
      const startIndex = internalLastIndex;
      const endIndex = startIndex + text.length + 2;
      internalLastIndex = endIndex;

      return [
        {
          insertText: { text, location: { index: startIndex } },
        },
        {
          updateTextStyle: {
            range: { startIndex, endIndex },
            textStyle: {
              fontSize: { magnitude: 11, unit: 'PT' },
              weightedFontFamily: { fontFamily: 'Arial' },
              bold,
              underline,
            },
            fields: 'fontSize,weightedFontFamily,bold,underline',
          },
        },
        {
          updateParagraphStyle: {
            range: { startIndex, endIndex },
            paragraphStyle: {
              direction: 'RIGHT_TO_LEFT',
              indentStart: { magnitude: 0, unit: 'PT' },
              indentEnd: { magnitude: 0, unit: 'PT' },
              indentFirstLine: {
                magnitude: 0,
                unit: 'PT',
              },
            },
            fields: 'direction,indentFirstLine,indentStart,indentEnd',
          },
        },
      ];
    }
  );

  await updateDocById(docs, documentId, tableTextRequests);
  internalLastIndex++;

  return internalLastIndex;
}

export function getCurrentFormattedDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear().toString().slice(-2);

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}

export const tableDataDefault: TableData = {
  title: 'מועדון האוהדים הפועל קטמון\n\n',
  rows: [
    {
      cells: [
        {
          text: 'מכונת קרח תוצרת איטליה חברת aristarco',
          bold: true,
          underline: true,
        },
        {
          text: 'דגם cp 40.15\nרוחב 50 ס"מ\nעומק 59 ס"מ\nגובה 69 ס"מ ללא רגליים\nפאזה 1\n40 קילו יצור ביממה\nתא אחסון 15 ק"ג\nכולל מרכך הובלה והרכבה',
          bold: false,
          underline: false,
        },
        {
          text: '6700 ש"ח לא כולל מע"מ',
          bold: false,
          underline: false,
        },
      ],
    },
    {
      cells: [
        {
          text: 'מכונת קרח תוצרת איטליה חברת aristarco',
          bold: true,
          underline: true,
        },
        {
          text: 'דגם cp 50.25\nרוחב 50 ס"מ\nעומק 59 ס"מ\nגובה 80 ס"מ ללא רגליים\nפאזה 1\n50 קילו יצור ביממה\nתא אחסון 25 ק"ג\nכולל מרכך הובלה והרכבה',
          bold: false,
          underline: false,
        },
        {
          text: '7800 ש"ח לא כולל מע"מ',
          bold: false,
          underline: false,
        },
      ],
    },
  ],
};
