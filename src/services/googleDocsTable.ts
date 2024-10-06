import { docs_v1 } from 'googleapis';
import { getTextRequest, updateDocById } from './googleDocsService';
import { TableData } from '../constants/docLayoutRequest';
import { getCurrentFormattedDate } from '../utils/docsUtils';

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
  tableData: TableData,
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
      { text: tableData.clientName + '\n', fontSize: 11, bold: false },
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
            location: { index: cellStartIndex + 1 },
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

        for (let j = rowIndex * tableColumns + cellIndex + 1; j < adjustedIndices.length; j++) {
          adjustedIndices[j] += cell.text.length;
        }
      });
    });

    await updateDocById(docs, documentId, requests);
  } catch (error) {
    console.error('Error creating table:', (error as Error).message);
  }
}
