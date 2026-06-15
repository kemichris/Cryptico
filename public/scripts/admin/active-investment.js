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

const getActiveInvestments = async () => {
    try {
        const res = await fetch('/api/admin/investments/active', {
            headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const data = await res.json()
        const invData = data.activeInvestments;
        console.log('Active investment data:', invData);


        tbBody.innerHTML = '';

        // handle empty state
        if (!invData || invData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No Active investment found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        invData.forEach((inv) => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${inv.clientName}</td>
                <td>${inv.planName}</td>
                <td>$${inv.amountInvested}</td>
                <td>${inv.duration} days</td>
                <td>${inv.roi}</td>
                <td>${new Date(inv.startDate).toLocaleDateString()}</td>
                <td>${new Date(inv.endDate).toLocaleDateString()}</td>
                <td class="action-btns">
                    <button class="complete-btn" data-id="${inv.id}">Mark as complete</button>
                    <button class="cancel-btn" data-id="${inv.id}">Cancel Investment</button>
                    <button class="del-btn" data-id="${inv.id}">Delete Plan</button> 
                </td>
            `;
            tbBody.appendChild(tr);
        })

        // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);

    } catch (error) {
        console.error('Error fetching active investments:', error);
    } finally {
        hideLoader();
    }
}

tbBody.addEventListener('click', async (e) => {

    const completeBtn = e.target.closest('.complete-btn');

    if (completeBtn) {
        const invId = completeBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to mark this investment as complete?'
        );

        if (!confirmed) return;

        
        try {
            const res = await fetch(`/api/admin/investments/${invId}/complete`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`,
                }
            });

            if (!res.ok) {
                throw new Error(`Failed to complete investment: ${res.status} ${res.statusText}`);
            }

            showToast('Investment marked as complete');
            getUserInvestments();
        } catch (error) {
            console.error('Error completing investment:', error);
        }
        return;
    }

    const cancelBtn = e.target.closest('.cancel-btn');

    if (cancelBtn) {
        const invId = cancelBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to cancel this investment?'
        );

        if (!confirmed) return;

        try {
            const res = await fetch(`/api/admin/investments/${invId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`,
                }
            });

            if (!res.ok) {
                throw new Error(`Failed to cancel investment: ${res.status} ${res.statusText}`);
            }

            alert('Investment cancelled');
            getUserInvestments();
        } catch (error) {
            console.error('Error cancelling investment:', error);
        }
        return;
    }

    const deleteBtn = e.target.closest('.del-btn');

    if (deleteBtn) {
        const invId = deleteBtn.dataset.id;

        const confirmed = await showConfirm(
            'Are you sure you want to delete this investment?'
        );

        if (!confirmed) return;

         try {
            const res = await fetch(`/api/admin/investments/${invId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Auth.getToken()}`,
                }
            });

            if (!res.ok) {
                throw new Error(`Failed to delete investment: ${res.status} ${res.statusText}`);
            }

            alert('Investment deleted');
            getUserInvestments();
        } catch (error) {
            console.error('Error deleting investment:', error);
        }
        return;
    }
});

getActiveInvestments();