const tbBody = document.querySelector(".tbody");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");
const startIdxSpan = document.getElementById("startIdx");
const endIdxSpan = document.getElementById("endIdx");
const totalEntriesSpan = document.getElementById("totalEntries");

const rowsPerPage = 5;
let currentPage = 1;

/* ////// PAGINATION ////// */
function showPage(page, rows) {
    const totalRows = rows.length;
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    rows.forEach((row, index) => {
        row.style.display = index >= startIndex && index < endIndex ? "" : "none";
    });

    startIdxSpan.textContent = totalRows === 0 ? 0 : startIndex + 1;
    endIdxSpan.textContent = Math.min(endIndex, totalRows);
    totalEntriesSpan.textContent = totalRows;
}

function updatePaginationButtons(rows) {
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const pgBtnsContainer = document.querySelector(".entries-buttons");
    pgBtnsContainer.innerHTML = "";

    // prev button
    prevBtn.style.display = currentPage > 1 ? "block" : "none";
    prevBtn.onclick = () => {
        currentPage--;
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    };

    // page number buttons
    for (let i = 1; i <= totalPages; i++) {
        const pgBtn = document.createElement("button");
        pgBtn.className = "pg-btn";
        pgBtn.textContent = i;
        pgBtn.addEventListener("click", () => {
            currentPage = i;
            showPage(currentPage, rows);
            updatePaginationButtons(rows);
        });
        pgBtnsContainer.appendChild(pgBtn);
    }

    // next button
    nextBtn.style.display = currentPage < totalPages ? "block" : "none";
    nextBtn.onclick = () => {
        currentPage++;
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    };
}

// Get all KYC applications
const getKycApplications = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/kyc`, {
            headers: { Authorization: `Bearer ${Auth.getToken()}` },
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }
        const kycData = await res.json();

        tbBody.innerHTML = "";

        if (!kycData || kycData.length === 0) {
            tbBody.innerHTML =
                '<tr><td colspan="5" style="text-align:center">No KYC Application</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        kycData.forEach((kyc) => {
            const tr = document.createElement("tr");
            tr.className = "tr";
            tr.innerHTML = `
                <td>${kyc.user.fullName}</td>
                <td>${kyc.applicationStatus}</td>
                <td class="deposit-action"><button class="table-action-confirm view-application" data-id="${kyc._id}">View Application</button></td>
            `;

            tbBody.appendChild(tr);
        });

        const rows = document.querySelectorAll(".tr");
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    } catch (error) {
        console.error("Error loading deposits", error);
    } finally {
        hideLoader();
    }
};


// handle manage button click using event delegation
tbBody.addEventListener('click', (e) => {
    const viewApplicationBtn = e.target.closest('.view-application');

    if (viewApplicationBtn) {
        const applicationId = viewApplicationBtn.dataset.id;
        sessionStorage.setItem("kycId", applicationId);
        window.location.href = `/admin/kyc-application.html?id=${applicationId}`;
    }
});

getKycApplications()
