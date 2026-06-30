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


// Load Withdrawals
const loadWithdrawals = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/withdrawals`, {
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
        const withdrawalData = data.allWithdrawals;

        console.log(withdrawalData);

        tbBody.innerHTML = '';

        if (!withdrawalData || withdrawalData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No Withdrawal found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        withdrawalData.forEach(withdrawal => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${withdrawal.user.fullName}</td>
                <td>${withdrawal.amount.toFixed(2)}</td>
                <td>${withdrawal.method}</td>
                <td>${withdrawal.status}</td>
                <td>${new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                <td class="deposit-action">
                    ${withdrawal.status === "pending" ? `
                        <button class="table-action-confirm" data-id="${withdrawal._id}">Confirm</button>
                        <button class="table-action-reject" data-id="${withdrawal._id}">Reject</button>
                        ` : ""
                    }
                    <button class="table-action-del" data-id="${withdrawal._id}">Delete</button>
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

tbBody.addEventListener("click", async (e)=>{
    // Confirm Withdrawals
    const confirmBtn = e.target.closest(".table-action-confirm");
    if (confirmBtn) {
        const withdrawalId = confirmBtn.dataset.id;
        confirmBtn.disabled = true;
        confirmBtn.textContent = "Processing...";

        try {
            const res = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({ status: "approved" })
            });

            const data = await res.json()
            if (!res.ok) {
               showToast(data.message);;
                return;
            }

            showToast(data.message);
            loadWithdrawals();

        } catch (error) {
            console.error("Error comfirming withdrawal:", error)
        }
        return;
    }

    // Reject withdrawal 
    const rejectBtn = e.target.closest(".table-action-reject")
    if (rejectBtn) {
        const withdrawalId = rejectBtn.dataset.id;
        rejectBtn.disabled = true;
        rejectBtn.textContent = "Processing...";

        try {
            const res = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Auth.getToken()}`
                },
                body: JSON.stringify({ status: "rejected" })
            });

            const data = await res.json()
            if (!res.ok) {
               showToast(data.message);;
                return;
            }

            showToast(data.message);
            loadWithdrawals();

        } catch (error) {
            console.error("Error Rejecting withdrawal:", error)
        }
        return;
    }

    // Delete withdrawals 
    const deleteBtn = e.target.closest(".table-action-del");
    if (deleteBtn) {
        const depositId = deleteBtn.dataset.id;
        const confirmed = await showConfirm(
            "Are you sure you want to delete this withdrawal?"
        );

        if (!confirmed) return;

        deleteBtn.textContent = "Deleting...";
        deleteBtn.disabled = true;

        try {
            const res = await fetch(`${API_URL}/api/admin/deposits/${depositId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            })

            const data = await res.json();

            if (!res.ok) {
                alert(data.message || "Failed to delete withdrawal");
                return;
            }

            showToast(data.message)
            loadWithdrawals()
        } catch (error) {
            console.error("Error deleting withdrawal", error)
        }
    }
})

loadWithdrawals()