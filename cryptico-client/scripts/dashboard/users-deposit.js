/* ////// DEPOSIT POPUP ELEMENTS ////// */
const newDepositBtn = document.querySelector(".new-deposit-btn");
const depositPopup = document.querySelector(".deposit-popup");
const closeDepositPopup = document.querySelector(".close-deposit-popup");
const depositAmountInput = document.getElementById("depositAmount");
const continueBtn = document.getElementById("cnt-btn");
const tbBody = document.querySelector(".tbody");

const startIdxSpan = document.getElementById('startIdx');
const endIdxSpan = document.getElementById('endIdx');
const totalEntriesSpan = document.getElementById('totalEntries');
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

const rowsPerPage = 5;
let currentPage = 1;

/* ////// POPUP OPEN AND CLOSE ////// */

// open popup when new deposit button is clicked
newDepositBtn.addEventListener("click", () => {
    depositPopup.classList.remove("inactive");
});

// close popup when X is clicked
closeDepositPopup.addEventListener("click", () => {
    depositPopup.classList.add("inactive");
});

/* ////// CONTINUE BUTTON — SAVE AMOUNT AND REDIRECT ////// */
continueBtn.addEventListener("click", () => {
    const amount = depositAmountInput.value;

    // validate amount before proceeding
    if (!amount || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    // save amount to localStorage so payment page can access it
    localStorage.setItem("depositAmount", amount);

    // redirect to payment page
    window.location.href = "/dashboard/users-payment.html";
});

/* ////// LOAD DEPOSIT HISTORY FROM API ////// */
const loadDeposits = async () => {
    try {
        // fetch all transactions for this user
        const res = await fetch(`${API_URL}/api/users/transactions`, {
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });

        // if token expired or invalid redirect to login
        if (!res.ok) {
            localStorage.clear();
            window.location.href = '/pages/login.html';
            return;
        }

        const transactions = await res.json();

        // filter only deposit transactions
        const deposits = transactions.filter(t => t.type === 'deposit');

        // clear hardcoded placeholder rows from HTML
        tbBody.innerHTML = '';

        // handle empty state — no deposits yet
        if (deposits.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No deposits yet</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        // loop through deposits and build table rows dynamically
        deposits.forEach((deposit, index) => {
            const tr = document.createElement('tr');
            tr.className = 'tr';
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>$${deposit.amount}</td>
                <td>${deposit.method}</td>
                <td>${deposit.status}</td>
                <td>${new Date(deposit.createdAt).toLocaleString()}</td>
            `;
            tbBody.appendChild(tr);
        });

        // query rows AFTER building them — they now exist in the DOM
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);

    } catch (error) {
        console.error('Load deposits error:', error);
    }finally {
    // ALWAYS runs — hide loader and show content
    // whether fetch succeeded or failed
    const loader = document.getElementById('pageLoader');
    const content = document.getElementById('dashboardContent');

    if (loader) loader.style.display = 'none';
    if (content) {
      content.classList.remove('invisible');
      content.classList.add('visible');
    }
  }
};

/* ////// PAGINATION — SHOW CORRECT ROWS FOR CURRENT PAGE ////// */
function showPage(page, rows) {
    const totalRows = rows.length;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    // show only rows for current page, hide the rest
    rows.forEach((row, index) => {
        row.style.display = (index >= startIndex && index < endIndex) ? '' : 'none';
    });

    // update entries counter text
    startIdxSpan.textContent = totalRows === 0 ? 0 : startIndex + 1;
    endIdxSpan.textContent = Math.min(endIndex, totalRows);
    totalEntriesSpan.textContent = totalRows;
}

/* ////// PAGINATION — BUILD PAGE NUMBER BUTTONS ////// */
function updatePaginationButtons(rows) {
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pgBtnsContainer = document.querySelector('.entries-buttons');

    // clear existing buttons before rebuilding
    pgBtnsContainer.innerHTML = '';

    // show prev button only if not on first page
    prevBtn.style.display = currentPage > 1 ? 'block' : 'none';
    prevBtn.onclick = () => {
        currentPage--;
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    };

    // build a button for each page
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

    // show next button only if not on last page
    nextBtn.style.display = currentPage < totalPages ? 'block' : 'none';
    nextBtn.onclick = () => {
        currentPage++;
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    };
}

// call on page load to fetch and display deposits
loadDeposits();