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



const getAdmins = async ()=> {
    try {
        const res = await fetch(`${API_URL}/api/admin/manage-admin", {
            headers: {
                "Authorization": `Bearer ${Auth.getToken()}`
            }
        });

        if (!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const adminData = await res.json()
        console.log("Admin data:", adminData);

        tbBody.innerHTML = '';

        // handle empty state
        if (!adminData || adminData.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No admin found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        adminData.forEach(admin => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${admin.fullName}</td>
                <td>${admin.email}</td>
                <td>${admin.phoneNumber}</td>
                <td>${admin.role}</td>
                <td>${admin.isActive ? 'Active' : 'Inactive'}</td>
                <td><button class="manage-btn" data-user-id="${admin._id}">Manage</button></td>
            `;
            tbBody.appendChild(tr);
        });

         // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);

    } catch (error) {
        console.error(error)
    }finally {
        hideLoader()
    }
}

// handle manage button click using event delegation
tbBody.addEventListener('click', (e) => {
    const manageBtn = e.target.closest('.manage-btn');

    if (manageBtn) {
        const userId = manageBtn.dataset.userId;
        sessionStorage.setItem("userId", userId);
        window.location.href = `/admin/user-details.html?id=${userId}`;
    }
});

getAdmins()