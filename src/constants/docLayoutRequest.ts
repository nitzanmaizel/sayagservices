import { docs_v1 } from 'googleapis';

interface HeaderTextLine {
  text: string;
  fontSize: number;
  bold: boolean;
}

export interface TextOptions {
  fontSize: number;
  bold: boolean;
  borderTop?: docs_v1.Schema$ParagraphBorder; // Optional since it's conditionally used
  indentFirstLine?: docs_v1.Schema$Dimension;
  direction?: string;
}

interface TableCell {
  text: string;
  bold?: boolean;
  underline?: boolean;
}

export interface TableRow {
  cells: TableCell[];
}

export interface TableData {
  title: string;
  clientName: string;
  rows: TableRow[];
}

export const HeaderTextLine: HeaderTextLine[] = [
  { text: 'בס"ד\n', fontSize: 9, bold: true },
  { text: '\n', fontSize: 1, bold: false },
  { text: 'שירות סייג\n', fontSize: 12, bold: true },
  { text: '\n', fontSize: 1, bold: false },
  { text: 'שירות ומכירת מקררים, תנורים, מיקסרים\n', fontSize: 11, bold: true },
  { text: 'וכל כלי המטבח המוסדי וכל שירותי הגז.\n', fontSize: 11, bold: true },
  { text: '\n', fontSize: 11, bold: false },
  { text: 'ח.פ 326203031\n', fontSize: 11, bold: false },
  { text: 'כפיר סייג 054-9479566 \ncfiros1@gmail.com', fontSize: 11, bold: false },
];

// Define the types for the border styles and table cell styles
const borderStyle: docs_v1.Schema$TableCellBorder = {
  color: { color: { rgbColor: { red: 0, green: 0, blue: 0 } } },
  width: { magnitude: 1, unit: 'PT' },
  dashStyle: 'SOLID',
};

const noBorderStyle: docs_v1.Schema$TableCellBorder = {
  width: { magnitude: 0, unit: 'PT' },
  color: { color: { rgbColor: { red: 1, green: 1, blue: 1 } } },
  dashStyle: 'SOLID',
};

export const tableCellStyle: docs_v1.Schema$TableCellStyle = {
  borderBottom: borderStyle,
  borderTop: noBorderStyle,
  borderLeft: noBorderStyle,
  borderRight: noBorderStyle,
};

// Image URL for the logo
export const imageUrl =
  'https://raw.githubusercontent.com/nitzanmaizel/sayagservices-app/refs/heads/main/public/assets/logo.png';

export const FOOTER_TEXT = `
*תוקף ההצעה הינו ל30 יום.
*המחירים כוללים התקנה ואחריות לשנה.
*המחירים אינם כוללים מע"מ.
*התמונות להמחשה בלבד.
*ט.ל.ח.
*הקונה מאשר כי הבעלות לגבי הפריטים שנמכרו 
 תעבור אליו בעת סילוק התשלום האחרון בפועל

                                                                                            חתימת הלקוח:____________             תאריך החתימה:_______________
`;

export const FOOTER_TEXT_REQUESTS: docs_v1.Schema$Request[] = [
  {
    insertText: {
      location: { segmentId: '', index: 0 },
      text: '',
    },
  },
  {
    updateTextStyle: {
      range: { segmentId: '', startIndex: 0, endIndex: 0 },
      textStyle: {
        fontSize: { magnitude: 9, unit: 'PT' },
        weightedFontFamily: { fontFamily: 'Arial' },
        bold: true,
      },
      fields: 'fontSize,weightedFontFamily,bold',
    },
  },
  {
    updateParagraphStyle: {
      range: { segmentId: '', startIndex: 0, endIndex: 0 },
      paragraphStyle: {
        direction: 'RIGHT_TO_LEFT',
        indentFirstLine: { magnitude: 8, unit: 'PT' },
        indentStart: { magnitude: 0, unit: 'PT' },
        indentEnd: { magnitude: 0, unit: 'PT' },
        spaceBelow: { magnitude: 0, unit: 'PT' },
        spaceAbove: { magnitude: 0, unit: 'PT' },
      },
      fields: 'direction,indentFirstLine,indentStart,indentEnd,spaceBelow,spaceAbove',
    },
  },
  {
    updateDocumentStyle: {
      documentStyle: { marginBottom: { magnitude: 0, unit: 'PT' } },
      fields: 'marginBottom',
    },
  },
];

export const tableDataDefault: TableData = {
  title: 'הצעת מחיר',
  clientName: 'מועדון האוהדים הפועל קטמון\n\n',
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
