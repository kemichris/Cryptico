const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || !user) {
    window.location.href = '/pages/login.html';
}


/* ////// LOAD TRANSACTION HISTORY DATA ////// */

const loadTransactionHistory = async () => {
    try {
        // fetch transaction history data
        const res = await fetch('/api/users/transactions', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json()
        console.log('transaction history data:', data);

        if (!res.ok) {
            localStorage.clear();
            window.location.href = '/pages/login.html';
            return;
        }

        // after getting data, filter only deposits
        const deposits = data.filter(t => t.type === 'deposit');

        // clear the hardcoded rows from tbody
        tbBody.innerHTML = '';

        // check if no transactions yet
        if (deposits.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5">No deposits found</td></tr>';
            return;
        }

        // loop through and build rows
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


    } catch (error) {
        console.error('Transaction history error:', error);
    }
}

// Transaction history pagination 
const rows = document.querySelectorAll(".tr");
const tbBody = document.querySelector(".tbody");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const pgBtn = document.querySelector(".pg-btn");

const startIdxSpan = document.getElementById('startIdx');
const endIdxSpan = document.getElementById('endIdx');
const totalEntriesSpan = document.getElementById('totalEntries');

const rowsPerPage = 5;

let currentPage = 1;

const totalRows = rows.length;


function showPage(page) {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    rows.forEach((row, index) => {
        if (index >= startIndex && index < endIndex) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    startIdxSpan.textContent = startIndex + 1;
    endIdxSpan.textContent = Math.min(endIndex, totalRows);
    totalEntriesSpan.textContent = totalRows;
}

function updatePaginationButtons() {
    const pgBtnsContainer = document.querySelector('.entries-buttons');
    pgBtnsContainer.innerHTML = '';

    const totalPages = Math.ceil(totalRows / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const pgBtn = document.createElement('button');
        pgBtn.className = 'pg-btn';
        pgBtn.textContent = i;
        pgBtn.addEventListener('click', function () {
            currentPage = i;
            showPage(currentPage);
            updatePaginationButtons();
        });
        pgBtnsContainer.appendChild(pgBtn);
    }

    if (currentPage > 1) {
        prevBtn.style.display = 'block';
        prevBtn.addEventListener('click', function () {
            currentPage--;
            showPage(currentPage);
            updatePaginationButtons();
        });
    } else {
        prevBtn.style.display = 'none';
    }

    if (currentPage < totalPages) {
        nextBtn.style.display = 'block';
        nextBtn.addEventListener('click', function () {
            currentPage++;
            showPage(currentPage);
            updatePaginationButtons();
        });
    } else {
        nextBtn.style.display = 'none';
    }
}

showPage(currentPage);
updatePaginationButtons();
