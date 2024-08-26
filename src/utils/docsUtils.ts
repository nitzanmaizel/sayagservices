export function normalizeLineBreaks(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

export function getCurrentFormattedDate() {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear().toString().slice(-2);

  const formattedDate = `${day}/${month}/${year}`;
  return formattedDate;
}
