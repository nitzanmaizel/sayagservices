export const INITIAL_TEXT = ' ';

export const DOC_STYLE_REQUESTS = [
  {
    updateDocumentStyle: {
      documentStyle: {
        marginTop: { magnitude: 10, unit: 'PT' },
        marginBottom: { magnitude: 0, unit: 'PT' },
        marginLeft: { magnitude: 18, unit: 'PT' },
        marginRight: { magnitude: 10, unit: 'PT' },
        marginHeader: { magnitude: 0, unit: 'PT' },
        marginFooter: { magnitude: 0, unit: 'PT' },
      },
      fields: 'marginTop,marginBottom,marginLeft,marginRight,marginHeader,marginFooter',
    },
  },
  {
    updateTextStyle: {
      range: { startIndex: 1, endIndex: INITIAL_TEXT.length + 1 },
      textStyle: {
        fontSize: { magnitude: 11, unit: 'PT' },
        weightedFontFamily: { fontFamily: 'Arial' },
        bold: true,
      },
      fields: 'fontSize,weightedFontFamily,bold',
    },
  },
  {
    updateParagraphStyle: {
      range: { startIndex: 1, endIndex: INITIAL_TEXT.length + 1 },
      paragraphStyle: {
        direction: 'RIGHT_TO_LEFT',
        indentFirstLine: { magnitude: 36, unit: 'PT' },
        indentStart: { magnitude: 0, unit: 'PT' },
        indentEnd: { magnitude: 0, unit: 'PT' },
      },
      fields: 'direction,indentFirstLine,indentStart,indentEnd',
    },
  },
];

export const docsTextStylesRequests = [
  {
    insertText: { text: '', location: { index: 1 } },
  },
  {
    updateTextStyle: {
      range: { startIndex: 1, endIndex: 1 },
      textStyle: {
        fontSize: { magnitude: 11, unit: 'PT' },
        weightedFontFamily: { fontFamily: 'Arial' },
      },
      fields: 'fontSize,weightedFontFamily,bold,underline',
    },
  },
  {
    updateParagraphStyle: {
      range: { startIndex: 1, endIndex: 1 },
      paragraphStyle: {
        direction: 'RIGHT_TO_LEFT',
        indentStart: { magnitude: 0, unit: 'PT' },
        indentEnd: { magnitude: 0, unit: 'PT' },
      },
      fields: 'direction,indentFirstLine,indentStart,indentEnd',
    },
  },
];
