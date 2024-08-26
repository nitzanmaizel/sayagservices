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

interface TableRow {
  cells: TableCell[];
}

export interface TableData {
  title: string;
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
  'https://lh7-rt.googleusercontent.com/docsz/AD_4nXebORZIKvNMehl4ZphXdLTdl1dg6XpzuzyYSfgkb0U57nfZOh5upRwAq72D83fGC6j-F_0Llbqv_pLnHyvprbjklM6KeTKzpige2fkcu-A84b42ecmrVy9m-YRT7MM_qoMB1rzHd8JCQ8MDF4Ny258Gy_Mg?key=JcXWS5OTYPn8wwxsKjAV8w';

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
