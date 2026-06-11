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


// Load Deposits
const loadDeposits = async () => {
    try {
        const res = await fetch('/api/admin/deposits', {
            headers: {
                Authorization: `Bearer ${Auth.getToken()}`
            }
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const data = await res.json();
        const depositData = data.allDeposits;

        console.log(depositData);

        tbBody.innerHTML = '';

        if (!depositData || depositData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No Deposit found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        depositData.forEach(deposits => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${deposits.user.fullName}</td>
                <td>${deposits.amount.toFixed(2)}</td>
                <td>${deposits.method}</td>
                <td>${deposits.status}</td>
                <td>${new Date(deposits.createdAt).toLocaleDateString()}</td>
                <td class="deposit-action">
                    ${deposits.proofImage ?
                    `<button class="deposit-action-view" id="openDepositModal" data-image="${deposits.proofImage}" >
                        <i class="fa-solid fa-eye"></i></button>` : ""}

                    ${deposits.status === "pending" ? `
                        <button class="deposit-action-confirm" data-id="${deposits._id}">Confirm</button>
                        ` : ""
                    }
                    <button class="deposit-action-del" data-id="${deposits._id}">Delete</button>
                </td>
            `;
            tbBody.appendChild(tr)
        })

        // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);

    } catch (error) {
        console.error("Error loading deposits", error)
    } finally {
        hideLoader();
    }
}

// Deposit Action buttons
const proofModal = document.getElementById("proofModal")
const closeDepositModal = document.getElementById("closeModal");
const depositImg = document.getElementById("proofImage")

tbBody.addEventListener("click", async (e) => {
    // View users deposit proof
    const modalBtn = e.target.closest(".deposit-action-view");
    if (modalBtn) {
        depositImg.src = modalBtn.dataset.image;
        proofModal.style.display = "flex";
        return;
    }

    // Confirm Deposits
    const confirmBtn = e.target.closest(".deposit-action-confirm");
    if (confirmBtn) {
        const depositId = confirmBtn.dataset.id;
        console.log("Confirm:", depositId);
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Processing...";

        try {
            const res = await fetch(`/api/admin/deposits/${depositId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({ status: "approved" })
            });

            const data = await res.json()
            if (!res.ok) {
                alert(data.message);
                return;
            }

            alert(data.message)
            loadDeposits();

        } catch (error) {
            console.error("Error comfirming deposit:", error)
        }

        return;
    }

    // Delete Deposits 
    const deleteBtn = e.target.closest(".deposit-action-del");
    if (deleteBtn) {
        const depositId = deleteBtn.dataset.id;
        const confirmDelete = confirm("Are you sure you want to delete this deposit?");
        if (!confirmDelete) return;

        deleteBtn.textContent = "Deleting...";
        deleteBtn.disabled = true;

        try {
            const res = await fetch(`/api/admin/deposits/${depositId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            })

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete deposit");
                return;
            }

            alert(data.message);
            loadDeposits()
        } catch (error) {
            console.error("Error deleting deposit", error)
        }
    }

});

closeDepositModal.addEventListener("click", () => {
    proofModal.style.display = 'none';
})

loadDeposits()