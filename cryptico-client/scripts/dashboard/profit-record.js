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

// Load profit record
const LoadProfitRecord = async () => {
    try {
        const res = await fetch(`${API_URL}/api/users/investments`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const invData = await res.json()
        console.log(invData)

        tbBody.innerHTML = ""
        // handle empty state
        if (!invData || invData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No profit record found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        invData.forEach((inv, index) => {
            const tr = document.createElement("tr");
            tr.className = "tr"
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${inv.amountInvested}</td>
                <td>${inv.plan.name}</td>
                <td>${inv.totalExpectedReturn}</td>
                <td>${inv.status}</td>
                <td>${new Date(inv.createdAt).toLocaleString()}</td>
            `;

            tbBody.appendChild(tr)

        });

        // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);


    } catch (error) {
        console.error(error)
    }
}

LoadProfitRecord()