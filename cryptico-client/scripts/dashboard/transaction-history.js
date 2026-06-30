/* ////// DOM ELEMENTS ////// */
const tbBody = document.querySelector(".tbody");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const startIdxSpan = document.getElementById('startIdx');
const endIdxSpan = document.getElementById('endIdx');
const totalEntriesSpan = document.getElementById('totalEntries');

const rowsPerPage = 5;
let currentPage = 1;

/* ////// PAGINATION ////// */
function showPage(page, rows) {
  const totalRows = rows.length;
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  rows.forEach((row, index) => {
    row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
  });

  startIdxSpan.textContent = totalRows === 0 ? 0 : startIndex + 1;
  endIdxSpan.textContent = Math.min(endIndex, totalRows);
  totalEntriesSpan.textContent = totalRows;
}

function updatePaginationButtons(rows) {
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const pgBtnsContainer = document.querySelector('.entries-buttons');
  pgBtnsContainer.innerHTML = '';

  // prev button
  prevBtn.style.display = currentPage > 1 ? 'block' : 'none';
  prevBtn.onclick = () => {
    currentPage--;
    showPage(currentPage, rows);
    updatePaginationButtons(rows);
  };

  // page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pgBtn = document.createElement('button');
    pgBtn.className = 'pg-btn';
    pgBtn.textContent = i;
    pgBtn.addEventListener('click', () => {
      currentPage = i;
      showPage(currentPage, rows);
      updatePaginationButtons(rows);
    });
    pgBtnsContainer.appendChild(pgBtn);
  }

  // next button
  nextBtn.style.display = currentPage < totalPages ? 'block' : 'none';
  nextBtn.onclick = () => {
    currentPage++;
    showPage(currentPage, rows);
    updatePaginationButtons(rows);
  };
}

/* ////// LOAD TRANSACTIONS ////// */
const loadTransactionHistory = async () => {
  try {
    const res = await fetch('/api/users/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // check ok BEFORE parsing
    if (!res.ok) {
      localStorage.clear();
      window.location.href = '/pages/login.html';
      return;
    }

    const data = await res.json();
    console.log('Transaction history data:', data);

    // filter only deposits
    const deposits = data.filter(t => t.type === 'deposit');

    // clear hardcoded rows
    tbBody.innerHTML = '';

    // handle empty state
    if (deposits.length === 0) {
      tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No deposits found</td></tr>';
      startIdxSpan.textContent = 0;
      endIdxSpan.textContent = 0;
      totalEntriesSpan.textContent = 0;
      return;
    }

    // build rows dynamically
    deposits.forEach((transaction, index) => {
      const tr = document.createElement('tr');
      tr.className = 'tr';
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>$${transaction.amount}</td>
        <td>${transaction.method}</td>
        <td>${transaction.status}</td>
        <td>${new Date(transaction.createdAt).toLocaleString()}</td>
      `;
      tbBody.appendChild(tr);
    });

    // query rows AFTER building them
    const rows = document.querySelectorAll('.tr');

    // initialize pagination with real rows
    showPage(currentPage, rows);
    updatePaginationButtons(rows);

  } catch (error) {
    console.error('Transaction history error:', error);
  }finally {
    const loader = document.getElementById('pageLoader');
    if (loader) loader.style.display = 'none';
  }
};

// call the function
loadTransactionHistory();