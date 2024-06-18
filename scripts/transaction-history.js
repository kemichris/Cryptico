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
        pgBtn.addEventListener('click', function() {
            currentPage = i;
            showPage(currentPage);
            updatePaginationButtons();
        });
        pgBtnsContainer.appendChild(pgBtn);
    }

    if (currentPage > 1) {
        prevBtn.style.display = 'block';
        prevBtn.addEventListener('click', function() {
            currentPage--;
            showPage(currentPage);
            updatePaginationButtons();
        });
    } else {
        prevBtn.style.display = 'none';
    }
    
    if (currentPage < totalPages) {
        nextBtn.style.display = 'block';
        nextBtn.addEventListener('click', function() {
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
