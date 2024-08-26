document.addEventListener('DOMContentLoaded', () => {
  const addRowButton = document.getElementById('add-row');
  const tableRowsContainer = document.getElementById('table-rows');

  let rowCount = 1;

  function applyAutoResize(textarea) {
    textarea.style.height = textarea.scrollHeight + 'px';

    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  function addRow() {
    rowCount++;
    const newRow = document.createElement('div');
    newRow.className = 'table-row';
    newRow.innerHTML = `
      <h3>שורה ${rowCount}</h3>
      <label for="row${rowCount}cell1">מוצר:</label>
      <input type="text" name="rows[${rowCount - 1}][0]" required />

      <label for="row${rowCount}cell2">תיאור:</label>
      <textarea rows="4" type="text" name="rows[${rowCount - 1}][1]" required></textarea>

      <label for="row${rowCount}cell3">מחיר:</label>
      <input type="text" name="rows[${rowCount - 1}][2]" required />

      <button type="button" class="remove-row">למחוק שורה</button>
    `;
    tableRowsContainer.appendChild(newRow);

    // Apply auto-resize to the new textarea
    const newTextareas = newRow.querySelectorAll('textarea');
    newTextareas.forEach(applyAutoResize);

    // Attach remove functionality to the new row
    newRow.querySelector('.remove-row').addEventListener('click', () => {
      tableRowsContainer.removeChild(newRow);
      rowCount--;
    });
  }

  addRowButton.addEventListener('click', addRow);

  document.querySelectorAll('.remove-row').forEach((button) => {
    button.addEventListener('click', (event) => {
      const row = event.target.closest('.table-row');
      tableRowsContainer.removeChild(row);
      rowCount--;
    });
  });

  const existingTextareas = document.querySelectorAll('textarea');
  existingTextareas.forEach(applyAutoResize);
});

document.getElementById('document-form').addEventListener('submit', function (event) {
  const submitButton = document.getElementById('submit-button');
  submitButton.disabled = true;
  submitButton.textContent = 'יוצר מסמך...';
});
