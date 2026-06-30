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

// Get user ID from URL or session storage
const params = new URLSearchParams(window.location.search);
const userId = params.get("id") || sessionStorage.getItem("userId");

if (!userId) {
    showToast("No user selected");
    window.location.href = "/admin/manage-users.html";
}


const getUserInvestments = async () => {
    try {
        const res = await fetch(`${API_URL}/api/admin/users/${userId}/investments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${Auth.getToken()}`,
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch investments: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const invData = data.userInvestments;
        const investor = data.user.userName || 'User'; 
        
        console.log('User Investments:', invData);

        const investorName = document.getElementById("investor-name");
        if (investorName) {
            investorName.textContent = investor;
        }

         tbBody.innerHTML = '';

        if (!invData || invData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No Investment found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        invData.forEach(inv => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${inv.plan.name}</td>
                <td>$${inv.amountInvested.toFixed(2)}</td>
                <td>${inv.status}</td>
                <td>${inv.plan.duration > 1 ? `${inv.plan.duration} days` : `${inv.plan.duration} day`}</td>
                <td>${new Date(inv.startDate).toLocaleDateString()}</td>
                <td>${new Date(inv.endDate).toLocaleDateString()}</td>
                <td class="action-btns">
                    ${inv.status === "active" ? `
                        <button class="complete-btn" data-id="${inv._id}">Mark as complete</button>
                        <button class="cancel-btn" data-id="${inv._id}">Cancel Investment</button>
                        ` : ""
                    }
                    <button class="del-btn" data-id="${inv._id}">Delete Plan</button> 
                </td>
            `;
            tbBody.appendChild(tr);
        });

        // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);

    } catch (error) {
        console.error('Error fetching user investments:', error);
    } finally {
        hideLoader();
    }
}

// user investment button actins
tbBody.addEventListener('click', async (e) => {

    // COMPLETE INVESTMENT
    const completeBtn = e.target.closest('.complete-btn');

    if (completeBtn) {
        const invId = completeBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to mark this investment as complete?'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/investments/${invId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Failed to complete investment', 'error');
                return;
            }

            showToast('Investment marked as complete', 'success');
            getUserInvestments();

        } catch (error) {
            console.error('Error completing investment:', error);
            showToast('Error completing investment', 'error');
        }

        return;
    }

    // CANCEL INVESTMENT
    const cancelBtn = e.target.closest('.cancel-btn');

    if (cancelBtn) {
        const invId = cancelBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to cancel this investment?'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/investments/${invId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Failed to cancel investment', 'error');
                return;
            }

            showToast('Investment cancelled', 'success');
            getUserInvestments();

        } catch (error) {
            console.error('Error cancelling investment:', error);
            showToast('Error cancelling investment', 'error');
        }

        return;
    }

    // DELETE INVESTMENT
    const deleteBtn = e.target.closest('.del-btn');

    if (deleteBtn) {
        const invId = deleteBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to delete this investment? This action cannot be undone.'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/investments/${invId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`
                }
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.message || 'Failed to delete investment', 'error');
                return;
            }

            showToast('Investment deleted', 'success');
            getUserInvestments();

        } catch (error) {
            console.error('Error deleting investment:', error);
            showToast('Error deleting investment', 'error');
        }

        return;
    }

});

getUserInvestments();