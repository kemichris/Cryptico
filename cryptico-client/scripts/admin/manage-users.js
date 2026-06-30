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

function maskEmail(email) {
    const [name, domain] = email.split('@');

    if (name.length <= 3) {
        return `${name[0]}***@${domain}`;
    }

    return `${name.slice(0, 2)}•••@${domain}`;
}

// FETCH USERS AND POPULATE TABLE
const loadUsers = async ()=> {
    try {
        const res = await fetch(`${API_URL}/api/admin/users", {
            headers: { Authorization: `Bearer ${Auth.getToken()}` }
        });
        
        if(!res.ok) {
            localStorage.clear();
            window.location.href = "/admin/login.html";
            return;
        }

        const data = await res.json();
        const users = data.allUsers;

        console.log("Users data:", users);

        tbBody.innerHTML = '';

        // handle empty state
        if (!users || users.length === 0) {
            tbBody.innerHTML = '<tr><td colspan="5" style="text-align:center">No Active users found</td></tr>';
            startIdxSpan.textContent = 0;
            endIdxSpan.textContent = 0;
            totalEntriesSpan.textContent = 0;
            return;
        }

        users.forEach((user) => {
            const tr = document.createElement('tr');
            tr.classList.add('tr');
            tr.innerHTML = `
                <td>${user.fullName}</td>
                <td>${maskEmail(user.email)}</td>
                <td>${user.balance.toFixed(2)}</td>
                <td>${user.country}</td>
                <td>${user.isActive ? 'Active' : 'Inactive'}</td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td><button class="manage-btn" data-user-id="${user._id}">Manage</button></td>
            `;
            tbBody.appendChild(tr);
        });

         // query rows AFTER building them
        const rows = document.querySelectorAll('.tr');

        // initialize pagination with real rows
        showPage(currentPage, rows);
        updatePaginationButtons(rows);
    } catch (error) {
        console.error("Error fetching users:", error);
    } finally {
        hideLoader();
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

// ADD NEW USERS POPUP 
const addUserBtn = document.getElementById("new-user-btn");
const newUserForm = document.getElementById("add-new-users");
const closeAddUser = document.getElementById("close-add-user");


addUserBtn.addEventListener("click", ()=> {
    newUserForm.classList.add("active")
});

closeAddUser.addEventListener("click", ()=> {
    newUserForm.classList.remove("active")
});

const addUserForm = document.getElementById("add-user-form");

addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(addUserForm);
    const userData = Object.fromEntries(formData.entries());

    try {
        const res = await fetch(`${API_URL}/api/admin/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify(userData)
        });

        if (!res.ok) {
            throw new Error("Failed to register user");
        }

        const data = await res.json();
        console.log("User registered successfully:", data);
        newUserForm.classList.remove("active");
        showToast("New user created")
        loadUsers(); // Refresh the users list
    } catch (error) {
        console.error("Error registering user:", error);
    }
});


loadUsers();